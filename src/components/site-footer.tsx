import { Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SHOWROOM, waLink } from "@/lib/showroom";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink text-ink-foreground">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-bold uppercase tracking-wide">{SHOWROOM.name}</p>
          <p className="mt-3 max-w-xs text-sm opacity-75">{SHOWROOM.shortDescription}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-primary">Demo content</p>
        </div>

        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.16em] opacity-60">
            Browse
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/vehicles" className="opacity-85 hover:text-primary">
                All Vehicles
              </Link>
            </li>
            <li>
              <Link to="/vehicles" search={{ category: "scooter" }} className="opacity-85 hover:text-primary">
                Scooters
              </Link>
            </li>
            <li>
              <Link
                to="/vehicles"
                search={{ category: "motorcycle" }}
                className="opacity-85 hover:text-primary"
              >
                Motorcycles
              </Link>
            </li>
            <li>
              <Link to="/offers" className="opacity-85 hover:text-primary">
                Current Offers
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.16em] opacity-60">
            Showroom
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/about" className="opacity-85 hover:text-primary">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="opacity-85 hover:text-primary">
                Contact & Enquiry
              </Link>
            </li>
            <li>
              <Link to="/admin" className="opacity-60 hover:text-primary">
                Staff Login
              </Link>
            </li>
          </ul>
          <div className="mt-5 space-y-1 text-sm opacity-75">
            {SHOWROOM.hours.map((h) => (
              <p key={h.days}>
                {h.days}: {h.time}
              </p>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.16em] opacity-60">
            Reach Us
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <address className="not-italic opacity-85">
                {SHOWROOM.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </li>
            <li className="flex gap-3">
              <Phone className="size-4 shrink-0 text-primary" />
              <a href={`tel:${SHOWROOM.phone}`} className="opacity-85 hover:text-primary">
                {SHOWROOM.phoneDisplay}
              </a>
            </li>
            <li className="flex gap-3">
              <MessageCircle className="size-4 shrink-0 text-primary" />
              <a
                href={waLink("Hello, I would like to know more about Honda two-wheelers.")}
                target="_blank"
                rel="noreferrer"
                className="opacity-85 hover:text-primary"
              >
                WhatsApp us
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="size-4 shrink-0 text-primary" />
              <a href={`mailto:${SHOWROOM.email}`} className="opacity-85 hover:text-primary">
                {SHOWROOM.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs opacity-60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SHOWROOM.name}. Independent authorised dealership (demo site).
          </p>
          <p>All vehicles, prices and offers shown are demo data.</p>
        </div>
      </div>
    </footer>
  );
}
