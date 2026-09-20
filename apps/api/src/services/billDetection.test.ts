import { describe, expect, it } from "vitest";
import { findRecurringCandidate, humanize, normalizeKey, type BillOccurrence } from "./billDetection";

function occ(description: string, amount: number, isoDate: string): BillOccurrence {
  return { description, amount, date: new Date(isoDate) };
}

describe("normalizeKey", () => {
  it("strips known payment prefixes", () => {
    expect(normalizeKey("CB Netflix Com")).toBe("netflix com");
    expect(normalizeKey("Prlv Sepa Orange Sa Orange")).toBe("orange sa orange");
    expect(normalizeKey("Vir Sepa Mangopay")).toBe("mangopay");
  });

  it("strips digits and collapses whitespace", () => {
    expect(normalizeKey("CB Amazon 123 Fr  Paris")).toBe("amazon fr paris");
  });
});

describe("humanize", () => {
  it("capitalizes each word of the normalized key", () => {
    expect(humanize("PRLV Orange Sa Orange")).toBe("Orange Sa Orange");
  });

  it("falls back to the raw description when the key is empty", () => {
    expect(humanize("123")).toBe("123");
  });
});

describe("findRecurringCandidate", () => {
  it("returns null when there is a single occurrence", () => {
    expect(findRecurringCandidate([occ("Netflix", 17.99, "2026-01-09")])).toBeNull();
  });

  it("detects a monthly subscription with a stable amount and ~30 day gaps", () => {
    const occurrences = [
      occ("Cb Netflix Com", 17.99, "2026-01-09"),
      occ("Cb Netflix Com", 17.99, "2026-02-08"),
      occ("Cb Netflix Com", 17.99, "2026-03-10"),
      occ("Cb Netflix Com", 17.99, "2026-04-09"),
    ];

    const candidate = findRecurringCandidate(occurrences);

    expect(candidate).not.toBeNull();
    expect(candidate?.name).toBe("Netflix Com");
    expect(candidate?.amount).toBeCloseTo(17.99, 2);
  });

  it("rejects gaps that are too short to be monthly (e.g. weekly groceries)", () => {
    const occurrences = [
      occ("Cb Franprix", 42, "2026-01-01"),
      occ("Cb Franprix", 45, "2026-01-08"),
      occ("Cb Franprix", 40, "2026-01-15"),
      occ("Cb Franprix", 43, "2026-01-22"),
    ];

    expect(findRecurringCandidate(occurrences)).toBeNull();
  });

  it("rejects amounts that vary too much between occurrences", () => {
    const occurrences = [
      occ("Cb Restaurant", 20, "2026-01-01"),
      occ("Cb Restaurant", 90, "2026-02-01"),
      occ("Cb Restaurant", 15, "2026-03-01"),
    ];

    expect(findRecurringCandidate(occurrences)).toBeNull();
  });

  it("deduplicates same-day occurrences before computing gaps", () => {
    // A bank connected twice (or a duplicate sync) can produce the exact
    // same transaction on the same day; without dedup this would crush the
    // average gap toward zero and hide a genuine monthly bill.
    const occurrences = [
      occ("Prlv Loyer Appartement", 750, "2026-01-05"),
      occ("Prlv Loyer Appartement", 750, "2026-01-05"),
      occ("Prlv Loyer Appartement", 750, "2026-02-05"),
      occ("Prlv Loyer Appartement", 750, "2026-02-05"),
      occ("Prlv Loyer Appartement", 750, "2026-03-05"),
    ];

    const candidate = findRecurringCandidate(occurrences);

    expect(candidate).not.toBeNull();
    expect(candidate?.amount).toBe(750);
  });

  it("marks the candidate as PAID when the computed next due date is already past", () => {
    const occurrences = [
      occ("Cb Old Subscription", 9.99, "2020-01-01"),
      occ("Cb Old Subscription", 9.99, "2020-02-01"),
      occ("Cb Old Subscription", 9.99, "2020-03-02"),
    ];

    expect(findRecurringCandidate(occurrences)?.status).toBe("PAID");
  });
});
