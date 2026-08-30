import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileContactBar } from "@/components/mobile-contact-bar";
import { Button } from "@/components/ui/button";
import { SHOWROOM } from "@/lib/showroom";

const TITLE = `About ${SHOWROOM.name} — Honda Two-Wheeler Dealership`;
const DESCRIPTION = `Learn about ${SHOWROOM.name}, an authorised Honda two-wheeler dealership serving riders since ${SHOWROOM.established} with sales, service and finance under one roof.`;

export const Route = createFileRoute("/about")({
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
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen pb-14 md:pb-0">
      <SiteHeader />

      <main>
        <section className="border-b border-border bg-secondary py-12">
          <div className="container-page">
            <p className="eyebrow">About our showroom</p>
            <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
              A Honda dealership built on repeat customers
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">{SHOWROOM.about.intro}</p>
          </div>
        </section>

        <section className="container-page grid items-start gap-10 py-14 lg:grid-cols-2">
          <img
            src="/images/demo/showroom-interior.jpg"
            alt={`Display floor at ${SHOWROOM.name}`}
            loading="lazy"
            width={1600}
            height={1000}
            className="rounded-2xl object-cover shadow-card"
          />
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-3xl font-bold uppercase tracking-wide">Our story</h2>
              <p className="mt-3 text-muted-foreground">{SHOWROOM.about.history}</p>
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold uppercase tracking-wide">
                Our promise to you
              </h2>
              <p className="mt-3 text-muted-foreground">{SHOWROOM.about.promise}</p>
            </div>
            <dl className="grid grid-cols-2 gap-6 border-t border-border pt-6">
              {SHOWROOM.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block font-display text-3xl font-bold text-primary">
                      {stat.value}
                    </span>
                    <span className="mt-1 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="bg-secondary py-14">
          <div className="container-page">
            <p className="eyebrow">Why choose us</p>
            <h2 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight">
              What you get when you buy from us
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SHOWROOM.whyChooseUs.map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-display text-xl font-bold uppercase tracking-wide">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container-page py-14">
          <div className="flex flex-col items-start gap-6 rounded-2xl bg-ink p-8 text-ink-foreground sm:p-12 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold uppercase tracking-wide">
                Visit us this week
              </h2>
              <address className="mt-2 not-italic opacity-80">
                {SHOWROOM.addressLines.join(", ")}
              </address>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={`tel:${SHOWROOM.phone}`}>
                  <Phone /> Call showroom
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-ink-foreground hover:bg-white/10 hover:text-ink-foreground"
              >
                <Link to="/contact">
                  <MapPin /> Directions & enquiry <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <MobileContactBar />
    </div>
  );
}
