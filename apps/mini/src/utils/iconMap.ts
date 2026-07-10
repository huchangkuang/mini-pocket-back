import barrageIcon from "@/images/classify/barrage.svg";
import decisionIcon from "@/images/classify/decision.svg";
import fingerUp from "@/images/classify/fingerUp.svg";
import qrcode from "@/images/classify/qrcode.svg";
import metronome from "@/images/classify/metronome.svg";
import lottery from "@/images/classify/lottery.svg";
import clock from "@/images/classify/clock.svg";
import randomIcon from "@/images/classify/random.svg";
import timeTravelIcon from "@/images/classify/timeTravel.svg";
import xiahouDunIcon from "@/images/classify/xiahouDun.svg";
import hawkingIcon from "@/images/classify/hawking.svg";

const ICON_MAP: Record<string, string> = {
  barrage: barrageIcon,
  decision: decisionIcon,
  fingerUp,
  qrcode,
  metronome,
  lottery,
  clock,
  random: randomIcon,
  timeTravel: timeTravelIcon,
  xiahouDun: xiahouDunIcon,
  hawking: hawkingIcon,
};

const DEFAULT_ICON = randomIcon;

export function resolveIconKey(iconKey: string): string {
  return ICON_MAP[iconKey] ?? DEFAULT_ICON;
}
