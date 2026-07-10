import React, { useEffect, useMemo, useRef, useState } from "react";
import Taro, {
  CustomWrapper,
  MovableArea,
  MovableView,
  View,
} from "@tarojs/components";
import "./index.scss";
import { AtIcon } from "taro-ui";
import {
  getMenuButtonBoundingClientRect,
  getSystemInfoSync,
  useDidShow,
  useShareAppMessage,
} from "@tarojs/taro";
import cs from "classnames";
import { randomNum } from "@/utils/generateNum";
import { IS_WECHAT } from "@/utils/constant";
import { isFirstPageInStack, navigateBackOrHome } from "@/utils/navigation";

type Fingers = {
  id: number;
  x: number;
  y: number;
  color: string;
};
const colors = ["#cb4e18", "#2FD688", "#449de0", "#d73838", "#00FFFF"];

const BACK_HIT_PADDING = 16;

function isUiZoneTouch(pageX: number, pageY: number) {
  const { windowHeight = 0, windowWidth = 0 } = getSystemInfoSync();
  const menu = getMenuButtonBoundingClientRect();

  const inBackZone =
    pageX <= menu.left + menu.width + BACK_HIT_PADDING &&
    pageY <= menu.top + menu.height + BACK_HIT_PADDING;

  const startTop = windowHeight - 160;
  const startLeft = windowWidth / 2 - 120;
  const startRight = windowWidth / 2 + 120;
  const inStartZone =
    pageY >= startTop && pageX >= startLeft && pageX <= startRight;

  return inBackZone || inStartZone;
}

