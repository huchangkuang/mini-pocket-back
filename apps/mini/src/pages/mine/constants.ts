export type DemoLoggedInUser = {
  nickname: string;
  joinDate: string;
  badge: string;
};

export type StatColor = "primary" | "secondary" | "tertiary";

export type StatItem = {
  value: string;
  label: string;
  color: StatColor;
};

export type MineMenuItem = {
  id: string;
  labelGuest: string;
  labelLoggedIn: string;
  icon: string;
};

export type LevelProgressData = {
  title: string;
  current: number;
  total: number;
  percent: number;
  hint: string;
  showMedal: boolean;
};

export const demoLoggedInUser: DemoLoggedInUser = {
  nickname: "口袋达人",
  joinDate: "2023年10月12日",
  badge: "高级工匠",
};

export const guestStats: StatItem[] = [
  { value: "--", label: "已用工具", color: "primary" },
  { value: "0", label: "活跃天数", color: "primary" },
  { value: "--", label: "收藏工具", color: "primary" },
];

export const loggedInStats: StatItem[] = [
  { value: "42", label: "已用工具", color: "primary" },
  { value: "156", label: "活跃天数", color: "secondary" },
  { value: "28", label: "收藏", color: "tertiary" },
];

export const mineMenuItems: MineMenuItem[] = [
  {
    id: "feedback",
    labelGuest: "问题反馈",
    labelLoggedIn: "意见反馈",
    icon: "message",
  },
  // {
  //   id: "settings",
  //   labelGuest: "系统设置",
  //   labelLoggedIn: "系统设置",
  //   icon: "settings",
  // },
  {
    id: "about",
    labelGuest: "关于工坊",
    labelLoggedIn: "关于工坊",
    icon: "alert-circle",
  },
];

export const guestLevelProgress: LevelProgressData = {
  title: "WORKSHOP LEVEL",
  current: 0,
  total: 1000,
  percent: 2,
  hint: "登录后开启工坊大师之路",
  showMedal: true,
};
