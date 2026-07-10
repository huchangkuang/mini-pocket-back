import React, { useCallback, useEffect, useRef, useState } from "react";
import Taro, { useDidHide, useDidShow, useShareAppMessage } from "@tarojs/taro";
import { View, Text, ScrollView } from "@tarojs/components";
import cs from "classnames";
import ToolSliderRow from "@/components/toolEdit/toolSliderRow";
import ToolTipCard from "@/components/toolEdit/toolTipCard";
import ToolBottomBar from "@/components/toolEdit/toolBottomBar";
import "./index.scss";

type Phase = "idle" | "traveling";

const CLOCK_NUMBERS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const NUMBER_ANGLES = [
  0, -30, -60, -90, -120, -150, -180, -210, -240, -270, -300, -330,
];
const TRAVEL_SPEED_MULTIPLIER = 60;

const pad2 = (n: number) => n.toString().padStart(2, "0");

const TimeTravel: React.FC = () => {
  const fakeTime = useRef(Date.now());
  const lastTimestamp = useRef(Date.now());
  const rafId = useRef<number | null>(null);
  const isRunning = useRef(true);
  const phaseRef = useRef<Phase>("idle");
  const durationRef = useRef(10);
  const elapsedRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("idle");
  const [duration, setDuration] = useState(10);
  const [displayTime, setDisplayTime] = useState(() => {
    const now = new Date();
    return {
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
      ms: now.getMilliseconds(),
    };
  });

  phaseRef.current = phase;
  durationRef.current = duration;

  const updateDisplay = useCallback((time: number) => {
    const d = new Date(time);
    setDisplayTime({
      hour: d.getHours(),
      minute: d.getMinutes(),
      second: d.getSeconds(),
      ms: d.getMilliseconds(),
    });
  }, []);

  const completeTravel = useCallback(() => {
    const seconds = durationRef.current;
    setPhase("idle");
    elapsedRef.current = 0;
    fakeTime.current = Date.now();
    updateDisplay(fakeTime.current);

    Taro.showModal({
      title: "",
      content: `你已经穿越至 ${seconds}s 后`,
      showCancel: false,
    });
  }, [updateDisplay]);

  const tick = useCallback(() => {
    const now = Date.now();
    const delta = now - lastTimestamp.current;
    lastTimestamp.current = now;

    if (phaseRef.current === "traveling") {
      elapsedRef.current += delta;
      fakeTime.current += delta * TRAVEL_SPEED_MULTIPLIER;

      if (elapsedRef.current >= durationRef.current * 1000) {
        completeTravel();
      }
    } else {
      fakeTime.current = Date.now();
    }

    updateDisplay(fakeTime.current);

    if (isRunning.current) {
      rafId.current = requestAnimationFrame(tick);
    }
  }, [completeTravel, updateDisplay]);

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

  const handleConfirm = () => {
    if (phase !== "idle") return;
    elapsedRef.current = 0;
    fakeTime.current = Date.now();
    setPhase("traveling");
  };

  useShareAppMessage(() => ({
    title: "时间穿越",
    path: "/pages/timeTravel/index",
  }));

  const { hour, minute, second, ms } = displayTime;
  const sDeg = (second + ms / 1000) * 6;
  const mDeg = (minute + second / 60) * 6;
  const hDeg = ((hour % 12) + minute / 60) * 30;
  const digitalTime = `${pad2(hour)}:${pad2(minute)}:${pad2(second)}`;
  const isTraveling = phase === "traveling";

  return (
    <View className="timeTravel">
      <ScrollView scrollY className="timeTravel__scroll">
        <View className="timeTravel__content">
          <ToolTipCard>选择穿越时长，确认后时钟将快进穿越至未来</ToolTipCard>

          <View className="timeTravel__clockWrap">
            <View className="timeTravel__face">
              <View className="timeTravel__numbers">
                {CLOCK_NUMBERS.map((num, i) => (
                  <View
                    key={num}
                    className="timeTravel__number"
                    style={{
                      transform: `rotate(${
                        NUMBER_ANGLES[i]
                      }deg) translateY(-220rpx) rotate(${-NUMBER_ANGLES[
                        i
                      ]}deg)`,
                    }}
                  >
                    <Text>{num}</Text>
                  </View>
                ))}
              </View>
              <View className="timeTravel__arms">
                <View
                  className="timeTravel__arm timeTravel__arm--hour"
                  style={{
                    transform: `translate(-50%, -100%) rotate(${hDeg}deg)`,
                  }}
                />
                <View
                  className="timeTravel__arm timeTravel__arm--minute"
                  style={{
                    transform: `translate(-50%, -100%) rotate(${mDeg}deg)`,
                  }}
                />
                <View
                  className="timeTravel__arm timeTravel__arm--second"
                  style={{
                    transform: `translate(-50%, -100%) rotate(${sDeg}deg)`,
                  }}
                />
              </View>
              <View className="timeTravel__center" />
            </View>

            <View className="timeTravel__digital">{digitalTime}</View>

            <View
              className={cs(
                "timeTravel__status",
                isTraveling && "timeTravel__status--breathe"
              )}
            >
              <View className="timeTravel__statusDot" />
              <Text className="timeTravel__statusText">
                {isTraveling ? "时空穿越中..." : "等待穿越指令"}
              </Text>
            </View>
          </View>

          <ToolSliderRow
            label="穿越时长"
            value={duration}
            min={5}
            max={15}
            unit="s"
            disabled={isTraveling}
            onChange={setDuration}
          />
        </View>
      </ScrollView>

      {!isTraveling && (
        <ToolBottomBar label="开始穿越" icon="play" onClick={handleConfirm} />
      )}
    </View>
  );
};

export default TimeTravel;
