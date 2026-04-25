"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Globe, Loader2, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  url: z
    .string()
    .min(4, "Enter a valid website URL")
    .regex(/^(https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}/i, "Enter a valid website URL")
});

type ScanFormValues = z.infer<typeof schema>;

type ScanFormProps = {
  onScan: (url: string) => Promise<void>;
  loading: boolean;
};

export function ScanForm({ onScan, loading }: ScanFormProps): React.JSX.Element {
  const form = useForm<ScanFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      url: ""
    }
  });

  const submit = form.handleSubmit(async (values) => {
    await onScan(values.url);
  });

  return (
    <form onSubmit={submit} className="rounded-2xl border border-[#30363d] bg-[#111827] p-4 sm:p-6">
      <div className="flex items-center gap-2 text-slate-100">
        <ScanSearch className="h-5 w-5 text-[#58a6ff]" />
        <h2 className="text-lg font-semibold">Run Live Website Scan</h2>
      </div>

      <p className="mt-2 text-sm text-slate-400">
        The scanner loads your site, inspects scripts and cookies, then maps issues to GDPR consent requirements.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Globe className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <Input
            className="pl-9"
            placeholder="https://yourdomain.eu"
            autoComplete="off"
            {...form.register("url")}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning...
            </span>
          ) : (
            "Scan Site"
          )}
        </Button>
      </div>

      {form.formState.errors.url && (
        <p className="mt-2 text-xs text-red-400">{form.formState.errors.url.message}</p>
      )}
    </form>
  );
}