const FingerUp: React.FC = () => {
  const { windowWidth = 0 } = getSystemInfoSync();
  const transformX = (windowWidth / 375) * 50;
  const { height = 0, top = 0 } = getMenuButtonBoundingClientRect();
  const clock = useRef<NodeJS.Timer>();
  const timer = useRef<NodeJS.Timer>();
  const activeTouchIdsRef = useRef<Set<number>>(new Set());
  const [fingers, setFingers] = useState<Fingers[]>([]);
  const [count, setCount] = useState(3);
  const [selectId, setSelectId] = useState<number>();
  const [showHome, setShowHome] = useState(() => isFirstPageInStack());
  const disabled = useMemo(() => fingers.length < 2, [fingers.length]);

  useDidShow(() => {
    setShowHome(isFirstPageInStack());
  });

  const touchStart = (e: Taro.ITouchEvent) => {
    if (timer.current) return;

    const validTouches = e.touches.filter(
      (t) => !isUiZoneTouch(t.pageX, t.pageY)
    );
    if (validTouches.length === 0) return;

    validTouches.forEach((t) => activeTouchIdsRef.current.add(t.identifier));
    setFingers((prev) => {
      const ids = new Set(prev.map((i) => i.id));
      const additions: Fingers[] = [];
      let colorIndex = prev.length;
      validTouches.forEach((t) => {
        if (!ids.has(t.identifier)) {
          additions.push({
            id: t.identifier,
            x: t.pageX,
            y: t.pageY,
            color: colors[colorIndex % colors.length],
          });
          colorIndex += 1;
          ids.add(t.identifier);
        }
      });
      return additions.length ? [...prev, ...additions] : prev;
    });
  };

  const touchMove = (e: Taro.ITouchEvent) => {
    const moves = new Map(
      e.changedTouches.map((t) => [t.identifier, { x: t.pageX, y: t.pageY }])
    );
    if (moves.size === 0) return;
    setFingers((prev) =>
      prev.map((f) => {
        const pos = moves.get(f.id);
        return pos ? { ...f, ...pos } : f;
      })
    );
  };

  const handleTouchEndOrCancel = (e: Taro.ITouchEvent) => {
    e.changedTouches.forEach((t) =>
      activeTouchIdsRef.current.delete(t.identifier)
    );

    const activeTouchIds = new Set(e.touches.map((t) => t.identifier));
    activeTouchIdsRef.current.forEach((id) => {
      if (!activeTouchIds.has(id)) {
        activeTouchIdsRef.current.delete(id);
      }
    });

    if (e.touches.length === 0 || activeTouchIdsRef.current.size === 0) {
      activeTouchIdsRef.current.clear();
      setFingers([]);
      return;
    }

    setFingers((prev) =>
      prev.filter((f) => activeTouchIdsRef.current.has(f.id))
    );
  };

  const generateRandomArr = () => {
    const ids = fingers.map((i) => i.id);
    const idArr: number[] = [];
    const times = Math.ceil(10 / ids.length);
    for (let i = 0; i < times; i++) {
      idArr.push(...ids);
    }
    const selectedIndex = randomNum(0, ids.length);
    idArr.push(ids[selectedIndex]);
    return idArr;
  };

  const start = (e?: Taro.ITouchEvent) => {
    e?.stopPropagation();
    if (disabled) return;
    clearClock();
    const idArr = generateRandomArr();
    timer.current = setInterval(() => {
      if (!idArr.length) {
        clearTimer();
        return;
      }
      const id = idArr.shift();
      setSelectId(id);
    }, 400);
  };

  const clearClock = () => {
    clearInterval(clock.current);
    clock.current = undefined;
  };

  const clearTimer = () => {
    clearInterval(timer.current);
    timer.current = undefined;
  };

  const startCountDown = () => {
    clock.current = setInterval(() => {
      setCount((n) => {
        const newN = n - 1;
        if (newN <= 0) {
          clearClock();
          start();
        }
        return newN;
      });
    }, 1000);
  };

  const resetAction = () => {
    clearTimer();
    clearClock();
    setSelectId(undefined);
  };

  const onNewFingerAdd = () => {
    clearClock();
    setCount(3);
    startCountDown();
  };

  useEffect(() => {
    if (fingers.length >= 2) {
      if (timer.current) return;
      onNewFingerAdd();
    } else {
      resetAction();
    }
  }, [fingers.length]);

  useEffect(() => {
    return () => {
      clearClock();
      clearTimer();
      activeTouchIdsRef.current.clear();
    };
  }, []);

  useShareAppMessage(() => ({
    title: "指尖轮盘",
    path: "/pages/fingerUp/index",
  }));

  return (
    <View className="fingerUp">
      {IS_WECHAT && (
        <View style={{ top }} className="goBack" onClick={navigateBackOrHome}>
          <AtIcon
            value={showHome ? "home" : "chevron-left"}
            size={height - 4}
          />
        </View>
      )}

      <View
        className="fingerUp__playArea"
        onTouchStart={touchStart}
        onTouchMove={touchMove}
        onTouchEnd={handleTouchEndOrCancel}
        onTouchCancel={handleTouchEndOrCancel}
      >
        <CustomWrapper>
          {fingers.map((i) => (
            <MovableArea key={i.id} className="area">
              <MovableView
                direction="none"
                disabled
                x={i.x - transformX}
                y={i.y - transformX}
                className="item"
                style={{
                  "--bgColor": i.color,
                  opacity:
                    typeof selectId === "number" && i.id !== selectId ? 0.5 : 1,
                }}
              >
                {[0, 1].map((ring) => (
                  <View
                    key={ring}
                    className={cs(
                      "bg",
                      typeof selectId === "number" &&
                        i.id !== selectId &&
                        "dark"
                    )}
                  />
                ))}
              </MovableView>
            </MovableArea>
          ))}
        </CustomWrapper>
        {!fingers.length && (
          <View className="tips">
            <View>1.请每位玩家（2~5）人用一根手指按住屏幕</View>
            <View>2.等待3秒后自动开始或点击下方开始按钮</View>
            <View>
              3.继续按住屏幕直到动画结束，被选中者（赢家）将会被高亮显示
            </View>
          </View>
        )}
      </View>

      <View
        catchMove
        className={cs("start", (!clock.current || disabled) && "disabled")}
        onClick={start}
      >
        开始{clock.current ? `(${count})` : ""}
      </View>
    </View>
  );
};

export default FingerUp;
