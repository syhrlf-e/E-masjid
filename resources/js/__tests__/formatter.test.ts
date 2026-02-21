import { describe, it, expect } from "vitest";
import { formatRupiah, parseRupiah } from "../utils/formatter";

describe("Formatter Utilities", () => {
    describe("formatRupiah", () => {
        it("formats positive numbers correctly", () => {
            expect(formatRupiah(1500000)).toBe("Rp 1.500.000");
            expect(formatRupiah(100)).toBe("Rp 100");
            expect(formatRupiah(0)).toBe("Rp 0");
        });

        it("handles negative numbers (returns Rp 0 as per logic)", () => {
            // In our app logic, we return 'Rp 0' for negative or invalid in display
            expect(formatRupiah(-5000)).toBe("Rp 0");
        });

        it("handles NaN", () => {
            expect(formatRupiah(NaN)).toBe("Rp 0");
        });
    });

    describe("parseRupiah", () => {
        it("parses formatted currency string back to number", () => {
            expect(parseRupiah("Rp 1.500.000")).toBe(1500000);
            expect(parseRupiah("Rp 100")).toBe(100);
        });

        it("handles dirty strings", () => {
            expect(parseRupiah("abc 123 xyz")).toBe(123);
        });

        it("handles empty strings", () => {
            expect(parseRupiah("")).toBe(0);
        });
    });
});
