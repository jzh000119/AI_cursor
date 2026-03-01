# Pre-commit 与 GitHub CI 说明

## 一、Pre-commit（本地提交前检查）

### 安装与启用

```bash
# 在仓库根目录执行
pip install pre-commit
pre-commit install
```

之后每次 `git commit` 会自动执行配置的钩子。

### 手动全量运行

```bash
pre-commit run --all-files
```

### 当前包含的检查

| 类型           | 说明 |
|----------------|------|
| 通用           | 行尾空格、文件末尾换行、YAML/JSON 校验、大文件、合并冲突、私钥检测等 |
| 后端 (week01/backend) | **Ruff** 语法/风格检查（仅 Python） |
| 前端 (week01/frontend) | **ESLint**、**Vitest**（仅在前端有变更时跑） |

后端 **pytest** 依赖 PostgreSQL（需存在 `postgres_test` 库），默认不在 pre-commit 里跑，只在 GitHub Actions 的 CI 中执行。若本地已起好测试库，可在 `.pre-commit-config.yaml` 中取消注释 `backend-test` 钩子。

### 配置文件与 Ruff

- 仓库根目录：`.pre-commit-config.yaml`、`pyproject.toml`（供 Ruff 从根目录运行时使用）。
- `week01/backend/pyproject.toml`：后端 Ruff / pytest 配置（本地在 backend 目录下直接跑 ruff/pytest 时使用）。

---

## 二、GitHub Actions CI

- **工作流文件**：`.github/workflows/ci.yml`
- **触发**：推送到或针对 `main` / `master` 的 push、pull_request

### 任务说明

1. **Backend (Python)**
   - 使用 PostgreSQL 16 服务容器，自动创建 `postgres_test` 数据库。
   - 执行：Ruff 检查、pytest。

2. **Frontend (Node)**
   - 使用 Node 20、Yarn 缓存。
   - 执行：`yarn lint`、`yarn test`。

3. **pre-commit**
   - 在 CI 中执行 `pre-commit run --all-files`，保证与本地 pre-commit 一致。

### 环境变量

- Backend 测试使用默认 `DATABASE_URL`（`postgresql://postgres@localhost:5432/postgres`），conftest 会使用库 `postgres_test`。CI 中已创建该库，无需在仓库里提交密码等敏感信息。

---

## 三、首次推送到 GitHub 后

1. 在 GitHub 仓库 **Settings → Actions → General** 中确认 Actions 已启用。
2. 推送代码或打开 PR 后，在 **Actions** 页查看运行结果。
3. 若希望 PR 必须通过 CI 才能合并：**Settings → Branches → Branch protection rules** 里为 `main`/`master` 增加 “Require status checks to pass” 并勾选上述 CI 任务。
