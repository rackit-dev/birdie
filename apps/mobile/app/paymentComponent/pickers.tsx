// component/paymentComponent/Pickers.ts
import React from "react";
import { Select } from "native-base";

type PickerItem = {
  label: string;
  value: string;
};

type PickerProps = {
  data: PickerItem[];
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
};

export default function Picker({
  data,
  selectedValue,
  onValueChange,
}: PickerProps) {
  return (
    <Select
      selectedValue={String(selectedValue)} // 강제로 string 변환
      onValueChange={(value) => onValueChange(value)}
    >
      {data.map((e, index) => (
        <Select.Item key={index} label={e.label} value={String(e.value)} />
      ))}
    </Select>
  );
}
