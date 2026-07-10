import React, { FC, memo } from "react";
import { View, Text } from "@tarojs/components";
import { AtSlider } from "taro-ui";
import cs from "classnames";
import "./index.scss";

export type ToolSliderRowProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
};

const ToolSliderRow: FC<ToolSliderRowProps> = memo(
  ({ label, value, min, max, unit = "", disabled = false, onChange }) => {
    return (
      <View
        className={cs("toolSliderRow", disabled && "toolSliderRow--disabled")}
      >
        <View className="toolSliderRow__header">
          <Text className="toolSliderRow__label">{label}</Text>
          <Text className="toolSliderRow__value">
            {value}
            {unit}
          </Text>
        </View>
        <AtSlider
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          activeColor="#005ea4"
          backgroundColor="#e0e3e6"
          blockColor="#005ea4"
          onChanging={onChange}
        />
      </View>
    );
  }
);

export default ToolSliderRow;
