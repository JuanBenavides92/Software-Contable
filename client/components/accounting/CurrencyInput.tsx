import { Input } from "@/components/ui/input";
import { forwardRef } from "react";

interface CurrencyInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  currency?: string;
  onValueChange?: (value: number | null) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ currency = "COP", value, onChange, onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/[^0-9.-]/g, "");
      onChange?.(e);

      const numValue = rawValue ? parseFloat(rawValue) : null;
      onValueChange?.(numValue);
    };

    const formatValue = (val: string | number | readonly string[] | undefined) => {
      if (!val || val === "") return "";
      const stringVal = Array.isArray(val) ? val[0] : String(val);
      const numVal = typeof stringVal === "string" ? parseFloat(stringVal) : stringVal;
      if (isNaN(numVal)) return "";
      return numVal.toLocaleString("es-CO", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
      });
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          $
        </span>
        <Input
          ref={ref}
          type="text"
          value={formatValue(value)}
          onChange={handleChange}
          className="pl-7 font-mono"
          inputMode="decimal"
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
