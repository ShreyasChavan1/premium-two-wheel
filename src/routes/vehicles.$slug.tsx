import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileContactBar } from "@/components/mobile-contact-bar";
import { AvailabilityBadge } from "@/components/availability-badge";
import { EnquiryForm } from "@/components/enquiry-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { vehicleQuery, variantsQuery } from "@/lib/catalogue";
import { SHOWROOM, categoryLabel, formatPrice, waLink } from "@/lib/showroom";

export const Route = createFileRoute("/vehicles/$slug")({
  head: ({ params }) => {
    const model = params.slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    const title = `Honda ${model} — Price, Variants & Availability | ${SHOWROOM.name}`;
    const description = `Honda ${model} details at ${SHOWROOM.name}: starting price, variants, colours, key specifications and current showroom availability.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: VehicleDetailPage,
});

function VehicleDetailPage() {
  const { slug } = Route.useParams();
  const { data: vehicle, isLoading, isError } = useQuery(vehicleQuery(slug));
  const { data: variants } = useQuery(variantsQuery(vehicle?.id));
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [colourId, setColourId] = useState<string | null>(null);

  const variantList = variants ?? [];
  const variant = variantList.find((item) => item.id === variantId) ?? variantList[0] ?? null;
  const colours = variant?.colours ?? [];
  const colour = colours.find((item) => item.id === colourId) ?? colours[0] ?? null;

  const generalImages = vehicle ? [vehicle.image_url, ...vehicle.gallery].filter(Boolean) : [];
  const images =
    colour && colour.images.length > 0 ? colour.images.filter(Boolean) : generalImages;
  const shown = (activeImage && images.includes(activeImage) ? activeImage : images[0]) as
    | string
    | undefined;

  const exShowroom = variant
    ? variant.ex_showroom_price ?? variant.price
    : vehicle?.price_from ?? null;
  const onRoad = variant?.on_road_price ?? null;
  const specs = variant && Object.keys(variant.specs).length > 0 ? variant.specs : vehicle?.specs ?? {};
  const available = variant ? variant.is_available : Boolean(vehicle?.is_available);


  return (
    <div className="min-h-screen pb-14 md:pb-0">
      <SiteHeader />

      <main className="container-page py-8">
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Back to catalogue
        </Link>

        {isLoading && (
          <div className="mt-6 grid gap-10 lg:grid-cols-2">
            <Skeleton className="aspect-4/3 rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        )}

        {isError && (
          <p className="mt-10 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-muted-foreground">
            We could not load this model. Please refresh or call the showroom.
          </p>
        )}

        {!isLoading && !isError && !vehicle && (
          <div className="mt-10 rounded-xl border border-border bg-card p-10 text-center">
            <h1 className="font-display text-3xl font-bold uppercase">Model not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This model is not listed at our showroom.
            </p>
            <Button asChild className="mt-6">
              <Link to="/vehicles">Browse all vehicles</Link>
            </Button>
          </div>
        )}

        {vehicle && (
          <>
            <div className="mt-6 grid gap-10 lg:grid-cols-2">
              <div>
                <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
                  <img
                    src={shown}
                    alt={`Honda ${vehicle.name} — ${categoryLabel(vehicle.category)}`}
                    width={1200}
                    height={900}
                    className="aspect-4/3 w-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="mt-3 flex gap-3">
                    {images.map((image) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setActiveImage(image)}
                        className={
                          "h-20 w-24 overflow-hidden rounded-lg border-2 " +
                          (shown === image ? "border-primary" : "border-border")
                        }
                      >
                        <img
                          src={image}
                          alt={`${vehicle.name} photo`}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="eyebrow">{categoryLabel(vehicle.category)}</p>
                <h1 className="mt-2 font-display text-5xl font-bold uppercase leading-none tracking-tight">
                  Honda {vehicle.name}
                </h1>
                <div className="mt-4">
                  <AvailabilityBadge available={available} size="lg" />
                </div>
                <p className="mt-5 text-muted-foreground">{vehicle.short_description}</p>

                {variantList.length > 0 && (
                  <div className="mt-6">
                    <h2 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      Variants
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {variantList.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setVariantId(item.id);
                            setColourId(null);
                            setActiveImage(null);
                          }}
                          className={
                            "rounded-full border px-4 py-2 text-sm font-semibold transition-colors " +
                            (variant?.id === item.id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card hover:border-primary")
                          }
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {colours.length > 0 && (
                  <div className="mt-6">
                    <h2 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      Available colours
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {colours.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setColourId(item.id);
                            setActiveImage(null);
                          }}
                          className={
                            "rounded-full border px-4 py-2 text-sm font-medium transition-colors " +
                            (colour?.id === item.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card hover:border-primary")
                          }
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 rounded-xl border border-border bg-card p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        Ex-showroom price
                      </p>
                      <p className="font-display text-4xl font-bold">{formatPrice(exShowroom)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        On-road price
                      </p>
                      <p className="font-display text-4xl font-bold">{formatPrice(onRoad)}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">{EMI_DISCLAIMER}</p>
                </div>

                {variant && (
                  <EmiCalculator
                    key={variant.id}
                    onRoadPrice={onRoad}
                    options={variant.emi_options}
                  />
                )}

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <Button asChild size="lg">
                    <a href={`tel:${SHOWROOM.phone}`}>
                      <Phone /> Call
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="secondary">
                    <a
                      href={waLink(
                        `Hello ${SHOWROOM.name}, I am interested in the Honda ${vehicle.name}${
                          variant ? ` ${variant.name}` : ""
                        }${colour ? ` in ${colour.name}` : ""}. Is it available?`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle /> WhatsApp
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <a href="#enquire">Enquire</a>
                  </Button>
                </div>
              </div>

            </div>

            <section className="mt-14 grid gap-10 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-3xl font-bold uppercase tracking-wide">
                  About this model
                </h2>
                <p className="mt-4 text-muted-foreground">{vehicle.description}</p>
              </div>
              <div>
                <h2 className="font-display text-3xl font-bold uppercase tracking-wide">
                  Key specifications
                </h2>
                <dl className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-6 px-5 py-3 text-sm">
                      <dt className="text-muted-foreground">{key}</dt>
                      <dd className="text-right font-semibold">{String(value)}</dd>
                    </div>
                  ))}
                  {Object.keys(specs).length === 0 && (
                    <p className="px-5 py-4 text-sm text-muted-foreground">
                      Specifications will be updated shortly.
                    </p>
                  )}
                </dl>
              </div>
            </section>

            <section id="enquire" className="mt-16 rounded-2xl border border-border bg-secondary p-6 sm:p-10">
              <p className="eyebrow">Enquire about this model</p>
              <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide">
                Ask us about the Honda {vehicle.name}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Send us your details and our team will call you back with price, availability and test
                ride options.
              </p>
              <div className="mt-8 max-w-3xl">
                <EnquiryForm defaultVehicle={variant ? `${vehicle.name} ${variant.name}` : vehicle.name} />
              </div>
            </section>
          </>
        )}
      </main>

      <SiteFooter />
      <MobileContactBar />
    </div>
  );
}
