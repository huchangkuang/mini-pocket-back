import React, { FC, memo } from "react";
import { View, Text } from "@tarojs/components";
import cs from "classnames";
import "./index.scss";

export type SegmentedOption<T extends string | number> = {
  label: string;
  value: T;
};

export type SegmentedControlProps<T extends string | number> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

function SegmentedControlInner<T extends string | number>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View className="segmentedControl">
      {options.map((option) => (
        <View
          key={String(option.value)}
          className={cs(
            "segmentedControl__item",
            value === option.value && "segmentedControl__item--active",
          )}
          onClick={() => onChange(option.value)}
        >
          <Text className="segmentedControl__label">{option.label}</Text>
        </View>
      ))}
    </View>
  );
}

const SegmentedControl = memo(SegmentedControlInner) as typeof SegmentedControlInner;

export default SegmentedControl;
