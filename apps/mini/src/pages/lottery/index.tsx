import React, { FC, useState } from "react";
import Taro, { useShareAppMessage } from "@tarojs/taro";
import { View, Text, Switch } from "@tarojs/components";
import "./index.scss";
import { errorToast } from "@/utils/errorToast";
import { generateNumList, randomNum } from "@/utils/generateNum";
import { useThrottle } from "@/hooks/useThrottle";
import { AtButton, AtIcon, AtSwitch } from "taro-ui";
import { BomFixed } from "@/components/bomFixed";

type RedBall = (number | string)[];
type BlueBall = number | string;
type NumWrapperProps = {
  redBall?: RedBall;
  blueBall?: BlueBall;
  onSubtract?: () => void;
};
const initialNum: {
  red: RedBall;
  blue: BlueBall;
} = {
  red: ["", "", "", "", "", ""],
  blue: "",
};
const NumWrapper: FC<NumWrapperProps> = ({
  redBall = [],
  blueBall = "",
  onSubtract,
}) => {
  const copy = () => {
    if (!blueBall || redBall.some((i) => !i)) {
      errorToast("请先选数");
      return;
    }
    Taro.setClipboardData({
      data: `${redBall.join(",")}+${blueBall}`,
    });
  };
  return (
    <View className="numWrapper">
      <View className="redBallNum">
        {redBall.map((i, index) => (
          <View key={index} className="squareItem">
            {i}
          </View>
        ))}
      </View>
      <View>+</View>
      <View className="squareItem noRight">{blueBall}</View>
      <View className="link" onClick={copy}>
        复制
      </View>
      <AtIcon value="subtract-circle" size={16} onClick={onSubtract} />
    </View>
  );
};
const Lottery: FC = () => {
  const [list, setList] = useState([initialNum]);
  const [repeatBlue, setRepeatBlue] = useState(false);
  const copyAll = () => {
    if (list.some((i) => !i.blue || i.red.some((j) => !j))) {
      errorToast("请先选数");
      return;
    }
    const newList = list.map((i) => `${i.red.join(",")}+${i.blue}`);
    Taro.setClipboardData({
      data: newList.join("\n"),
    });
  };
  const onAdd = () => {
    if (list.length >= 16) return errorToast("不可再添加了");
    setList((arr) => arr.concat(initialNum));
  };
  const padZero = (value: string | number = "") => {
    const str = value.toString();
    if (str && str.length < 2) {
      return str.padStart(2, "0");
    }
    return str;
  };
  const chooseNum = () => {
    const blueList = generateNumList(16, list.length).map((i) => padZero(i));
    const newList = list.map((i, index) => {
      const red = generateNumList().map((r) => padZero(r));
      if (repeatBlue) {
        const blue = padZero(randomNum(1, 16));
        return { red, blue };
      } else {
        return { red, blue: blueList[index] };
      }
    });
    setList(newList);
  };
  const onNumScroll = useThrottle(() => {
    let i = 0;
    const clock = setInterval(() => {
      if (i >= 10) {
        clearInterval(clock);
        return;
      }
      chooseNum();
      i += 1;
    }, 100);
  }, 1000);
  const removeItem = (index: number) => {
    const newList = list.filter((i, ids) => ids !== index);
    setList(newList);
  };
  useShareAppMessage(() => {
    return {
      title: "随机数选择",
      path: "/pages/pocket/index",
    };
  });
  return (
    <View className="lottery">
      <View className="content">
        <View className="filterWrapper">
          <View className="form">
            <View className="label">可重复：</View>
            <AtSwitch checked={repeatBlue} onChange={(v) => setRepeatBlue(v)} />
          </View>
        </View>
        <View className="titleWrapper">
          <View>
            <Text style={{ color: "#d73838" }}>6个数</Text> +
            <Text style={{ color: "#366ad7" }}>1个数</Text>
          </View>
          <View className="btn add" onClick={onAdd}>
            加一项
          </View>
          <View className="btn reset" onClick={() => setList([initialNum])}>
            重置
          </View>
          <View className="link" onClick={copyAll}>
            全部复制
          </View>
        </View>
        {list.map((i, index) => (
          <NumWrapper
            key={index}
            onSubtract={() => removeItem(index)}
            redBall={i.red}
            blueBall={i.blue}
          />
        ))}
      </View>
      <BomFixed>
        <View className="bomBtn">
          <AtButton type="primary" onClick={onNumScroll}>
            随机选择
          </AtButton>
        </View>
      </BomFixed>
    </View>
  );
};
export default Lottery;
