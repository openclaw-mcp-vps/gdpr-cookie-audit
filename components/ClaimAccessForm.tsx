"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().email("Enter the email used during checkout")
});

type ClaimFormValues = z.infer<typeof schema>;

export function ClaimAccessForm(): React.JSX.Element {
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setMessage("");
    setError("");

    const response = await fetch("/api/access/claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const data = (await response.json()) as { message?: string; error?: string };

    if (!response.ok) {
      setError(data.error ?? "Could not validate your purchase yet.");
      return;
    }

    setMessage(data.message ?? "Access unlocked. Refreshing...");
    window.location.reload();
  });

  return (
    <form className="mt-4 space-y-3" onSubmit={onSubmit}>
      <label htmlFor="claim-email" className="text-sm font-medium text-slate-200">
        Purchase Email
      </label>
      <Input id="claim-email" type="email" placeholder="you@company.eu" {...form.register("email")} />
      {form.formState.errors.email && (
        <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
      )}
      {message && <p className="text-xs text-emerald-400">{message}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Validating purchase..." : "Unlock Dashboard"}
      </Button>
    </form>
  );
}
