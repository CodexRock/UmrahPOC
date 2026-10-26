import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assembleJourneys,
  formatMinor,
  minor,
  supplierURL,
  type Offer,
  type Rate,
} from "../src/pricing.js";
import { RequestSchema } from "../src/contracts.js";
const now = new Date(),
  date = (n: number) =>
    new Date(now.getTime() + n * 86400000).toISOString().slice(0, 10),
  observedAt = now.toISOString();
const request = RequestSchema.parse({
  originAirport: "CDG",
  arrivalAirport: "JED",
  departureAirport: "JED",
  outboundDate: date(90),
  returnDate: date(98),
  cityOrder: ["makkah", "madinah"],
  makkahNights: 4,
  madinahNights: 3,
  adults: 2,
  rooms: 1,
  displayCurrency: "EUR",
  locale: "en",
  preferences: { checkedBaggagePreferred: true },
});
const flight: Offer = {
  id: "flight",
  kind: "flight",
  adults: 2,
  provenance: {
    source: "Trip.com",
    tool: "search_flights",
    observedAt,
    evidenceId: "f",
    url: "https://us.trip.com/flights/?a=1&sid=2",
    linkScope: "search",
  },
  price: {
    amount: "100.00",
    currency: "USD",
    basis: "per_adult",
    taxes: "included",
    membership: "none",
  },
  originAirport: "CDG",
  returnAirport: "CDG",
  arrivalAirport: "JED",
  departureAirport: "JED",
  outboundDeparture: date(90) + "T20:00:00+01:00",
  saudiArrival: date(91) + "T03:00:00+03:00",
  saudiDeparture: date(98) + "T22:00:00+03:00",
};
const hotel = (
  city: "makkah" | "madinah",
  start: number,
  end: number,
  id: string,
): Offer => ({
  id,
  kind: "hotel",
  adults: 2,
  rooms: 1,
  city,
  checkIn: date(start),
  checkOut: date(end),
  provenance: {
    source: "Booking.com",
    tool: "accommodations_search_v2",
    observedAt,
    evidenceId: id,
    url: "https://www.booking.com/hotel/sa/test.html?aid=123",
    linkScope: "property",
  },
  price: {
    amount: "50.00",
    currency: "EUR",
    basis: "stay_total",
    taxes: "included",
    membership: "none",
  },
});
const hotels = [hotel("makkah", 91, 95, "m"), hotel("madinah", 95, 98, "d")];
const rate: Rate = {
  from: "USD",
  to: "EUR",
  rate: "0.9",
  observedAt,
  source: "XE Currency Converter",
  tool: "currency_converter",
  evidenceId: "fx",
};
const evidence = [
  flight.provenance,
  ...hotels.map((h) => h.provenance),
  rate,
].map((p) => ({
  id: p.evidenceId,
  source: p.source,
  tool: p.tool,
  observedAt,
}));
const run = (
  offers: unknown[] = [flight, ...hotels],
  rates: unknown[] = [rate],
) => assembleJourneys(request, offers, rates, evidence, now);
test("stay totals counted once; per-adult flight and XE conversion yield group and average", () => {
  const r = run();
  assert.equal(r.status, "partial");
  assert.equal(r.journeys.length, 1);
  assert.equal(r.journeys[0]!.groupTotal, "280.00");
  assert.equal(r.journeys[0]!.averagePerAdult, "140.00");
  assert.equal(r.journeys[0]!.stays[0]!.checkIn, date(91));
  assert.equal(
    r.journeys[0]!.components[0]!.offer.provenance.url,
    flight.provenance.url,
  );
});
test("wrong airport, hotel dates and occupancy never yield a complete journey", () => {
  for (const offers of [
    [{ ...flight, originAirport: "ORY" }, ...hotels],
    [flight, { ...hotels[0], checkIn: date(90) }, hotels[1]],
    [flight, { ...hotels[0], rooms: 2 }, hotels[1]],
  ])
    assert.equal(run(offers).journeys.length, 0);
});
test("unknown bases, taxes and membership rejected rather than guessed", () => {
  for (const price of [
    { ...flight.price, basis: "unknown" },
    { ...flight.price, taxes: "unknown" },
    { ...flight.price, membership: "required" },
  ])
    assert.equal(run([{ ...flight, price }, ...hotels]).journeys.length, 0);
});
test("missing or untrusted XE leaves originals but no converted journey", () => {
  assert.equal(run(undefined, []).acceptedOffers.length, 3);
  assert.equal(run(undefined, []).journeys.length, 0);
  assert.equal(
    run(undefined, [{ ...rate, evidenceId: "model-says-so" }]).journeys.length,
    0,
  );
});
test("model-only provenance, stale evidence and duplicate offers cannot create inventory", () => {
  assert.equal(
    assembleJourneys(request, [flight, ...hotels], [rate], [], now).journeys
      .length,
    0,
  );
  assert.equal(
    assembleJourneys(
      request,
      [flight, ...hotels],
      [rate],
      evidence,
      new Date(now.getTime() + 7200000),
    ).journeys.length,
    0,
  );
  assert.equal(run([flight, flight, ...hotels, ...hotels]).journeys.length, 1);
  assert.equal(run([]).journeys.length, 0);
});
test("room-night basis multiplied only by queried rooms and actual nights", () => {
  assert.equal(
    run([
      flight,
      { ...hotels[0], price: { ...hotels[0]!.price, basis: "room_night" } },
      hotels[1],
    ]).journeys[0]!.groupTotal,
    "430.00",
  );
});
test("currency precision and supplier URLs", () => {
  assert.equal(minor("123", "JPY"), 123n);
  assert.equal(formatMinor(123n, "JPY"), "123");
  assert.throws(() => minor("1.01", "JPY"));
  assert.throws(() => minor("1.001", "EUR"));
  assert.equal(
    supplierURL("Booking.com", "https://booking.com.evil.invalid"),
    false,
  );
  assert.equal(supplierURL("Trip.com", "javascript:alert(1)"), false);
  assert.equal(
    supplierURL("Trip.com", "https://us.trip.com/?access_token=private"),
    false,
  );
});
test("three options require three distinct evidenced combinations", () => {
  const more = [
    ...hotels,
    hotel("makkah", 91, 95, "m2"),
    hotel("makkah", 91, 95, "m3"),
  ];
  const allEvidence = [
    ...evidence,
    ...more
      .slice(2)
      .map((o) => ({
        id: o.provenance.evidenceId,
        source: o.provenance.source,
        tool: o.provenance.tool,
        observedAt,
      })),
  ];
  const r = assembleJourneys(
    request,
    [flight, ...more],
    [rate],
    allEvidence,
    now,
  );
  assert.equal(r.journeys.length, 3);
  assert.equal(r.status, "succeeded");
  assert.equal(
    new Set(
      r.journeys.map((j) => j.components.map((c) => c.offer.id).join("|")),
    ).size,
    3,
  );
});
