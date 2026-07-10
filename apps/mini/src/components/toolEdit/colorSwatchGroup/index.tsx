import React, { FC, memo } from "react";
import { View, Text } from "@tarojs/components";
import cs from "classnames";
import "./index.scss";

export type ColorSwatchGroupProps = {
  label: string;
  colors: string[];
  value: string;
  onChange: (color: string) => void;
};

const ColorSwatchGroup: FC<ColorSwatchGroupProps> = memo(
  ({ label, colors, value, onChange }) => {
    return (
      <View className="colorSwatchGroup">
        <Text className="colorSwatchGroup__label">{label}</Text>
        <View className="colorSwatchGroup__swatches">
          {colors.map((color) => (
            <View
              key={color}
              className={cs(
                "colorSwatchGroup__dot",
                value === color && "colorSwatchGroup__dot--selected"
              )}
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            />
          ))}
        </View>
      </View>
    );
  }
);

export default ColorSwatchGroup;
