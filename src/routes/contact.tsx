import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileContactBar } from "@/components/mobile-contact-bar";
import { EnquiryForm } from "@/components/enquiry-form";
import { SHOWROOM, waLink } from "@/lib/showroom";

const TITLE = `Contact ${SHOWROOM.name} — Phone, WhatsApp & Enquiry Form`;
const DESCRIPTION = `Contact our Honda showroom by phone, WhatsApp or email, check business hours and location, or send an enquiry about any model.`;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen pb-14 md:pb-0">
      <SiteHeader />

      <main>
        <section className="border-b border-border bg-secondary py-12">
          <div className="container-page">
            <p className="eyebrow">Contact us</p>
            <h1 className="mt-2 font-display text-4xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
              Talk to our showroom team
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Call, message or send an enquiry — we reply during showroom hours. Contact details below
              are demo data.
            </p>
          </div>
        </section>

        <section className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-4">
            <ContactTile
              icon={<Phone className="size-5" />}
              label="Phone"
              value={SHOWROOM.phoneDisplay}
              href={`tel:${SHOWROOM.phone}`}
            />
            <ContactTile
              icon={<MessageCircle className="size-5" />}
              label="WhatsApp"
              value="Chat with us instantly"
              href={waLink(`Hello ${SHOWROOM.name}, I have an enquiry.`)}
              external
            />
            <ContactTile
              icon={<Mail className="size-5" />}
              label="Email"
              value={SHOWROOM.email}
              href={`mailto:${SHOWROOM.email}`}
            />
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <MapPin className="size-5" />
                </span>
                <h2 className="font-display text-lg font-bold uppercase tracking-wide">Address</h2>
              </div>
              <address className="mt-3 not-italic text-sm text-muted-foreground">
                {SHOWROOM.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Clock className="size-5" />
                </span>
                <h2 className="font-display text-lg font-bold uppercase tracking-wide">
                  Business hours
                </h2>
              </div>
              <dl className="mt-3 space-y-1.5 text-sm">
                {SHOWROOM.hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{h.days}</dt>
                    <dd className="font-semibold">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide">
              Send an enquiry
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell us which model you are interested in and we will get back to you.
            </p>
            <div className="mt-6">
              <EnquiryForm />
            </div>
          </div>
        </section>

        <section className="container-page pb-16">
          <h2 className="font-display text-3xl font-bold uppercase tracking-wide">Find the showroom</h2>
          <div className="mt-5 overflow-hidden rounded-2xl border border-border">
            <iframe
              title={`Map showing ${SHOWROOM.name} location`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(SHOWROOM.mapEmbedQuery)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-80 w-full border-0 sm:h-[26rem]"
            />
          </div>
        </section>
      </main>

      <SiteFooter />
      <MobileContactBar />
    </div>
  );
}

function ContactTile({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
    >
      <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </span>
      <span>
        <span className="block font-display text-lg font-bold uppercase tracking-wide">{label}</span>
        <span className="block text-sm text-muted-foreground">{value}</span>
      </span>
    </a>
  );
}
