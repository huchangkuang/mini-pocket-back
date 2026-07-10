import React, { useCallback, useEffect, useRef, useState } from "react";
import Taro, { useDidHide, useDidShow, useShareAppMessage } from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import cs from "classnames";
import "./index.scss";

type FlowMode = "reverse" | "accelerate" | "normal";
type ActiveButton = "reverse" | "normal" | null;

const ACCELERATE_MULTIPLIER = 10;

const CLOCK_NUMBERS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const NUMBER_ANGLES = [0, -30, -60, -90, -120, -150, -180, -210, -240, -270, -300, -330];

const FLOW_STATUS: Record<
  FlowMode,
  { text: string; dotVariant: "primary" | "secondary"; breathe: boolean }
> = {
  reverse: { text: "时光逆流中...", dotVariant: "primary", breathe: true },
  accelerate: {
    text: "时光快速逆流中...",
    dotVariant: "primary",
    breathe: true,
  },
  normal: { text: "遵循自然秩序中", dotVariant: "secondary", breathe: false },
};

const PAUSE_STATUS = {
  text: "时空已静止",
  dotVariant: "outline" as const,
  breathe: false,
};

const pad2 = (n: number) => n.toString().padStart(2, "0");

const ReturnClock: React.FC = () => {
  const fakeTime = useRef(Date.now());
  const lastTimestamp = useRef(Date.now());
  const rafId = useRef<number | null>(null);
  const isRunning = useRef(true);
  const flowModeRef = useRef<FlowMode>("reverse");
  const isPausedRef = useRef(false);

  const [flowMode, setFlowMode] = useState<FlowMode>("reverse");
  const [activeButton, setActiveButton] = useState<ActiveButton>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [displayTime, setDisplayTime] = useState(() => {
    const now = new Date();
    return {
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
      ms: now.getMilliseconds(),
    };
  });

  flowModeRef.current = flowMode;
  isPausedRef.current = isPaused;

  const updateDisplay = useCallback((time: number) => {
    const d = new Date(time);
    setDisplayTime({
      hour: d.getHours(),
      minute: d.getMinutes(),
      second: d.getSeconds(),
      ms: d.getMilliseconds(),
    });
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    const delta = now - lastTimestamp.current;
    lastTimestamp.current = now;

    if (!isPausedRef.current) {
      const currentFlow = flowModeRef.current;
      if (currentFlow === "reverse") {
        fakeTime.current -= delta;
      } else if (currentFlow === "accelerate") {
        fakeTime.current -= delta * ACCELERATE_MULTIPLIER;
      } else if (currentFlow === "normal") {
        fakeTime.current += delta;
      }
    }

    updateDisplay(fakeTime.current);

    if (isRunning.current) {
      rafId.current = requestAnimationFrame(tick);
    }
  }, [updateDisplay]);

  const startLoop = useCallback(() => {
    if (rafId.current != null) return;
    isRunning.current = true;
    lastTimestamp.current = Date.now();
    rafId.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopLoop = useCallback(() => {
    isRunning.current = false;
    if (rafId.current != null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  useEffect(() => {
    startLoop();
    return () => stopLoop();
  }, [startLoop, stopLoop]);

  useDidHide(() => stopLoop());
  useDidShow(() => startLoop());

  const handleReverseClick = () => {
    setIsPaused(false);
    if (activeButton === "reverse") {
      setFlowMode("reverse");
      setActiveButton(null);
    } else {
      setFlowMode("accelerate");
      setActiveButton("reverse");
    }
  };

  const handleNormalClick = () => {
    setIsPaused(false);
    if (activeButton === "normal") {
      setFlowMode("reverse");
      setActiveButton(null);
    } else {
      setFlowMode("normal");
      setActiveButton("normal");
    }
  };

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  useShareAppMessage(() => ({
    title: "反方向的钟",
    path: "/pages/returnClock/index",
  }));

  const { hour, minute, second, ms } = displayTime;
  const sDeg = (second + ms / 1000) * 6;
  const mDeg = (minute + second / 60) * 6;
  const hDeg = ((hour % 12) + minute / 60) * 30;
  const digitalTime = `${pad2(hour)}:${pad2(minute)}:${pad2(second)}`;
  const status = isPaused ? PAUSE_STATUS : FLOW_STATUS[flowMode];

  const isReverseActive = activeButton === "reverse";
  const isNormalActive = activeButton === "normal";

  return (
    <View className="returnClock">
      <View className="returnClock__grid" />
      <View className="returnClock__content">
        <View className="returnClock__face">
          <View className="returnClock__numbers">
            {CLOCK_NUMBERS.map((num, i) => (
              <View
                key={num}
                className="returnClock__number"
                style={{
                  transform: `rotate(${
                    NUMBER_ANGLES[i]
                  }deg) translateY(-220rpx) rotate(${-NUMBER_ANGLES[i]}deg)`,
                }}
              >
                <Text>{num}</Text>
              </View>
            ))}
          </View>
          <View className="returnClock__arms">
            <View
              className="returnClock__arm returnClock__arm--hour"
              style={{
                transform: `translate(-50%, -100%) rotate(${hDeg}deg)`,
              }}
            />
            <View
              className="returnClock__arm returnClock__arm--minute"
              style={{
                transform: `translate(-50%, -100%) rotate(${mDeg}deg)`,
              }}
            />
            <View
              className="returnClock__arm returnClock__arm--second"
              style={{
                transform: `translate(-50%, -100%) rotate(${sDeg}deg)`,
              }}
            />
          </View>
          <View className="returnClock__center" />
        </View>

        <View className="returnClock__digital">{digitalTime}</View>

        <View
          className={cs(
            "returnClock__status",
            status.breathe && "returnClock__status--breathe",
            `returnClock__status--${status.dotVariant}`,
          )}
        >
          <View className="returnClock__statusDot" />
          <Text className="returnClock__statusText">{status.text}</Text>
        </View>

        <View className="returnClock__controls">
          <View
            className={cs("returnClock__btn", isReverseActive && "returnClock__btn--active")}
            onClick={handleReverseClick}
          >
            {!isReverseActive && <AtIcon value="reload" size="32" color="#005ea4" />}
            <Text className="returnClock__btnLabel">加速逆流</Text>
          </View>
          <View className="returnClock__btn" onClick={handlePauseToggle}>
            <AtIcon value={isPaused ? "play" : "pause"} size="32" color="#005ea4" />
            <Text className="returnClock__btnLabel">时空暂停</Text>
          </View>
          <View
            className={cs("returnClock__btn", isNormalActive && "returnClock__btn--active")}
            onClick={handleNormalClick}
          >
            {!isNormalActive && <AtIcon value="play" size="32" color="#005ea4" />}
            <Text className="returnClock__btnLabel">正常流动</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ReturnClock;
