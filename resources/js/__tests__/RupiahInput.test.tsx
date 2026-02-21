// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import RupiahInput from "../Components/RupiahInput";
import React from "react";

describe("RupiahInput", () => {
    afterEach(() => {
        cleanup();
    });
    it("formats initial value correctly", () => {
        render(<RupiahInput value={50000} onValueChange={() => {}} />);
        const input = screen.getByRole("textbox") as HTMLInputElement;
        // The formatter usually outputs "Rp 50.000". Checking value property.
        // We need to account for the space behavior in our formatter utility (fixed to normal space earlier).
        expect(input.value).toBe("Rp 50.000");
    });

    it("updates formatted value on change and calls onChange with number", () => {
        const handleChange = vi.fn();
        render(<RupiahInput value={0} onValueChange={handleChange} />);

        const input = screen.getByRole("textbox");

        // Optimize: User types 5, 0, 0, 0, 0
        // Simulating single change event as if user typed/pasted
        fireEvent.change(input, { target: { value: "50000" } });

        // Expect parent to receive 50000 number
        expect(handleChange).toHaveBeenCalledWith(50000);

        // Expect input to display formatted
        // Note: In our component, we update generic display on change event too
        expect((input as HTMLInputElement).value).toBe("Rp 50.000");
    });

    it("handles non-numeric input by ignoring it/parsing it", () => {
        const handleChange = vi.fn();
        render(<RupiahInput value={0} onValueChange={handleChange} />);

        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "abc" } });

        // Expect 0
        expect(handleChange).toHaveBeenCalledWith(0);
        expect((input as HTMLInputElement).value).toBe("Rp 0");
    });
});
