# Mini Pocket 后端

百宝口袋工坊小程序后端，基于 pnpm monorepo + NestJS + Prisma + MySQL。

## 技术栈

| 层级 | 技术 |
|------|------|
| 包管理 | pnpm workspace |
| 后端 | NestJS、Prisma、MySQL、TypeScript |
| 部署 | git pull + 构建 + pm2 |

## 项目结构

```
mini-pocket-back/
├── apps/
│   └── api/          # NestJS API
├── packages/         # 共享包（预留）
├── deploy.sh         # 生产部署脚本
└── ecosystem.config.cjs
```

## 本地开发

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
# 编辑 DATABASE_URL、WECHAT_APP_ID、WECHAT_APP_SECRET、JWT_SECRET

pnpm db:migrate
pnpm db:seed
pnpm dev    # http://localhost:3035/api
```

## 生产部署

### 1. 服务器准备

- Node.js >= 20、pnpm、pm2、git、MySQL、Nginx
- clone 代码到服务器

### 2. 配置环境变量

```bash
cp apps/api/.env.example apps/api/.env
# 填写生产环境配置
```

### 3. 首次部署

```bash
chmod +x deploy.sh
./deploy.sh
```

后续更新只需再次执行 `./deploy.sh`。

### 4. Nginx 反向代理（可选）

参考 `deploy/nginx/api.mini-pocket.qiexuxing.top.conf`，推荐子域名：

- `api.mini-pocket.qiexuxing.top`

```bash
sudo certbot --nginx -d api.mini-pocket.qiexuxing.top
```

### 5. 验证

```bash
curl https://api.mini-pocket.qiexuxing.top/api/health
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 开发模式（热重载） |
| `pnpm build` | 构建 API |
| `pnpm start` | 生产模式启动（本地） |
| `pnpm db:migrate` | 开发环境数据库迁移 |
| `pnpm db:migrate:deploy` | 生产环境应用迁移 |
| `pnpm db:seed` | 导入工具种子数据 |

## 端口

| 服务 | 默认端口 |
|------|----------|
| API | 3035 |
