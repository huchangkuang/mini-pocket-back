import React, { FC, memo } from "react";
import { Input, View } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import "./index.scss";

export type SearchBarProps = {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

const SearchBar: FC<SearchBarProps> = memo(({ value, placeholder = "搜索...", onChange }) => {
  return (
    <View className="searchBar">
      <View className="searchBar__icon">
        <AtIcon value="search" size="18" color="#707783" />
      </View>
      <Input
        className="searchBar__input"
        type="text"
        value={value}
        placeholder={placeholder}
        placeholderClass="searchBar__placeholder"
        onInput={(e) => onChange(e.detail.value)}
      />
    </View>
  );
});

export default SearchBar;
