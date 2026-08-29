import { MessageCircle, Phone } from "lucide-react";
import { SHOWROOM, waLink } from "@/lib/showroom";

/** Sticky call / WhatsApp actions — mobile only. */
export function MobileContactBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <a
        href={`tel:${SHOWROOM.phone}`}
        className="flex min-h-14 items-center justify-center gap-2 font-display text-base font-semibold uppercase tracking-wide text-foreground"
      >
        <Phone className="size-4 text-primary" /> Call
      </a>
      <a
        href={waLink(`Hello ${SHOWROOM.name}, I have an enquiry about a Honda two-wheeler.`)}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-14 items-center justify-center gap-2 bg-primary font-display text-base font-semibold uppercase tracking-wide text-primary-foreground"
      >
        <MessageCircle className="size-4" /> WhatsApp
      </a>
    </div>
  );
}
