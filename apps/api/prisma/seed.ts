import { Accent, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { code: 'life', label: '生活', sortOrder: 1 },
  { code: 'fun', label: '娱乐', sortOrder: 2 },
  { code: 'efficiency', label: '效率', sortOrder: 3 },
  { code: 'dev', label: '开发', sortOrder: 4 },
];

const tools: {
  routePath: string;
  name: string;
  description: string;
  iconKey: string;
  accent: Accent;
  categoryCode: string;
  heatScore: number;
  enabled: boolean;
  sortOrder: number;
}[] = [
  {
    routePath: '/pages/handsBarrage/edit/index',
    name: '手持弹幕',
    description: '应援与表达神器',
    iconKey: 'barrage',
    accent: 'primary',
    categoryCode: 'fun',
    heatScore: 1200,
    enabled: true,
    sortOrder: 1,
  },
  {
    routePath: '/pages/doDescription/index',
    name: '做个决定吧',
    description: '告别选择困难',
    iconKey: 'decision',
    accent: 'secondary',
    categoryCode: 'fun',
    heatScore: 999,
    enabled: true,
    sortOrder: 2,
  },
  {
    routePath: '/pages/fingerUp/index',
    name: '指尖轮盘',
    description: '指尖上的运气',
    iconKey: 'fingerUp',
    accent: 'tertiary',
    categoryCode: 'fun',
    heatScore: 2500,
    enabled: true,
    sortOrder: 3,
  },
  {
    routePath: '/pages/qrcode/index',
    name: '二维码生成',
    description: '快速转换链接',
    iconKey: 'qrcode',
    accent: 'primary',
    categoryCode: 'efficiency',
    heatScore: 850,
    enabled: true,
    sortOrder: 4,
  },
  {
    routePath: '/pages/metronome/index',
    name: '节拍器',
    description: '精准节奏控制',
    iconKey: 'metronome',
    accent: 'secondary',
    categoryCode: 'life',
    heatScore: 620,
    enabled: true,
    sortOrder: 5,
  },
  {
    routePath: '/pages/lottery/index',
    name: '随机数',
    description: '幸运数字生成',
    iconKey: 'lottery',
    accent: 'tertiary',
    categoryCode: 'fun',
    heatScore: 540,
    enabled: false,
    sortOrder: 6,
  },
  {
    routePath: '/pages/returnClock/index',
    name: '反方向的钟',
    description: '让时间“倒流”',
    iconKey: 'clock',
    accent: 'primary',
    categoryCode: 'life',
    heatScore: 430,
    enabled: true,
    sortOrder: 7,
  },
  {
    routePath: '/pages/guessNumber/index',
    name: '猜数字',
    description: '聚会小游戏',
    iconKey: 'random',
    accent: 'tertiary',
    categoryCode: 'fun',
    heatScore: 780,
    enabled: true,
    sortOrder: 8,
  },
  {
    routePath: '/pages/timeTravel/index',
    name: '时间穿越',
    description: '一键快进未来',
    iconKey: 'timeTravel',
    accent: 'primary',
    categoryCode: 'fun',
    heatScore: 400,
    enabled: true,
    sortOrder: 9,
  },
  {
    routePath: '/pages/xiahouDun/index',
    name: '夏侯惇模拟器',
    description: '左眼视觉体验',
    iconKey: 'xiahouDun',
    accent: 'secondary',
    categoryCode: 'fun',
    heatScore: 380,
    enabled: true,
    sortOrder: 10,
  },
  {
    routePath: '/pages/hawking/index',
    name: '霍金模拟器',
    description: '屏幕倾斜体验',
    iconKey: 'hawking',
    accent: 'tertiary',
    categoryCode: 'fun',
    heatScore: 360,
    enabled: true,
    sortOrder: 11,
  },
];

const levels = [
  { level: 1, minXp: 0, title: '工坊学徒', sortOrder: 1 },
  { level: 2, minXp: 100, title: '见习工匠', sortOrder: 2 },
  { level: 3, minXp: 300, title: '初级工匠', sortOrder: 3 },
  { level: 4, minXp: 600, title: '高级工匠', sortOrder: 4 },
  { level: 5, minXp: 1000, title: '工坊大师', sortOrder: 5 },
  { level: 6, minXp: 1500, title: '百宝达人', sortOrder: 6 },
  { level: 7, minXp: 2500, title: '传奇工匠', sortOrder: 7 },
];

async function main() {
  for (const level of levels) {
    await prisma.levelConfig.upsert({
      where: { level: level.level },
      update: {
        minXp: level.minXp,
        title: level.title,
        sortOrder: level.sortOrder,
      },
      create: level,
    });
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { code: category.code },
      update: category,
      create: category,
    });
  }

  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany()).map((item) => [item.code, item.id]),
  );

  for (const tool of tools) {
    const categoryId = categoryMap[tool.categoryCode];
    if (!categoryId) {
      throw new Error(`Missing category: ${tool.categoryCode}`);
    }

    const existing = await prisma.tool.findUnique({
      where: { routePath: tool.routePath },
    });
    if (existing) continue;

    await prisma.tool.create({
      data: {
        routePath: tool.routePath,
        name: tool.name,
        description: tool.description,
        iconKey: tool.iconKey,
        accent: tool.accent,
        categoryId,
        heatScore: tool.heatScore,
        enabled: tool.enabled,
        sortOrder: tool.sortOrder,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
