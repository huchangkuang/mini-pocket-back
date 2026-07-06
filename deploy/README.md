# Mini Pocket 后端部署说明

## 子域名建议

| 用途 | 推荐子域名 | 说明 |
|------|-----------|------|
| API（推荐） | `api.mini-pocket.qiexuxing.top` | 语义清晰，后续后台可用 `admin.mini-pocket.qiexuxing.top` |
| API（备选） | `mini-pocket.qiexuxing.top` | 更简单，适合当前只有 API 的阶段 |

小程序 `request` 合法域名填：`https://api.mini-pocket.qiexuxing.top`

---

## 方式一：Docker Compose（推荐）

### 1. 准备环境变量

```bash
cp deploy/.env.production.example apps/api/.env
# 编辑 apps/api/.env，若用 compose 内置 MySQL:
# DATABASE_URL="mysql://mini_pocket:你的密码@mysql:3306/mini_pocket"
```

在项目根目录创建 `.env`（仅 docker-compose 用）：

```bash
MYSQL_ROOT_PASSWORD=你的root密码
MYSQL_PASSWORD=你的业务密码
```

### 2. 启动

```bash
docker compose up -d --build
```

### 3. 首次导入种子数据（可选）

```bash
docker compose exec api pnpm db:seed
```

---

## 方式二：PM2 + 本机 MySQL

### 1. 服务器准备

- Node.js >= 20
- pnpm、pm2、nginx、mysql
- 将代码 clone 到服务器

### 2. 配置

```bash
cp deploy/.env.production.example apps/api/.env
# 填写 DATABASE_URL、WECHAT_APP_ID、WECHAT_APP_SECRET、JWT_SECRET
```

### 3. 部署

```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

### 4. Nginx

```bash
sudo cp deploy/nginx/api.mini-pocket.qiexuxing.top.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/api.mini-pocket.qiexuxing.top.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 5. HTTPS

```bash
sudo certbot --nginx -d api.mini-pocket.qiexuxing.top
```

---

## 验证

```bash
curl https://api.mini-pocket.qiexuxing.top/api/health
```

期望返回：

```json
{"code":0,"message":"ok","data":{"status":"ok","timestamp":"..."}}
```
