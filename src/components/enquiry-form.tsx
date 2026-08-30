import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { vehiclesQuery } from "@/lib/catalogue";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^[0-9+\-\s()]+$/, "Phone number can only contain digits and + - ( )"),
  email: z.union([z.string().trim().email("Enter a valid email").max(255), z.literal("")]),
  vehicle_interest: z.string().trim().max(120),
  message: z.string().trim().max(1000),
});

type Fields = z.infer<typeof schema>;

const EMPTY: Fields = { name: "", phone: "", email: "", vehicle_interest: "", message: "" };

export function EnquiryForm({ defaultVehicle }: { defaultVehicle?: string }) {
  const [fields, setFields] = useState<Fields>({
    ...EMPTY,
    vehicle_interest: defaultVehicle ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const { data: vehicles } = useQuery(vehiclesQuery);

  const mutation = useMutation({
    mutationFn: async (values: Fields) => {
      const { error } = await supabase.from("enquiries").insert({
        name: values.name,
        phone: values.phone,
        email: values.email || null,
        vehicle_interest: values.vehicle_interest || null,
        message: values.message,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => setFields({ ...EMPTY, vehicle_interest: defaultVehicle ?? "" }),
  });

  const set = (key: keyof Fields) => (value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse(fields);
    if (!parsed.success) {
      const next: Partial<Record<keyof Fields, string>> = {};
      for (const issue of parsed.error.issues) {
        next[issue.path[0] as keyof Fields] = issue.message;
      }
      setErrors(next);
      return;
    }
    mutation.mutate(parsed.data);
  };

  if (mutation.isSuccess) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/8 p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-success" />
        <h3 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide">
          Enquiry sent
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you. Our team will get back to you shortly during showroom hours.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => mutation.reset()}>
          Send another enquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Your name" error={errors.name}>
          <Input
            id="name"
            value={fields.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder="Rahul Sharma"
            autoComplete="name"
            className="h-12"
          />
        </Field>
        <Field id="phone" label="Phone number" error={errors.phone}>
          <Input
            id="phone"
            value={fields.phone}
            onChange={(e) => set("phone")(e.target.value)}
            placeholder="+91 98765 43210"
            inputMode="tel"
            autoComplete="tel"
            className="h-12"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="email" label="Email (optional)" error={errors.email}>
          <Input
            id="email"
            value={fields.email}
            onChange={(e) => set("email")(e.target.value)}
            placeholder="you@example.com"
            inputMode="email"
            autoComplete="email"
            className="h-12"
          />
        </Field>
        <Field id="vehicle_interest" label="Interested vehicle" error={errors.vehicle_interest}>
          <select
            id="vehicle_interest"
            value={fields.vehicle_interest}
            onChange={(e) => set("vehicle_interest")(e.target.value)}
            className="h-12 w-full rounded-md border border-input bg-background px-3 text-base"
          >
            <option value="">Not decided yet</option>
            {(vehicles ?? []).map((v) => (
              <option key={v.id} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="message" label="Message" error={errors.message}>
        <Textarea
          id="message"
          value={fields.message}
          onChange={(e) => set("message")(e.target.value)}
          rows={4}
          placeholder="Tell us what you would like to know — price, availability, test ride, finance…"
        />
      </Field>

      {mutation.isError && (
        <p className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          We could not send your enquiry. Please try again or call the showroom.
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
        <Send /> {mutation.isPending ? "Sending…" : "Send Enquiry"}
      </Button>
      <p className="text-xs text-muted-foreground">
        We use your details only to respond to this enquiry. No account is created.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
