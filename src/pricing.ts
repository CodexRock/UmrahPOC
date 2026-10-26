import { z } from "zod";
import { convertMinor, hotelStays, type TripRequest } from "./contracts.js";
const Currency = z.enum(["EUR", "USD", "SAR", "GBP", "JPY"]);
const Decimal = z.string().regex(/^(0|[1-9]\d{0,14})(\.\d{1,12})?$/);
const Instant = z.iso.datetime({ offset: true });
const Supplier = z.enum(["Booking.com", "Trip.com", "eDreams", "Tripadvisor"]);
const domains: Record<string, string[]> = {
  "Booking.com": ["booking.com"],
  "Trip.com": ["trip.com"],
  eDreams: ["edreams.com"],
  Tripadvisor: ["tripadvisor.com"],
};
export function supplierURL(source: string, value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (domains[source] ?? []).some(
        (domain) =>
          url.hostname === domain || url.hostname.endsWith("." + domain),
      ) &&
      !Array.from(url.searchParams.keys()).some((k) =>
        /^(access_token|refresh_token|authorization|password|session_token|code)$/i.test(
          k,
        ),
      )
    );
  } catch {
    return false;
  }
}
const Provenance = z
  .strictObject({
    source: Supplier,
    tool: z.string().min(1).max(150),
    observedAt: Instant,
    evidenceId: z.string().min(1).max(100),
    url: z.string().max(16000),
    linkScope: z.enum(["offer", "property", "search"]),
  })
  .refine((p) => supplierURL(p.source, p.url), {
    message: "Unsafe supplier URL",
  });
