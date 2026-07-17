import barrageIcon from "@/images/classify/barrage.svg";
import decisionIcon from "@/images/classify/decision.svg";
import fingerUp from "@/images/classify/fingerUp.svg";
import qrcode from "@/images/classify/qrcode.svg";
import metronome from "@/images/classify/metronome.svg";
import lottery from "@/images/classify/lottery.svg";
import clock from "@/images/classify/clock.svg";
import timeTravelIcon from "@/images/classify/timeTravel.svg";
import xiahouDunIcon from "@/images/classify/xiahouDun.svg";
import hawkingIcon from "@/images/classify/hawking.svg";
// import beadArtIcon from "@/images/classify/beadArt.svg";
import randomIcon from "@/images/classify/random.svg";
import mahjongScoreIcon from "@/images/classify/mahjongScore.svg";

export type Accent = "primary" | "secondary" | "tertiary";

export type ToolItem = {
  id?: number;
  icon: string;
  text: string;
  desc: string;
  path: string;
  accent: Accent;
  category?: string;
  categoryLabel?: string;
  heat: string;
  heatRank: number;
  isFavorite?: boolean;
};

export type CategoryChip = {
  id: string;
  label: string;
};

export const categoryChips: CategoryChip[] = [
  { id: "all", label: "全部" },
  { id: "life", label: "生活" },
  { id: "fun", label: "娱乐" },
  { id: "efficiency", label: "效率" },
  { id: "dev", label: "开发" },
];

export const classifyList: ToolItem[] = [
  {
    icon: barrageIcon,
    text: "手持弹幕",
    desc: "应援与表达神器",
    path: "/pages/handsBarrage/edit/index",
    accent: "primary",
    category: "fun",
    heat: "1.2k",
    heatRank: 1200,
  },
  {
    icon: decisionIcon,
    text: "做个决定吧",
    desc: "告别选择困难",
    path: "/pages/doDescription/index",
    accent: "secondary",
    category: "fun",
    heat: "999+",
    heatRank: 999,
  },
  {
    icon: fingerUp,
    text: "指尖轮盘",
    desc: "指尖上的运气",
    path: "/pages/fingerUp/index",
    accent: "tertiary",
    category: "fun",
    heat: "2.5k",
    heatRank: 2500,
  },
  {
    icon: qrcode,
    text: "二维码生成",
    desc: "快速转换链接",
    path: "/pages/qrcode/index",
    accent: "primary",
    category: "efficiency",
    heat: "850",
    heatRank: 850,
  },
  {
    icon: metronome,
    text: "节拍器",
    desc: "精准节奏控制",
    path: "/pages/metronome/index",
    accent: "secondary",
    category: "life",
    heat: "620",
    heatRank: 620,
  },
  {
    icon: lottery,
    text: "随机数",
    desc: "幸运数字生成",
    path: "/pages/lottery/index",
    accent: "tertiary",
    category: "fun",
    heat: "540",
    heatRank: 540,
  },
  {
    icon: clock,
    text: "反方向的钟",
    desc: "让时间“倒流”",
    path: "/pages/returnClock/index",
    accent: "primary",
    category: "life",
    heat: "430",
    heatRank: 430,
  },
  // {
  //   icon: beadArtIcon,
  //   text: "拼豆图片生成",
  //   desc: "像素化艺术创作",
  //   path: "/pages/beadArt/index",
  //   accent: "secondary",
  //   category: "efficiency",
  // },
  {
    icon: randomIcon,
    text: "猜数字",
    desc: "聚会小游戏",
    path: "/pages/guessNumber/index",
    accent: "tertiary",
    category: "fun",
    heat: "780",
    heatRank: 780,
  },
  {
    icon: mahjongScoreIcon,
    text: "麻将计分",
    desc: "多人共享记账",
    path: "/pages/mahjongScore/index",
    accent: "primary",
    category: "fun",
    heat: "760",
    heatRank: 760,
  },
  {
    icon: timeTravelIcon,
    text: "时间穿越",
    desc: "一键快进未来",
    path: "/pages/timeTravel/index",
    accent: "primary",
    category: "fun",
    heat: "400",
    heatRank: 400,
  },
  {
    icon: xiahouDunIcon,
    text: "夏侯惇模拟器",
    desc: "左眼视觉体验",
    path: "/pages/xiahouDun/index",
    accent: "secondary",
    category: "fun",
    heat: "380",
    heatRank: 380,
  },
  {
    icon: hawkingIcon,
    text: "霍金模拟器",
    desc: "屏幕倾斜体验",
    path: "/pages/hawking/index",
    accent: "tertiary",
    category: "fun",
    heat: "360",
    heatRank: 360,
  },
];

export const excludeClassifyList = ["/pages/lottery/index"];
