import { z } from "zod";
import { RequestSchema, hotelStays, convertMinor } from "./contracts.js";
import { minor, formatMinor, supplierURL } from "./pricing.js";
const amount = z.union([z.string(), z.number().finite()]).transform(String);
const leg = z.object({
  departure: z.string(),
  arrival: z.string(),
  departure_airport: z.string(),
  arrival_airport: z.string(),
  carrier_name: z.string(),
  stops: z.string(),
});
const hotel = z.object({
  name: z.string(),
  id: z.number().int(),
  url: z.string(),
  price: z.object({ book: amount, currency: z.literal("SAR") }),
});
const Snapshot = z.object({
  surface: z.literal("conversation_plugins_only"),
  workerAccessDemonstrated: z.literal(false),
  observedAt: z.iso.datetime(),
  request: RequestSchema,
  flight: z.object({
    price_per_person: amount,
    total_booking_price: amount,
    clickout_url: z.string(),
    departure_leg: leg,
    return_leg: leg,
  }),
  makkah: hotel,
  madinah: hotel,
  fx: z.object({
    fromCurrencyCode: z.literal("SAR"),
    toCurrencyCode: z.literal("EUR"),
    fromAmount: z.number().positive(),
    midMarketRate: z.number().positive().finite(),
    timestamp: z.iso.datetime(),
  }),
});
// Pure validation of a snapshot exported by actual conversation tool calls.
// This function neither invokes a provider nor proves where an arbitrary file came from.
// Invocation provenance remains in the conversation's tool log, never in model assertions.
export function validateConversation(raw: unknown) {
  const s = Snapshot.parse(raw),
    r = s.request,
    f = s.flight;
  if (r.displayCurrency !== "EUR")
    throw Error(
      "This conversational proof uses EUR and original SAR hotel prices",
    );
  if (!supplierURL("eDreams", f.clickout_url))
    throw Error("Invalid supplier flight URL");
  if (
    f.departure_leg.departure_airport !== r.originAirport ||
    f.departure_leg.arrival_airport !== r.arrivalAirport ||
    f.return_leg.departure_airport !== r.departureAirport ||
    f.return_leg.arrival_airport !== r.originAirport
  )
    throw Error("Actual flight airport mismatch");
  if (
    f.departure_leg.departure.slice(0, 10) !== r.outboundDate ||
    f.return_leg.departure.slice(0, 10) !== r.returnDate
  )
    throw Error("Actual flight date mismatch");
  const flight = minor(f.total_booking_price, "EUR");
  if (flight !== minor(f.price_per_person, "EUR") * BigInt(r.adults))
    throw Error("Passenger total mismatch");
  const stays = hotelStays(f.departure_leg.arrival + "+03:00", r.cityOrder, {
    makkah: r.makkahNights,
    madinah: r.madinahNights,
  });
  if (stays[1]!.checkOut > f.return_leg.departure.slice(0, 10))
    throw Error("Hotel stay extends beyond return flight");
  const originalHotels = stays.map((stay) => {
    const h = s[stay.city];
    if (!supplierURL("Booking.com", h.url))
      throw Error("Invalid supplier hotel URL");
    const u = new URL(h.url);
    for (const [key, value] of Object.entries({
      checkin: stay.checkIn,
      checkout: stay.checkOut,
      no_rooms: String(r.rooms),
      group_adults: String(r.adults),
      selected_currency: "SAR",
    }))
      if (u.searchParams.get(key) !== value)
        throw Error("Hotel dates or occupancy mismatch");
    // Booking's exposed schema calls price the complete total cost for the query.
    // book includes the legally displayed charges; undisclosed extras remain unresolved.
    return {
      name: h.name,
      ...stay,
      amount: minor(h.price.book, "SAR"),
      original: h.price.book,
      currency: "SAR" as const,
      url: h.url,
    };
  });
  const hotelSAR = originalHotels.reduce((sum, h) => sum + h.amount, 0n);
  if (hotelSAR !== minor(String(s.fx.fromAmount), "SAR"))
    throw Error("XE amount does not match both original stay totals");
  if (
    Date.parse(s.fx.timestamp) > Date.parse(s.observedAt) + 60000 ||
    Date.parse(s.observedAt) - Date.parse(s.fx.timestamp) > 3600000
  )
    throw Error("XE timestamp outside proof freshness window");
  const rate = String(s.fx.midMarketRate);
  if (!/^\d+(\.\d+)?$/.test(rate)) throw Error("Unsupported rate notation");
  const [whole, fraction = ""] = rate.split(".");
  const numerator = BigInt(whole! + fraction),
    denominator = 10n ** BigInt(fraction.length);
  const hotelEUR = convertMinor(hotelSAR, numerator, denominator, 2, 2),
    total = flight + hotelEUR;
  const warnings = [
    "Quoted subtotal only: extra mandatory charges, hotel rate eligibility and cancellation terms are not exposed.",
    "Checked baggage, connection airport and detailed flight fare conditions were not returned.",
    "Early arrival does not confirm early hotel check-in.",
    "Ground transport, visa, insurance, meals and other costs excluded; transfer feasibility and Umrah/entry eligibility unverified.",
    "Supplier prices and availability must be reconfirmed; each component is booked separately.",
  ];
  if (new URL(f.clickout_url).searchParams.get("prime") === "true")
    warnings.push(
      "The genuine eDreams clickout contains prime=true. The subtotal uses ordinary total_booking_price, not Prime. The public fare landing state has not been verified; URL parameters are preserved.",
    );
  if (stays[1]!.checkOut < f.return_leg.departure.slice(0, 10))
    warnings.push(
      "No hotel is included after the last checkout: the following night is transit/waiting before the return flight.",
    );
  return {
    schemaVersion: "1.0",
    mode: "conversation_only",
    workerAccessDemonstrated: false,
    validation: "quoted_subtotal_arithmetic_and_itinerary_dates",
    observedAt: s.observedAt,
    request: r,
    flight: {
      supplier: "eDreams",
      ordinaryGroupTotalEUR: formatMinor(flight, "EUR"),
      ordinaryPerAdultEUR: f.price_per_person,
      outbound: f.departure_leg,
      inbound: f.return_leg,
      url: f.clickout_url,
    },
    hotels: originalHotels.map(({ amount, ...h }) => ({
      ...h,
      convertedEUR: formatMinor(
        convertMinor(amount, numerator, denominator, 2, 2),
        "EUR",
      ),
    })),
    conversion: {
      source: "XE Currency Converter",
      from: "SAR",
      to: "EUR",
      rate,
      timestamp: s.fx.timestamp,
      originalHotelTotalSAR: formatMinor(hotelSAR, "SAR"),
      convertedHotelTotalEUR: formatMinor(hotelEUR, "EUR"),
    },
    quotedSubtotalEUR: formatMinor(total, "EUR"),
    averagePerAdultEUR: formatMinor(
      (total + BigInt(Math.floor(r.adults / 2))) / BigInt(r.adults),
      "EUR",
    ),
    finalPayableTotal: null,
    warnings,
  };
}
