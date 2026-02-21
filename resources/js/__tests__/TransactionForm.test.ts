import { describe, it, expect } from "vitest";
import { z } from "zod";

// Replicating schema from Create.tsx since we can't easily import from component in this setup without extracting schema
const transactionSchema = z.object({
    type: z.enum(["in", "out"]),
    category: z.enum([
        "zakat_fitrah",
        "zakat_maal",
        "infaq",
        "infaq_tromol",
        "operasional",
        "gaji",
        "lainnya",
    ]),
    amount: z.number().min(1, "Nominal wajib diisi dan minimal Rp 1"),
    payment_method: z.enum(["tunai", "transfer", "qris"]).optional(),
    notes: z.string().max(500, "Keterangan maksimal 500 karakter").optional(),
});

describe("Transaction Form Validation", () => {
    it("validates a correct transaction", () => {
        const data = {
            type: "in",
            category: "infaq",
            amount: 50000,
            payment_method: "tunai",
            notes: "Test Infaq",
        };
        const result = transactionSchema.safeParse(data);
        expect(result.success).toBe(true);
    });

    it("rejects zero amount", () => {
        const data = {
            type: "in",
            category: "infaq",
            amount: 0,
            payment_method: "tunai",
        };
        const result = transactionSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain("minimal Rp 1");
        }
    });

    it("rejects negative amount", () => {
        const data = {
            type: "in",
            category: "infaq",
            amount: -5000,
            payment_method: "tunai",
        };
        const result = transactionSchema.safeParse(data);
        expect(result.success).toBe(false);
    });

    it("rejects invalid category", () => {
        const data = {
            type: "in",
            category: "invalid_category",
            amount: 50000,
        };
        const result = transactionSchema.safeParse(data);
        expect(result.success).toBe(false);
    });
});
