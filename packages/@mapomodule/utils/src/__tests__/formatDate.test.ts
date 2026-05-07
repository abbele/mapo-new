import { describe, it, expect } from "vitest";
import { formatDate } from "../formatDate.js";

describe("formatDate", () => {
  const date = new Date(2024, 2, 5, 9, 7, 3); // 2024-03-05 09:07:03

  it("formats with default YYYY-MM-DD", () => {
    expect(formatDate(date)).toBe("2024-03-05");
  });

  it("formats with custom format string", () => {
    expect(formatDate(date, "DD/MM/YYYY")).toBe("05/03/2024");
  });

  it("includes time tokens", () => {
    expect(formatDate(date, "YYYY-MM-DD HH:mm:ss")).toBe("2024-03-05 09:07:03");
  });

  it("accepts an ISO string", () => {
    expect(formatDate("2024-06-15")).toBe("2024-06-15");
  });

  it("returns empty string for invalid date string", () => {
    expect(formatDate("not-a-date")).toBe("");
  });
});
