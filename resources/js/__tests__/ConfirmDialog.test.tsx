// @vitest-environment jsdom
import { describe, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConfirmDialog from "../Components/ConfirmDialog";
import React from "react";

// Mock Headless UI since it relies on browser APIs that might need setup
// Or just basic test of logic props passing.
// Headless UI is hard to test in simple JSDOM without proper setup sometimes.
// But we can test if onConfirm is called and button enters loading state.

describe("ConfirmDialog", () => {
    it("calls onConfirm when confirm button is clicked", () => {
        const onConfirm = vi.fn();
        const onClose = vi.fn();

        render(
            <ConfirmDialog
                isOpen={true}
                onClose={onClose}
                onConfirm={onConfirm}
                title="Confirm Me"
            >
                Are you sure?
            </ConfirmDialog>,
        );

        const confirmBtn = screen.getByText("Konfirmasi");
        fireEvent.click(confirmBtn);

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("disables buttons and shows spinner when isLoading is true", () => {
        render(
            <ConfirmDialog
                isOpen={true}
                onClose={() => {}}
                onConfirm={() => {}}
                title="Loading"
                isLoading={true}
            >
                Processing...
            </ConfirmDialog>,
        );

        const confirmBtn = screen.getByText(/Memproses/i);
        expect(confirmBtn).toBeDisabled();

        const cancelBtn = screen.getByText("Batal");
        expect(cancelBtn).toBeDisabled();
    });
});
