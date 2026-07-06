#!/usr/bin/env bash
# mini-pocket-back 生产部署脚本（git pull + 构建 + pm2）
# 首次部署前请确保：
#   1. 服务器已安装 Node 20+、pnpm、pm2、git
#   2. 已配置 apps/api/.env
#   3. MySQL 已创建 mini_pocket 库
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

BRANCH="${DEPLOY_BRANCH:-main}"
PNPM_VERSION="${PNPM_VERSION:-10.6.5}"

log() { printf '[deploy] %s\n' "$*"; }

log "开始部署 mini-pocket-back（分支: ${BRANCH}）"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "错误: 当前目录不是 git 仓库" >&2
  exit 1
fi

if [[ ! -f apps/api/.env ]]; then
  echo "错误: 缺少 apps/api/.env，请先从 apps/api/.env.example 复制并填写" >&2
  exit 1
fi

log "拉取最新代码..."
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

log "准备 pnpm ${PNPM_VERSION}..."
if command -v corepack >/dev/null 2>&1; then
  corepack enable
  corepack prepare "pnpm@${PNPM_VERSION}" --activate
fi

log "安装依赖..."
pnpm install --frozen-lockfile

log "生成 Prisma Client..."
pnpm db:generate

log "应用数据库迁移..."
pnpm db:migrate:deploy

log "构建 API..."
pnpm build

log "重启 pm2 进程..."
if pm2 describe mini-pocket-api >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save

log "部署完成"
pm2 status mini-pocket-api
