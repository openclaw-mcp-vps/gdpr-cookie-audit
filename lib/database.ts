import { promises as fs } from "node:fs";
import path from "node:path";
import { PurchaseRecord, ScanHistoryRecord } from "@/lib/types";

const dataDir = path.join(process.cwd(), ".data");
const purchasesFile = path.join(dataDir, "purchases.json");
const scansFile = path.join(dataDir, "scans.json");

async function ensureDir(): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  await ensureDir();
  try {
    const contents = await fs.readFile(filePath, "utf8");
    return JSON.parse(contents) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(filePath: string, value: T): Promise<void> {
  await ensureDir();
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

export async function getPurchases(): Promise<PurchaseRecord[]> {
  return readJsonFile<PurchaseRecord[]>(purchasesFile, []);
}

export async function upsertPurchase(record: PurchaseRecord): Promise<void> {
  const existing = await getPurchases();
  const next = existing.filter((item) => item.email.toLowerCase() !== record.email.toLowerCase());
  next.push(record);
  await writeJsonFile(purchasesFile, next);
}

export async function findActivePurchaseByEmail(email: string): Promise<PurchaseRecord | null> {
  const purchases = await getPurchases();
  return (
    purchases.find(
      (purchase) =>
        purchase.email.toLowerCase() === email.toLowerCase() && purchase.status === "active"
    ) ?? null
  );
}

export async function saveScanHistory(record: ScanHistoryRecord): Promise<void> {
  const existing = await readJsonFile<ScanHistoryRecord[]>(scansFile, []);
  existing.push(record);
  await writeJsonFile(scansFile, existing.slice(-200));
}

export async function getScanHistoryByOwner(ownerEmail: string): Promise<ScanHistoryRecord[]> {
  const existing = await readJsonFile<ScanHistoryRecord[]>(scansFile, []);
  return existing
    .filter((record) => record.ownerEmail.toLowerCase() === ownerEmail.toLowerCase())
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
