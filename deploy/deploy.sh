#!/usr/bin/env bash
set -euo pipefail

# Mini Pocket API 部署脚本（PM2 + 本机 MySQL）
# 用法: ./deploy/deploy.sh

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

echo "==> 拉取最新代码"
git pull --ff-only

echo "==> 安装依赖"
corepack enable
pnpm install --frozen-lockfile

echo "==> 生成 Prisma Client"
pnpm db:generate

echo "==> 执行数据库迁移"
pnpm db:migrate:deploy

echo "==> 构建 API"
pnpm build

echo "==> 重启 PM2 进程"
pm2 startOrReload deploy/ecosystem.config.cjs --update-env

echo "==> 部署完成"
pm2 status mini-pocket-api
