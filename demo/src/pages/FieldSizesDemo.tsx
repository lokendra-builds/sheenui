import { Button, Combobox, DatePicker, Input, NumberField, Select } from "@sheenui/theme";

/** The "One size scale" row of the Field page: Select, Combobox, NumberField and DatePicker are heavy, so FieldPage loads this as an island (lazyBlock). */
export function FieldSizesDemo() {
  return (
    <div className="flex w-full flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-3">
          <Button size={size}>{size}</Button>
          <Input size={size} aria-label={`Input ${size}`} placeholder="Input" className="w-36" />
          <Select
            size={size}
            aria-label={`Select ${size}`}
            items={[
              { value: "apple", label: "Apple" },
              { value: "pear", label: "Pear" },
            ]}
            placeholder="Select"
            className="w-44"
          />
          <Combobox
            size={size}
            aria-label={`Combobox ${size}`}
            options={[
              { value: "apple", label: "Apple" },
              { value: "pear", label: "Pear" },
            ]}
            placeholder="Combobox"
            className="w-44"
          />
          <NumberField size={size} aria-label={`Number ${size}`} defaultValue={3} className="w-36" />
          <DatePicker size={size} aria-label={`Date ${size}`} className="w-44" />
        </div>
      ))}
    </div>
  );
}
