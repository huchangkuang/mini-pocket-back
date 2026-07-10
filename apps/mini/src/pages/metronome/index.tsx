import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Taro, { useShareAppMessage } from "@tarojs/taro";
import { Input, ScrollView, Switch, View } from "@tarojs/components";
import "./index.scss";
import cs from "classnames";
import voice from "@/audio/beat_cut.mp3";
import Icon from "@/components/Icon";
import { errorToast } from "@/utils/errorToast";
import {
  CommonBeatList,
  DEFAULT_BPM,
  MAX_BPM,
  PRESET_BPM_LABELS,
  PRESET_BPM_LIST,
} from "@/pages/metronome/constant";
import {
  loadMetronomeSettings,
  MetronomeSettings,
  saveMetronomeSettings,
} from "@/pages/metronome/settings";

const Metronome: React.FC = () => {
  const [bpm, setBpmState] = useState(DEFAULT_BPM);
  const [customInput, setCustomInput] = useState("");
  const [curN, setCurN] = useState<number>();
  const [beating, setBeating] = useState(false);
  const [showAllPanel, setShowAllPanel] = useState(false);
  const [settings, setSettings] = useState<MetronomeSettings>(() => loadMetronomeSettings());

  const isStop = useRef(true);
  const beatingRef = useRef(false);
  const innerAudioContext = useRef<Taro.InnerAudioContext>();
  const timer = useRef<NodeJS.Timer>();
  const bpmRef = useRef(bpm);
  const settingsRef = useRef(settings);

  bpmRef.current = bpm;
  beatingRef.current = beating;
  settingsRef.current = settings;

  const progressDeg = useMemo(() => (bpm / MAX_BPM) * 360, [bpm]);

  const clearTimer = useCallback(() => {
    clearInterval(timer.current);
    timer.current = undefined;
  }, []);

  const goBeatN = useCallback(() => {
    const { soundEnabled, vibrateEnabled } = settingsRef.current;
    if (soundEnabled && innerAudioContext.current) {
      innerAudioContext.current.stop();
      innerAudioContext.current.seek(0);
      innerAudioContext.current.play();
    }
    if (vibrateEnabled) {
      try {
        Taro.vibrateShort({ type: "medium" });
      } catch {
        // platform may not support vibrate
      }
    }
    setCurN((_n) => {
      if (_n === undefined) {
        return 0;
      }
      const newN = _n + 1;
      return newN > 3 ? 0 : newN;
    });
  }, []);

  const startMetronome = useCallback(() => {
    isStop.current = false;
    setBeating(true);
    const frequency = Math.floor((60 * 1000) / bpmRef.current);
    goBeatN();
    setCurN(0);
    clearTimer();
    timer.current = setInterval(() => {
      if (!isStop.current) {
        goBeatN();
      } else {
        clearTimer();
        setCurN(undefined);
      }
    }, frequency);
  }, [clearTimer, goBeatN]);

  const stopMetronome = useCallback(() => {
    isStop.current = true;
    clearTimer();
    setBeating(false);
    setCurN(undefined);
  }, [clearTimer]);

  const restartMetronome = useCallback(() => {
    stopMetronome();
    startMetronome();
  }, [startMetronome, stopMetronome]);

  const setBpm = useCallback(
    (val: number) => {
      const clamped = Math.min(Math.max(1, val), MAX_BPM);
      setBpmState(clamped);
      bpmRef.current = clamped;
      if (beatingRef.current) {
        restartMetronome();
      }
    },
    [restartMetronome],
  );

  const changeBpm = useCallback(
    (delta: number) => {
      setBpm(bpmRef.current + delta);
    },
    [setBpm],
  );

  const validate = () => {
    if (customInput) {
      if (/\D/g.test(customInput)) {
        return "请输入正确的自定义频率值";
      }
      if (Number(customInput) > MAX_BPM) {
        return "自定义频率值不得超过208";
      }
      if (Number(customInput) < 1) {
        return "自定义频率值不得小于1";
      }
    }
  };

  const onToggle = () => {
    const msg = validate();
    if (msg) {
      errorToast(msg);
      return;
    }
    if (beating) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  const onCustomInput = (value: string) => {
    setCustomInput(value);
    if (!value) {
      return;
    }
    const num = Number(value);
    if (!/\D/g.test(value) && num >= 1 && num <= MAX_BPM) {
      setBpm(num);
    }
  };

  const clearCustomInput = () => {
    setCustomInput("");
  };

  const updateSettings = (patch: Partial<MetronomeSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveMetronomeSettings(next);
      return next;
    });
  };

  const selectFromAllList = (val: number) => {
    setBpm(val);
    setCustomInput("");
    setShowAllPanel(false);
  };

  useEffect(() => {
    innerAudioContext.current = Taro.createInnerAudioContext();
    innerAudioContext.current.src = voice;
    innerAudioContext.current.obeyMuteSwitch = false;
    innerAudioContext.current.autoplay = false;
    innerAudioContext.current.loop = false;
    return () => {
      isStop.current = true;
      clearTimer();
      innerAudioContext.current?.destroy();
      innerAudioContext.current = undefined;
    };
  }, [clearTimer]);

  useShareAppMessage(() => ({
    title: "节拍器",
    path: "/pages/metronome/index",
  }));

  return (
    <View className="metronome">
      <ScrollView scrollY className="metronome__scroll">
        <View className="metronome__content">
          <View className="metronome__beats">
            {new Array(4).fill("").map((_, n) => (
              <View
                key={n}
                className={cs(
                  "metronome__beat",
                  n === 0 && "metronome__beat--first",
                  n === curN && "metronome__beat--active",
                )}
              />
            ))}
          </View>

          <View className="metronome__dial">
            <View className="metronome__dialRing">
              <View
                className="metronome__dialTrack"
                style={{
                  background: `conic-gradient(from -90deg, #0077ce 0deg, #0077ce ${progressDeg}deg, #e6e8eb ${progressDeg}deg, #e6e8eb 360deg)`,
                }}
              />
            </View>
            <View className="metronome__dialCenter">
              <View className="metronome__dialLabel">TEMPO</View>
              <View className="metronome__dialControls">
                <View className="metronome__dialBtn" onClick={() => changeBpm(-1)}>
                  <Icon name="minus" size={16} color="#005ea4" />
                </View>
                <View className="metronome__dialValue">{bpm}</View>
                <View className="metronome__dialBtn" onClick={() => changeBpm(1)}>
                  <Icon name="add" size={16} color="#005ea4" />
                </View>
              </View>
              <View className="metronome__dialUnit">BPM</View>
            </View>
          </View>

          <View className="metronome__section">
            <View className="metronome__sectionHeader">
              <View className="metronome__sectionTitle">常用节拍</View>
              <View className="metronome__viewAll" onClick={() => setShowAllPanel(true)}>
                查看全部
              </View>
            </View>
            <View className="metronome__presets">
              {PRESET_BPM_LIST.map((preset) => (
                <View
                  key={preset}
                  className={cs(
                    "metronome__preset",
                    bpm === preset && !customInput && "metronome__preset--active",
                  )}
                  onClick={() => {
                    setCustomInput("");
                    setBpm(preset);
                  }}
                >
                  <View className="metronome__presetValue">{preset}</View>
                  <View className="metronome__presetLabel">{PRESET_BPM_LABELS[preset]}</View>
                </View>
              ))}
            </View>
          </View>

          <View className="metronome__section">
            <View className="metronome__inputCard">
              <View className="metronome__inputMain">
                <View className="metronome__inputLabel">自定义频率</View>
                <Input
                  value={customInput}
                  onInput={(e) => onCustomInput(e.detail.value)}
                  className="metronome__input"
                  type="number"
                  placeholder="1-208 内整数"
                  placeholderClass="metronome__inputPlaceholder"
                />
              </View>
              <View className="metronome__inputClear" onClick={clearCustomInput}>
                <Icon name="close" size={16} color="#404752" />
              </View>
            </View>

            <View className="metronome__toggles">
              <View className="metronome__toggleCard">
                <View className="metronome__toggleInfo">
                  <Icon name="volume-max" size={18} color="#005ea4" />
                  <View className="metronome__toggleText">声音提示</View>
                </View>
                <Switch
                  checked={settings.soundEnabled}
                  color="#0077ce"
                  onChange={(e) => updateSettings({ soundEnabled: e.detail.value })}
                />
              </View>
              <View className="metronome__toggleCard">
                <View className="metronome__toggleInfo">
                  <Icon name="volume-mute" size={18} color="#005ea4" />
                  <View className="metronome__toggleText">震动反馈</View>
                </View>
                <Switch
                  checked={settings.vibrateEnabled}
                  color="#0077ce"
                  onChange={(e) => updateSettings({ vibrateEnabled: e.detail.value })}
                />
              </View>
            </View>
          </View>

          <View className="metronome__playSpacer" />
        </View>
      </ScrollView>

      <View className="metronome__playZone">
        <View className="metronome__fab" onClick={onToggle}>
          {beating ? (
            <Icon name="play-stop" size={40} color="#fdfcff" />
          ) : (
            <View className="metronome__fabPlay">
              <Icon name="play-start" size={40} color="#fdfcff" />
            </View>
          )}
        </View>
      </View>

      {showAllPanel && (
        <View className="metronome__panel">
          <View className="metronome__panelMask" onClick={() => setShowAllPanel(false)} />
          <View className="metronome__panelBody">
            <View className="metronome__panelHeader">
              <View className="metronome__panelTitle">全部常用节拍</View>
              <View className="metronome__panelClose" onClick={() => setShowAllPanel(false)}>
                <Icon name="close" size={16} color="#404752" />
              </View>
            </View>
            <ScrollView scrollY className="metronome__panelScroll">
              <View className="metronome__panelGrid">
                {CommonBeatList.map((item) => (
                  <View
                    key={item}
                    className={cs(
                      "metronome__panelItem",
                      bpm === item && "metronome__panelItem--active",
                    )}
                    onClick={() => selectFromAllList(item)}
                  >
                    {item}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default Metronome;
