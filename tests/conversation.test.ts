import { test } from "node:test";
import assert from "node:assert/strict";
import { validateConversation } from "../src/conversation.js";
const day = (n: number) =>
  new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
function fixture() {
  const hotel = (
    id: number,
    name: string,
    start: number,
    end: number,
    price: number,
  ) => ({
    id,
    name,
    url: `https://www.booking.com/hotel/sa/test.html?checkin=${day(start)}&checkout=${day(end)}&no_rooms=1&group_adults=2&selected_currency=SAR&aid=example`,
    price: { book: price, currency: "SAR" },
  });
  return {
    surface: "conversation_plugins_only",
    workerAccessDemonstrated: false,
    observedAt: new Date().toISOString(),
    request: {
      originAirport: "ORY",
      arrivalAirport: "JED",
      departureAirport: "JED",
      outboundDate: day(90),
      returnDate: day(99),
      cityOrder: ["makkah", "madinah"],
      makkahNights: 4,
      madinahNights: 3,
      adults: 2,
      rooms: 1,
      displayCurrency: "EUR",
      locale: "fr",
      preferences: { checkedBaggagePreferred: true },
    },
    flight: {
      price_per_person: "50",
      total_booking_price: "100",
      prime_total_booking_price: "80",
      clickout_url:
        "https://www.edreams.com/travel/?prime=true&attribution=keep",
      departure_leg: {
        departure: day(90) + "T15:45",
        arrival: day(91) + "T04:10",
        departure_airport: "ORY",
        arrival_airport: "JED",
        carrier_name: "Synthetic test carrier",
        stops: "1",
      },
      return_leg: {
        departure: day(99) + "T05:30",
        arrival: day(99) + "T14:40",
        departure_airport: "JED",
        arrival_airport: "ORY",
        carrier_name: "Synthetic test carrier",
        stops: "1",
      },
    },
    makkah: hotel(1, "Synthetic Makkah", 91, 95, 400),
    madinah: hotel(2, "Synthetic Madinah", 95, 98, 200),
    fx: {
      fromCurrencyCode: "SAR",
      toCurrencyCode: "EUR",
      fromAmount: 600,
      midMarketRate: 0.25,
      timestamp: new Date().toISOString(),
    },
  };
}
test("conversation quote uses public group fare, whole stays and actual XE pair; keeps gaps and unknown costs explicit", () => {
  const raw = fixture(),
    r = validateConversation(raw);
  assert.equal(r.quotedSubtotalEUR, "250.00");
  assert.equal(r.averagePerAdultEUR, "125.00");
  assert.equal(r.finalPayableTotal, null);
  assert.equal(r.workerAccessDemonstrated, false);
  assert.equal(r.flight.url, raw.flight.clickout_url);
  assert.equal(r.hotels[0]!.checkIn, day(91));
  assert.ok(r.warnings.some((x) => x.includes("prime=true")));
  assert.ok(r.warnings.some((x) => x.includes("transit/waiting")));
});
test("conversation proof rejects airport, hotel occupancy/date, passenger total and FX amount mismatches", () => {
  const cases = [
    (s: ReturnType<typeof fixture>) => {
      s.flight.departure_leg.departure_airport = "CDG";
    },
    (s: ReturnType<typeof fixture>) => {
      s.makkah.url = s.makkah.url.replace("group_adults=2", "group_adults=1");
    },
    (s: ReturnType<typeof fixture>) => {
      s.makkah.url = s.makkah.url.replace(day(91), day(90));
    },
    (s: ReturnType<typeof fixture>) => {
      s.flight.total_booking_price = "80";
    },
    (s: ReturnType<typeof fixture>) => {
      s.fx.fromAmount = 599;
    },
    (s: ReturnType<typeof fixture>) => {
      s.fx.timestamp = new Date(Date.now() - 7200000).toISOString();
    },
  ];
  for (const mutate of cases) {
    const s = fixture();
    mutate(s);
    assert.throws(() => validateConversation(s));
  }
});
