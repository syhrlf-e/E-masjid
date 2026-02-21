import { formatRupiah, parseRupiah } from "@/utils/formatter";
import { forwardRef, useEffect, useState } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    value?: number;
    onValueChange: (value: number) => void;
    error?: string;
}

const RupiahInput = forwardRef<HTMLInputElement, Props>(
    ({ value = 0, onValueChange, error, className = "", ...props }, ref) => {
        const [displayValue, setDisplayValue] = useState("");

        useEffect(() => {
            // Only update display value if the number value changes externally
            // and checking if it matches parsed display to avoid cursor jumps / formatting loops if we were careful,
            // but here simpler to just format always for "controlled" feel.
            if (value === 0 && displayValue === "") return; // Allow empty start if needed, but value is 0 default.

            // If the user typed "Rp 50.000", value is 50000.
            // If props.value updates to 60000, we want "Rp 60.000".
            // We use standard formatRupiah which might have prefix "Rp ".

            // Edge case: if value is 0, we might want to show "" or "Rp 0".
            // Let's assume standard behavior: always match prop.
            setDisplayValue(formatRupiah(value));
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const rawInput = e.target.value;
            const numericValue = parseRupiah(rawInput);

            // Determine cursor position logic if needed, but for now simple controlled input
            // We update parent with numeric value
            onValueChange(numericValue);

            // We update local display immediately for responsiveness, usually formatted
            // But formatting on every keystroke can be annoying if it moves cursor.
            // A common strategy is to format on blur, or strictly format always.
            // Given "auto-format ke Rupiah saat mengetik", we format on change.
            setDisplayValue(formatRupiah(numericValue));
        };

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            if (value === 0) setDisplayValue("");
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setDisplayValue(formatRupiah(value));
        };

        return (
            <div className="w-full">
                <input
                    ref={ref}
                    type="text"
                    inputMode="numeric"
                    value={displayValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={`border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-md shadow-sm w-full ${error ? "border-red-500" : ""} ${className}`}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
        );
    },
);

RupiahInput.displayName = "RupiahInput";

export default RupiahInput;
