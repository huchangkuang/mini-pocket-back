import React, { FC, memo } from "react";
import { ScrollView, View, Text } from "@tarojs/components";
import cs from "classnames";
import type { CategoryChip } from "@/pages/classify/constants";
import "./index.scss";

export type CategoryChipsProps = {
  chips: CategoryChip[];
  selectedId: string;
  onSelect: (id: string) => void;
};

const CategoryChips: FC<CategoryChipsProps> = memo(
  ({ chips, selectedId, onSelect }) => {
    return (
      <ScrollView scrollX className="categoryChips" enableFlex>
        <View className="categoryChips__row">
          {chips.map((chip) => {
            const isActive = chip.id === selectedId;
            return (
              <View
                key={chip.id}
                className={cs(
                  "categoryChips__chip",
                  isActive && "categoryChips__chip--active"
                )}
                onClick={() => onSelect(chip.id)}
              >
                <Text
                  className={cs(
                    "categoryChips__text",
                    isActive && "categoryChips__text--active"
                  )}
                >
                  {chip.label}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  }
);

export default CategoryChips;
