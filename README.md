# AI_cursor

基于标签的 Ticket 管理小工具：后端 FastAPI + PostgreSQL，前端 React + Vite + Tailwind + Shadcn，无用户系统。

## 功能概览

- 创建 / 编辑 / 删除 / 完成 Ticket
- 为 Ticket 添加、删除标签
- 按标签筛选、按标题搜索、分页
- 标签管理（增删改、颜色）

## 技术栈

| 端     | 技术 |
|--------|------|
| 后端   | Python 3.11、FastAPI、SQLAlchemy、Alembic、PostgreSQL |
| 前端   | TypeScript、React、Vite、Tailwind CSS、Shadcn UI |
| 质量   | pre-commit（Ruff、ESLint、Vitest）、GitHub Actions CI |

## 目录结构

```
├── .github/           # GitHub Actions CI、说明
├── specs/              # 需求与实现计划文档
├── week01/
│   ├── backend/       # FastAPI 后端
│   └── frontend/       # React 前端
├── .pre-commit-config.yaml
├── pyproject.toml     # Ruff 等工具配置（根目录）
└── README.md
```

## 本地运行

### 1. 数据库

使用本地 PostgreSQL，默认：数据库 `postgres`，用户 `postgres`，密码为空。
测试需存在库 `postgres_test`（可 `CREATE DATABASE postgres_test;`）。

### 2. 后端

```bash
cd week01/backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# 可选：配置 .env 中的 DATABASE_URL
alembic upgrade head
uvicorn app.main:app --reload
```

API 默认：<http://localhost:8000>，文档：<http://localhost:8000/docs>。

### 3. 前端

```bash
cd week01/frontend
yarn install
yarn dev
```

前端默认：<http://localhost:5173>，需后端已启动。

## 开发与 CI

- **Pre-commit**：`pip install pre-commit && pre-commit install`，提交前自动跑 Ruff、ESLint、Vitest 等；详见 [.github/PRE-COMMIT-AND-CI.md](.github/PRE-COMMIT-AND-CI.md)。
- **GitHub Actions**：推送到 `main`/`master` 或提 PR 时自动跑后端 Ruff + pytest、前端 lint + test、以及 `pre-commit run --all-files`。

## 文档

- 需求与设计：`specs/0001-spec.md`
- 实现计划：`specs/0002-implementation-plan.md`
