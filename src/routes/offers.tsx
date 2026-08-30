import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgePercent, CalendarDays, Bike, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileContactBar } from "@/components/mobile-contact-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { offersQuery } from "@/lib/catalogue";
import { SHOWROOM, waLink } from "@/lib/showroom";

const TITLE = `Current Honda Offers & Finance Deals — ${SHOWROOM.name}`;
const DESCRIPTION =
  "See the offers running at our Honda showroom: seasonal benefits, exchange bonus, low down payment finance and free first service.";

export const Route = createFileRoute("/offers")({
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
  component: OffersPage,
});

function OffersPage() {
  const { data, isLoading, isError } = useQuery(offersQuery);
  const offers = (data ?? []).filter((o) => o.is_active);

  return (
    <div className="min-h-screen pb-14 md:pb-0">
      <SiteHeader />

      <main>
        <section className="border-b border-border bg-secondary py-12">
          <div className="container-page">
            <p className="eyebrow">Promotions</p>
            <h1 className="mt-2 font-display text-4xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
              Current showroom offers
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Demo offers for development. Terms and exact benefits are confirmed at the showroom and
              may change without notice.
            </p>
          </div>
        </section>

        <section className="container-page py-12">
          <div className="grid gap-6 md:grid-cols-2">
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}

            {offers.map((offer) => (
              <article
                key={offer.id}
                className="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <BadgePercent className="size-5" />
                  </span>
                  <span className="rounded-full bg-primary px-3 py-1 font-display text-xs font-bold uppercase tracking-wide text-primary-foreground">
                    {offer.benefit}
                  </span>
                </div>
                <h2 className="mt-5 font-display text-3xl font-bold uppercase leading-none tracking-wide">
                  {offer.title}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">{offer.description}</p>

                <dl className="mt-5 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Bike className="size-4 text-primary" />
                    <dt className="sr-only">Applicable vehicles</dt>
                    <dd>{offer.applicable_vehicles || "Selected models"}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-primary" />
                    <dt className="sr-only">Valid until</dt>
                    <dd>
                      {offer.valid_until
                        ? `Valid until ${new Date(offer.valid_until).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}`
                        : "Limited period offer"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-wrap gap-3 pt-2">
                  <Button asChild>
                    <Link to="/contact">Claim this offer</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <a
                      href={waLink(`Hello ${SHOWROOM.name}, I would like details on the "${offer.title}" offer.`)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle /> WhatsApp
                    </a>
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {isError && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-muted-foreground">
              We could not load offers right now. Please call the showroom for running promotions.
            </p>
          )}

          {!isLoading && !isError && offers.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <h2 className="font-display text-2xl font-bold uppercase">No offers right now</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                New promotions are added regularly. Contact us to know about current benefits.
              </p>
              <Button asChild className="mt-6">
                <Link to="/contact">Contact showroom</Link>
              </Button>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
      <MobileContactBar />
    </div>
  );
}
