/**
 * ============================================================
 * DEMO SHOWROOM CONTENT — replace with the real showroom details.
 * Every value below is placeholder content for development.
 * ============================================================
 */
export const SHOWROOM = {
  isDemoContent: true,
  name: "Sai Honda",
  tagline: "Authorised Honda Two-Wheeler Dealership (DEMO)",
  shortDescription:
    "Explore Honda scooters and motorcycles available at our showroom. Check models, variants and availability, and get in touch with our team.",
  phoneDisplay: "+91 98765 43210",
  phone: "+919876543210",
  whatsapp: "919876543210",
  email: "sales@saihonda-demo.in",
  addressLines: ["Plot 14, MG Road", "Near City Bus Stand", "Pune, Maharashtra 411001"],
  mapEmbedQuery: "MG Road Pune Maharashtra",
  hours: [
    { days: "Monday – Saturday", time: "9:30 AM – 8:00 PM" },
    { days: "Sunday", time: "10:00 AM – 6:00 PM" },
    { days: "Public Holidays", time: "Closed" },
  ],
  established: "2009",
  stats: [
    { value: "15+", label: "Years serving riders" },
    { value: "25,000+", label: "Happy customers" },
    { value: "12", label: "Trained technicians" },
    { value: "4.7★", label: "Average customer rating" },
  ],
  about: {
    intro:
      "DEMO CONTENT. We are a family-run authorised Honda two-wheeler dealership serving the city and nearby towns. From your first test ride to every service after it, our team is here to keep you moving.",
    history:
      "DEMO CONTENT. Started in 2009 as a single-counter outlet, the showroom has grown into a full sales, service and spares facility with a dedicated delivery bay and an in-house finance desk.",
    promise:
      "DEMO CONTENT. Transparent on-road pricing, no forced accessory bundles, and honest advice on which model actually fits your daily riding. That is the only way we like to sell a two-wheeler.",
  },
  whyChooseUs: [
    {
      title: "Genuine Honda stock",
      description: "DEMO: Every vehicle is sourced through authorised channels with full warranty support.",
    },
    {
      title: "Live availability",
      description: "DEMO: We keep model availability updated so you know before you visit.",
    },
    {
      title: "In-house finance desk",
      description: "DEMO: Easy EMI and low down payment options with multiple finance partners.",
    },
    {
      title: "Trained service team",
      description: "DEMO: Honda-trained technicians and genuine spare parts under one roof.",
    },
    {
      title: "Free test rides",
      description: "DEMO: Ride the model you like before you decide. No appointment needed.",
    },
    {
      title: "Fast documentation",
      description: "DEMO: Registration, insurance and paperwork handled at the showroom.",
    },
  ],
} as const;

export const CATEGORIES = [
  {
    value: "scooter",
    label: "Scooters",
    description: "Automatic, easy to ride and built for everyday city use.",
    image: "/images/demo/activa-6g.jpg",
  },
  {
    value: "motorcycle",
    label: "Motorcycles",
    description: "Commuter and sporty motorcycles for longer, faster rides.",
    image: "/images/demo/sp-125.jpg",
  },
] as const;

export const categoryLabel = (value: string) =>
  CATEGORIES.find((c) => c.value === value)?.label ?? value;

export const waLink = (message: string) =>
  `https://wa.me/${SHOWROOM.whatsapp}?text=${encodeURIComponent(message)}`;

export const formatPrice = (value: number | null | undefined) =>
  value == null
    ? "Price on request"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value);