const Price = z.strictObject({
  amount: Decimal,
  currency: Currency,
  basis: z.enum([
    "group_total",
    "per_adult",
    "stay_total",
    "room_night",
    "unknown",
  ]),
  taxes: z.enum(["included", "excluded", "unknown"]),
  membership: z.enum(["none", "required", "unknown"]),
});
export const OfferSchema = z.strictObject({
  id: z.string().min(1).max(150),
  kind: z.enum(["flight", "hotel"]),
  provenance: Provenance,
  price: Price,
  adults: z.number().int().positive(),
  rooms: z.number().int().positive().optional(),
  city: z.enum(["makkah", "madinah"]).optional(),
  checkIn: z.iso.date().optional(),
  checkOut: z.iso.date().optional(),
  originAirport: z.string().optional(),
  arrivalAirport: z.string().optional(),
  departureAirport: z.string().optional(),
  returnAirport: z.string().optional(),
  outboundDeparture: Instant.optional(),
  saudiArrival: Instant.optional(),
  saudiDeparture: Instant.optional(),
  checkedBaggage: z.enum(["included", "excluded", "unknown"]).optional(),
});
export type Offer = z.infer<typeof OfferSchema>;
export const RateSchema = z.strictObject({
  from: Currency,
  to: Currency,
  rate: Decimal,
  observedAt: Instant,
  source: z.literal("XE Currency Converter"),
  tool: z.literal("currency_converter"),
  evidenceId: z.string().min(1).max(100),
});
export type Rate = z.infer<typeof RateSchema>;
// Evidence is supplied by a trusted invocation boundary, never inferred from model prose.
export interface Evidence {
  id: string;
  source: string;
  tool: string;
  observedAt: string;
}
const digits = (currency: string) => (currency === "JPY" ? 0 : 2);
export function minor(amount: string, currency: string): bigint {
  if (!Decimal.safeParse(amount).success) throw Error("Invalid amount");
  const [whole, fraction = ""] = amount.split(".");
  const d = digits(currency);
  if (fraction.length > d && /[1-9]/.test(fraction.slice(d)))
    throw Error("Amount exceeds currency precision");
  return (
    BigInt(whole!) * 10n ** BigInt(d) +
    BigInt(fraction.slice(0, d).padEnd(d, "0") || "0")
  );
}
export function formatMinor(amount: bigint, currency: string) {
  const d = digits(currency);
  const text = amount.toString().padStart(d + 1, "0");
  return d ? text.slice(0, -d) + "." + text.slice(-d) : text;
}
function rational(decimal: string) {
  const [whole, fraction = ""] = decimal.split(".");
  const n = BigInt(whole! + fraction);
  if (n <= 0n) throw Error("Nonpositive rate");
  return [n, 10n ** BigInt(fraction.length)] as const;
}
function day(instant: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(instant));
}
export function assembleJourneys(
  request: TripRequest,
  rawOffers: unknown[],
  rawRates: unknown[],
  evidence: Evidence[],
  now = new Date(),
) {
  const rejected: { id: string; reason: string }[] = [],
    accepted: Offer[] = [];
  const verified = (p: Evidence | Offer["provenance"] | Rate) =>
    evidence.some(
      (e) =>
        e.id === ("evidenceId" in p ? p.evidenceId : p.id) &&
        e.source === p.source &&
        e.tool === p.tool &&
        e.observedAt === p.observedAt,
    ) &&
    Date.parse(p.observedAt) <= now.getTime() + 60000 &&
    now.getTime() - Date.parse(p.observedAt) <= 3600000;
  const seen = new Set<string>();
  for (const raw of rawOffers.slice(0, 60)) {
    const parsed = OfferSchema.safeParse(raw);
    if (!parsed.success) {
      rejected.push({
        id: "unvalidated",
        reason: "Invalid offer schema or supplier URL",
      });
      continue;
    }
    const offer = parsed.data,
      key = `${offer.provenance.source}:${offer.id}:${offer.checkIn ?? ""}:${offer.checkOut ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    let reason = "";
    if (!verified(offer.provenance))
      reason = "Missing, stale or mismatched invocation evidence";
    else if (offer.adults !== request.adults) reason = "Occupancy mismatch";
    else if (
      offer.price.basis === "unknown" ||
      offer.price.taxes !== "included" ||
      offer.price.membership !== "none"
    )
      reason = "Unknown price basis, unresolved taxes or restricted membership";
    else if (
      offer.kind === "flight" &&
      (!["group_total", "per_adult"].includes(offer.price.basis) ||
        offer.originAirport !== request.originAirport ||
        offer.returnAirport !== request.originAirport ||
        offer.arrivalAirport !== request.arrivalAirport ||
        offer.departureAirport !== request.departureAirport ||
        !offer.outboundDeparture ||
        !offer.saudiArrival ||
        !offer.saudiDeparture ||
        offer.outboundDeparture.slice(0, 10) !== request.outboundDate ||
        day(offer.saudiDeparture, "Asia/Riyadh") !== request.returnDate ||
        Date.parse(offer.saudiArrival) <= Date.parse(offer.outboundDeparture) ||
        Date.parse(offer.saudiDeparture) <= Date.parse(offer.saudiArrival))
    )
      reason = "Flight route/date mismatch or missing schedule";
    else if (
      offer.kind === "hotel" &&
      (!["stay_total", "room_night"].includes(offer.price.basis) ||
        offer.rooms !== request.rooms ||
        !offer.city ||
        !offer.checkIn ||
        !offer.checkOut ||
        offer.checkOut <= offer.checkIn)
    )
      reason = "Hotel dates, rooms or price basis mismatch";
    try {
      minor(offer.price.amount, offer.price.currency);
    } catch {
      reason = "Invalid currency precision";
    }
    if (reason) rejected.push({ id: offer.id, reason });
    else accepted.push(offer);
  }
  const rates = rawRates
    .map((r) => RateSchema.safeParse(r))
    .flatMap((r) =>
      r.success && verified(r.data) && r.data.rate !== "0" ? [r.data] : [],
    );
  const component = (offer: Offer) => {
    let original = minor(offer.price.amount, offer.price.currency);
    if (offer.price.basis === "per_adult") original *= BigInt(request.adults);
    if (offer.price.basis === "room_night")
      original *=
        BigInt(request.rooms) *
        BigInt(
          (Date.parse(offer.checkOut!) - Date.parse(offer.checkIn!)) / 86400000,
        );
    let converted = original,
      rate: Rate | undefined;
    if (offer.price.currency !== request.displayCurrency) {
      rate = rates.find(
        (r) =>
          r.from === offer.price.currency && r.to === request.displayCurrency,
      );
      if (!rate) throw Error("Missing verified XE conversion");
      const [n, d] = rational(rate.rate);
      converted = convertMinor(
        original,
        n,
        d,
        digits(offer.price.currency),
        digits(request.displayCurrency),
      );
    }
    return {
      offer,
      originalGroupAmount: formatMinor(original, offer.price.currency),
      convertedAmount: formatMinor(converted, request.displayCurrency),
      currency: request.displayCurrency,
      rate,
      minor: converted,
    };
  };
  const combinations: {
    key: string;
    components: ReturnType<typeof component>[];
    total: bigint;
    stays: ReturnType<typeof hotelStays>;
  }[] = [];
  for (const flight of accepted.filter((o) => o.kind === "flight")) {
    const stays = hotelStays(flight.saudiArrival!, request.cityOrder, {
      makkah: request.makkahNights,
      madinah: request.madinahNights,
    });
    // Same-day ground transfer and checkout/flight timing remain explicitly unverified.
    if (stays[1]!.checkOut > day(flight.saudiDeparture!, "Asia/Riyadh"))
      continue;
    const matching = stays.map((stay) =>
      accepted.filter(
        (o) =>
          o.kind === "hotel" &&
          o.city === stay.city &&
          o.checkIn === stay.checkIn &&
          o.checkOut === stay.checkOut,
      ),
    );
    for (const a of matching[0]!)
      for (const b of matching[1]!) {
        try {
          const components = [flight, a, b].map(component);
          combinations.push({
            key: [flight, a, b]
              .map((o) => o.provenance.source + ":" + o.id)
              .join("|"),
            components,
            total: components.reduce((sum, c) => sum + c.minor, 0n),
            stays,
          });
        } catch {
          /* Preserve originals in acceptedOffers; no invented converted total. */
        }
      }
  }
  combinations.sort((a, b) =>
    a.total < b.total ? -1 : a.total > b.total ? 1 : a.key.localeCompare(b.key),
  );
  const unique = [
    ...new Map(combinations.map((c) => [c.key, c])).values(),
  ].slice(0, 3);
  const journeys = unique.map((c, i) => ({
    id: `option-${i + 1}`,
    label: `Comparable option ${i + 1}`,
    stays: c.stays,
    components: c.components.map(({ minor: _, ...rest }) => rest),
    groupTotal: formatMinor(c.total, request.displayCurrency),
    averagePerAdult: formatMinor(
      (c.total + BigInt(Math.floor(request.adults / 2))) /
        BigInt(request.adults),
      request.displayCurrency,
    ),
    currency: request.displayCurrency,
    scope: "flights + two hotel stays",
    exclusions: ["ground transport", "visa", "insurance", "other costs"],
    warnings: [
      "Ground transfer feasibility and entry/Umrah eligibility unverified.",
      "Suppliers confirm price/availability; components booked separately.",
    ],
  }));
  return {
    status:
      journeys.length >= 3 ? ("succeeded" as const) : ("partial" as const),
    journeys,
    acceptedOffers: accepted,
    rejected,
    missingComponents: [
      ...["flight", "makkah", "madinah"].filter(
        (kind) =>
          !accepted.some((o) =>
            kind === "flight"
              ? o.kind === "flight"
              : o.kind === "hotel" && o.city === kind,
          ),
      ),
      ...(accepted.some(
        (o) =>
          o.price.currency !== request.displayCurrency &&
          !rates.some(
            (r) =>
              r.from === o.price.currency && r.to === request.displayCurrency,
          ),
      )
        ? ["XE conversion"]
        : []),
      ...(!journeys.length && accepted.length
        ? ["compatible complete combination"]
        : []),
    ],
    warnings:
      journeys.length < 3
        ? [
            "Fewer than three complete comparable combinations; no additional inventory invented.",
          ]
        : [],
  };
}
