# 0002 — 实现计划：基于标签的 Ticket 管理工具

> 基于需求与设计文档 `specs/0001-spec.md`，版本 1.3

---

## 总体策略

采用「后端先行，前端跟进，最后补测试」的顺序：

1. **阶段一：项目脚手架** — 搭建目录结构、安装依赖、配置环境变量
2. **阶段二：后端核心** — 数据模型 → Alembic 迁移 → Schema → CRUD → 路由 → 启动验证
3. **阶段三：前端核心** — 项目配置 → 类型/API 层 → Hook → 组件 → 页面组装
4. **阶段四：测试** — 后端测试 → 前端测试
5. **阶段五：联调收尾** — 前后端联调、边界场景验证

> **所有代码均实现在 `week01/` 目录下。**

---

## 阶段一：项目脚手架

### 1.1 顶层目录初始化

**目标结构：**

```
week01/
├── backend/
└── frontend/
```

**步骤：**

1. 在 `week01/` 目录下创建 `backend/` 和 `frontend/` 两个子目录。
2. 在 `week01/` 下创建 `.gitignore`，忽略 `__pycache__`、`.env`、`node_modules`、`.venv` 等。

---

### 1.2 后端脚手架

**步骤：**

1. 进入 `week01/backend/` 目录，创建 Python 虚拟环境：
   ```bash
   python3.12 -m venv .venv
   source .venv/bin/activate
   ```

2. 创建 `week01/backend/requirements.txt`，内容按规格文档 2.2 节填写：
   ```
   fastapi==0.133.1
   sqlalchemy==2.0.40
   alembic==1.15.2
   pydantic==2.11.1
   uvicorn[standard]==0.34.0
   python-dotenv==1.0.1
   psycopg2-binary==2.9.10

   pytest==8.3.5
   httpx==0.28.1
   pytest-asyncio==1.3.0
   pytest-cov==6.1.1
   ```

3. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```

4. 创建 `week01/backend/.env`：
   ```
   DATABASE_URL=postgresql://postgres@localhost:5432/postgres
   ALLOWED_ORIGINS=http://localhost:5173
   ```

5. 初始化 Alembic：
   ```bash
   cd week01/backend
   alembic init alembic
   ```
   修改 `alembic/env.py`，使其从环境变量读取 `DATABASE_URL`，并导入 SQLAlchemy 模型的 `Base.metadata`。

6. 搭建后端目录骨架（逐一创建空文件，后续填充）：
   ```
   week01/backend/
   ├── app/
   │   ├── __init__.py
   │   ├── main.py
   │   ├── database.py
   │   ├── models/
   │   │   ├── __init__.py
   │   │   ├── ticket.py
   │   │   ├── tag.py
   │   │   └── ticket_tag.py
   │   ├── schemas/
   │   │   ├── __init__.py
   │   │   ├── ticket.py
   │   │   └── tag.py
   │   ├── routers/
   │   │   ├── __init__.py
   │   │   ├── tickets.py
   │   │   └── tags.py
   │   └── crud/
   │       ├── __init__.py
   │       ├── ticket.py
   │       └── tag.py
   ├── tests/
   │   ├── __init__.py
   │   ├── conftest.py
   │   ├── test_tickets.py
   │   ├── test_tags.py
   │   ├── test_ticket_tags.py
   │   └── test_schemas.py
   ├── alembic/
   ├── .env
   └── requirements.txt
   ```

---

### 1.3 前端脚手架

**步骤：**

1. 在 `week01/` 目录下使用 Vite 创建 React + TypeScript 项目：
   ```bash
   cd week01
   yarn create vite frontend --template react-ts
   cd frontend
   yarn install
   ```

2. 安装 Tailwind CSS v4（Vite 插件方式）：
   ```bash
   yarn add -D tailwindcss @tailwindcss/vite
   ```
   修改 `vite.config.ts`，加入 `@tailwindcss/vite` 插件。
   在 `src/index.css` 顶部加入 `@import 'tailwindcss';`，替换原有 `@tailwind` 指令。

3. 安装并初始化 Shadcn UI：
   ```bash
   npx shadcn@latest init
   ```
   选项：TypeScript、Vite、Tailwind CSS v4，路径别名 `@/` 指向 `src/`。
   修改 `tsconfig.json` 与 `tsconfig.app.json`，配置 `baseUrl` 和 `paths`（`@/*` → `src/*`）。
   修改 `vite.config.ts`，配置 `resolve.alias`。

4. 安装所需 Shadcn 组件：
   ```bash
   npx shadcn@latest add button input textarea badge checkbox
   npx shadcn@latest add dialog sheet alert-dialog popover
   npx shadcn@latest add command tabs pagination toast
   ```

5. 安装前端测试依赖：
   ```bash
   yarn add -D vitest @testing-library/react @testing-library/user-event \
     @testing-library/jest-dom msw @types/react @types/react-dom
   ```

6. 配置 `vitest.config.ts`（或在 `vite.config.ts` 中的 `test` 字段）：
   - 设置 `environment: 'jsdom'`
   - 设置 `setupFiles: ['./tests/setup.ts']`
   - 设置 `include: ['tests/**/*.test.{ts,tsx}']`

7. 创建 `tests/setup.ts`，导入 `@testing-library/jest-dom`。

8. 创建 `week01/frontend/.env`：
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

9. 搭建前端目录骨架：
   ```
   week01/frontend/
   ├── src/
   │   ├── main.tsx
   │   ├── App.tsx
   │   ├── index.css
   │   ├── api/
   │   │   ├── client.ts
   │   │   ├── tickets.ts
   │   │   └── tags.ts
   │   ├── components/
   │   │   ├── ui/              # Shadcn 自动生成，勿手动修改
   │   │   ├── TicketList.tsx
   │   │   ├── TicketCard.tsx
   │   │   ├── TicketForm.tsx
   │   │   ├── TagSidebar.tsx
   │   │   ├── TagManager.tsx
   │   │   ├── SearchBar.tsx
   │   │   └── ColorPicker.tsx
   │   ├── hooks/
   │   │   ├── useTickets.ts
   │   │   └── useTags.ts
   │   ├── types/
   │   │   └── index.ts
   │   └── lib/
   │       └── utils.ts
   ├── tests/
   │   ├── setup.ts
   │   ├── components/
   │   ├── hooks/
   │   ├── lib/
   │   ├── integration/
   │   └── mocks/
   │       ├── handlers.ts
   │       └── server.ts
   ├── .env
   ├── vite.config.ts
   ├── vitest.config.ts
   ├── tailwind.config.ts
   └── package.json
   ```

10. 在 `package.json` 的 `scripts` 中加入：
    ```json
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
    ```

---

## 阶段二：后端核心

### 2.1 数据库连接（`app/database.py`）

**实现内容：**

- 使用 `python-dotenv` 加载 `.env`，读取 `DATABASE_URL`。
- 用 SQLAlchemy 创建 `engine`（同步）和 `SessionLocal`。
- 定义 `Base = declarative_base()`，供模型继承。
- 提供 `get_db()` 依赖函数（FastAPI `Depends` 用），负责 Session 的创建与关闭。

---

### 2.2 数据模型（`app/models/`）

#### 2.2.1 `app/models/ticket.py` — Ticket 模型

**字段：**
- `id`：UUID，主键，服务器默认 `gen_random_uuid()`
- `title`：VARCHAR(200)，NOT NULL
- `description`：TEXT，可空
- `color`：VARCHAR(20)，可空
- `completed`：BOOLEAN，NOT NULL，默认 `false`
- `created_at`：TIMESTAMPTZ，NOT NULL，默认 `func.now()`
- `updated_at`：TIMESTAMPTZ，NOT NULL，默认 `func.now()`，更新时自动刷新（`onupdate=func.now()`）

**关系：**
- `tags`：通过 `ticket_tag` 关联表定义多对多关系，`back_populates='tickets'`，`cascade='all, delete-orphan'`（关联记录）

**索引：**
- `idx_tickets_title`：对 `title` 列
- `idx_tickets_completed`：对 `completed` 列

#### 2.2.2 `app/models/tag.py` — Tag 模型

**字段：**
- `id`：UUID，主键
- `name`：VARCHAR(50)，NOT NULL，UNIQUE
- `created_at`：TIMESTAMPTZ，NOT NULL，默认 `func.now()`

**关系：**
- `tickets`：多对多反向关系

#### 2.2.3 `app/models/ticket_tag.py` — 关联表

使用 SQLAlchemy `Table` 定义关联表（非 ORM 类）：
- `ticket_id`：UUID，外键 → `tickets.id`，`ondelete='CASCADE'`
- `tag_id`：UUID，外键 → `tags.id`，`ondelete='CASCADE'`
- 联合主键 `(ticket_id, tag_id)`

#### 2.2.4 `app/models/__init__.py`

统一导出所有模型，确保 Alembic 可以发现 `Base.metadata`。

---

### 2.3 数据库迁移

**步骤：**

1. 修改 `alembic/env.py`：
   - 从 `app.database` 导入 `Base`
   - 将 `target_metadata = Base.metadata`
   - 在 `run_migrations_offline/online` 中使用环境变量中的 `DATABASE_URL`

2. 确认 PostgreSQL 中已创建 `postgres` 数据库（通常默认已存在）。

3. 生成初始迁移：
   ```bash
   alembic revision --autogenerate -m "initial tables"
   ```
   检查生成的迁移文件，确认包含 `tickets`、`tags`、`ticket_tags` 三张表及所有索引。

4. 执行迁移：
   ```bash
   alembic upgrade head
   ```

---

### 2.4 Pydantic Schema（`app/schemas/`）

#### 2.4.1 `app/schemas/ticket.py`

定义以下 Schema 类：

| Schema 类 | 用途 | 关键字段 |
|-----------|------|---------|
| `TicketColor` | 颜色枚举 | `red`/`orange`/`yellow`/`green`/`blue`/`purple`/`gray` |
| `TicketBase` | 公共基类 | `title: str`（含长度校验器） |
| `TicketCreate` | 创建请求 | 继承 Base，加 `description`、`color`、`tag_ids: list[UUID]` |
| `TicketUpdate` | 更新请求（全可选） | `title`、`description`、`color`、`completed` |
| `TagInTicket` | Ticket 中嵌套的 Tag | `id`、`name` |
| `TicketResponse` | 响应体 | 所有字段 + `tags: list[TagInTicket]`，配置 `from_attributes=True` |
| `TicketListResponse` | 列表响应 | `items`、`total`、`limit`、`offset` |

**校验逻辑：**
- `title`：`@field_validator`，strip 后长度 1–200，否则抛出 `ValueError`
- `color`：使用 `TicketColor` 枚举，传入 `None` 合法（代表无颜色）

#### 2.4.2 `app/schemas/tag.py`

| Schema 类 | 用途 |
|-----------|------|
| `TagCreate` | 创建请求，含 `name` 长度校验（1–50） |
| `TagResponse` | 响应体，含 `ticket_count: int \| None` |
| `AddTagToTicket` | 为 Ticket 添加标签请求，`tag_id: UUID \| None`、`tag_name: str \| None`，两者至少一个非空 |

---

### 2.5 CRUD 函数（`app/crud/`）

#### 2.5.1 `app/crud/ticket.py`

| 函数 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `get_ticket` | `db, ticket_id` | `Ticket \| None` | 按 ID 查询单条，含 tags |
| `get_tickets` | `db, q, completed, tag_ids, no_tags, limit, offset` | `(list[Ticket], int)` | 列表查询+计数，支持全部筛选条件 |
| `create_ticket` | `db, data: TicketCreate` | `Ticket` | 创建，支持初始 tag_ids |
| `update_ticket` | `db, ticket, data: TicketUpdate` | `Ticket` | 部分更新，只更新传入字段 |
| `delete_ticket` | `db, ticket` | `None` | 删除（级联由数据库处理） |

**`get_tickets` 筛选逻辑要点：**
- `q` 非空：`Ticket.title.ilike(f'%{q}%')`
- `completed` 非空：`Ticket.completed == completed`
- `tag_ids` 非空：对每个 `tag_id` 做 `EXISTS` 子查询或 JOIN + GROUP BY HAVING，确保 AND 语义
- `no_tags=True`：`~Ticket.tags.any()`

#### 2.5.2 `app/crud/tag.py`

| 函数 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `get_tag` | `db, tag_id` | `Tag \| None` | 按 ID 查询 |
| `get_tag_by_name` | `db, name` | `Tag \| None` | 按名称查询（用于唯一检查） |
| `get_tags` | `db, with_count` | `list[Tag]` | 列表，可选附带 ticket_count |
| `create_tag` | `db, data: TagCreate` | `Tag` | 创建，name 唯一 |
| `delete_tag` | `db, tag` | `None` | 删除 |
| `add_tag_to_ticket` | `db, ticket, tag` | `None` | 关联（重复则跳过或抛异常） |
| `remove_tag_from_ticket` | `db, ticket, tag_id` | `None` | 解除关联 |
| `get_or_create_tag` | `db, name` | `(Tag, bool)` | 存在则返回，否则创建，返回 `(tag, created)` |

---

### 2.6 路由（`app/routers/`）

#### 2.6.1 `app/routers/tickets.py`

前缀：`/tickets`，tag：`tickets`

| 方法 | 路径 | 函数名 | 状态码 | 说明 |
|------|------|--------|--------|------|
| GET | `/` | `list_tickets` | 200 | 调用 `crud.get_tickets`，返回 `TicketListResponse` |
| POST | `/` | `create_ticket` | 201 | 调用 `crud.create_ticket`，返回 `TicketResponse` |
| GET | `/{ticket_id}` | `get_ticket` | 200 | 调用 `crud.get_ticket`，不存在返回 404 |
| PATCH | `/{ticket_id}` | `update_ticket` | 200 | 调用 `crud.update_ticket` |
| DELETE | `/{ticket_id}` | `delete_ticket` | 204 | 调用 `crud.delete_ticket` |
| POST | `/{ticket_id}/tags` | `add_tag` | 200 | 调用 `crud.get_or_create_tag` + `crud.add_tag_to_ticket` |
| DELETE | `/{ticket_id}/tags/{tag_id}` | `remove_tag` | 204 | 调用 `crud.remove_tag_from_ticket` |

**通用 404 处理：** 封装一个 `get_ticket_or_404(db, ticket_id)` 依赖函数，供多个路由复用。

#### 2.6.2 `app/routers/tags.py`

前缀：`/tags`，tag：`tags`

| 方法 | 路径 | 函数名 | 状态码 | 说明 |
|------|------|--------|--------|------|
| GET | `/` | `list_tags` | 200 | 调用 `crud.get_tags`，返回 `list[TagResponse]` |
| POST | `/` | `create_tag` | 201 | 调用 `crud.create_tag`，name 重复返回 409 |
| DELETE | `/{tag_id}` | `delete_tag` | 204 | 调用 `crud.delete_tag` |

---

### 2.7 应用入口（`app/main.py`）

**实现内容：**
- 创建 `FastAPI` 实例，配置 `title`、`version`。
- 从环境变量读取 `ALLOWED_ORIGINS`，配置 `CORSMiddleware`：
  - `allow_origins=ALLOWED_ORIGINS.split(',')`
  - `allow_methods=['*']`
  - `allow_headers=['*']`
- 注册路由：`app.include_router(tickets_router)`、`app.include_router(tags_router)`
- 添加根路径健康检查接口 `GET /`，返回 `{"status": "ok"}`

**验证步骤：**
```bash
cd week01/backend
uvicorn app.main:app --reload --port 8000
# 访问 http://localhost:8000/docs，确认所有接口出现在 Swagger UI 中
# 手动测试 POST /tickets、GET /tickets 基本通路
```

---

## 阶段三：前端核心

### 3.1 TypeScript 类型定义（`src/types/index.ts`）

```typescript
export type TicketColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray' | null

export interface Tag {
  id: string
  name: string
  ticket_count?: number
}

export interface Ticket {
  id: string
  title: string
  description: string | null
  color: TicketColor
  completed: boolean
  tags: Tag[]
  created_at: string
  updated_at: string
}

export interface TicketListResponse {
  items: Ticket[]
  total: number
  limit: number
  offset: number
}

export interface TicketCreatePayload {
  title: string
  description?: string | null
  color?: TicketColor
  tag_ids?: string[]
}

export interface TicketUpdatePayload {
  title?: string
  description?: string | null
  color?: TicketColor
  completed?: boolean
}

export interface TicketFilters {
  q?: string
  completed?: boolean
  tag_ids?: string[]
  no_tags?: boolean
  limit?: number
  offset?: number
}
```

---

### 3.2 API 请求层（`src/api/`）

#### 3.2.1 `src/api/client.ts`

- 从 `import.meta.env.VITE_API_BASE_URL` 读取 Base URL。
- 封装统一的 `apiFetch(path, options)` 函数：
  - 自动拼接 Base URL
  - `Content-Type: application/json`
  - 非 2xx 响应时，读取 body 中的 `detail` 字段，抛出包含该消息的 `Error`

#### 3.2.2 `src/api/tickets.ts`

导出以下函数（均调用 `apiFetch`）：

| 函数名 | 对应接口 |
|--------|---------|
| `fetchTickets(filters)` | `GET /tickets` |
| `createTicket(payload)` | `POST /tickets` |
| `fetchTicket(id)` | `GET /tickets/{id}` |
| `updateTicket(id, payload)` | `PATCH /tickets/{id}` |
| `deleteTicket(id)` | `DELETE /tickets/{id}` |
| `addTagToTicket(ticketId, tagId?, tagName?)` | `POST /tickets/{id}/tags` |
| `removeTagFromTicket(ticketId, tagId)` | `DELETE /tickets/{id}/tags/{tag_id}` |

#### 3.2.3 `src/api/tags.ts`

| 函数名 | 对应接口 |
|--------|---------|
| `fetchTags(withCount?)` | `GET /tags` |
| `createTag(name)` | `POST /tags` |
| `deleteTag(id)` | `DELETE /tags/{id}` |

---

### 3.3 工具函数（`src/lib/utils.ts`）

**颜色映射函数 `getColorBorderClass(color: TicketColor): string`：**

返回对应的 Tailwind 边框颜色 class（`border-l-4`）：

| 枚举值 | Tailwind class（示例） |
|--------|----------------------|
| `null` | `border-l-4 border-l-transparent` |
| `red` | `border-l-4 border-l-red-500` |
| `orange` | `border-l-4 border-l-orange-500` |
| `yellow` | `border-l-4 border-l-yellow-500` |
| `green` | `border-l-4 border-l-green-500` |
| `blue` | `border-l-4 border-l-blue-500` |
| `purple` | `border-l-4 border-l-purple-500` |
| `gray` | `border-l-4 border-l-gray-500` |

> 注意：Tailwind v4 默认进行内容扫描，颜色 class 需要以完整字符串形式出现在源码中（不能动态拼接），此处使用映射对象即可保证 class 被扫描到。

---

### 3.4 自定义 Hook（`src/hooks/`）

#### 3.4.1 `src/hooks/useTickets.ts`

**状态：**
- `tickets: Ticket[]`
- `total: number`
- `loading: boolean`
- `error: string | null`

**方法：**
- `loadTickets(filters: TicketFilters)` — 调用 `fetchTickets`，更新状态
- `addTicket(payload)` — 调用 `createTicket`，成功后重新加载列表
- `editTicket(id, payload)` — 调用 `updateTicket`，成功后就地更新 `tickets` 数组
- `removeTicket(id)` — 调用 `deleteTicket`，成功后从 `tickets` 中移除
- `toggleCompleted(id, currentValue)` — 调用 `updateTicket({ completed: !currentValue })`

**设计要点：**
- 使用 `useCallback` 包裹各方法，避免不必要的重渲染
- 错误时 `toast.error(err.message)` 通知用户

#### 3.4.2 `src/hooks/useTags.ts`

**状态：**`tags: Tag[]`、`loading: boolean`

**方法：**
- `loadTags(withCount?)` — 加载标签列表
- `addTag(name)` — 创建标签
- `removeTag(id)` — 删除标签

---

### 3.5 业务组件实现

以下组件按依赖顺序实现，避免前置依赖缺失。

#### 3.5.1 `ColorPicker.tsx`

**Props：**`value: TicketColor`、`onChange: (color: TicketColor) => void`

**渲染：**
- 8 个圆形 `button`（含一个「无颜色」透明/灰色按钮）
- 选中状态：`ring-2 ring-offset-2` 外环高亮
- 使用硬编码的 `bg-*` class（保证 Tailwind 扫描）

---

#### 3.5.2 `TagManager.tsx`

**Props：**`ticket: Ticket`、`onUpdate: (ticket: Ticket) => void`

**渲染（Popover 内）：**
- 已关联标签列表：每个标签显示 `Badge` + 删除图标（`X`），点击调用 `removeTagFromTicket`
- Combobox 输入框：搜索/选择已有标签，或输入新名称后按回车调用 `addTagToTicket`（tag_name 方式）

---

#### 3.5.3 `TicketForm.tsx`

**Props：**
- `open: boolean`
- `onOpenChange: (open: boolean) => void`
- `ticket?: Ticket`（编辑模式时传入；不传则为创建模式）
- `onSubmit: (payload: TicketCreatePayload | TicketUpdatePayload) => Promise<void>`
- `tags: Tag[]`（供创建时选择初始标签）

**渲染（Dialog 内）：**
- `Input`：标题，`required`，实时长度校验
- `Textarea`：描述，可选
- `ColorPicker`：颜色选择器
- `Combobox`（创建模式）：初始标签多选
- `Button`：保存（提交时禁用）、取消
- 校验错误展示在输入框下方

---

#### 3.5.4 `TicketCard.tsx`

**Props：**`ticket: Ticket`、`onEdit`、`onDelete`、`onToggleComplete`、`onTagUpdate`

**渲染：**
- 整体：`flex`，左侧 `div`（4px 宽，高度撑满，颜色由 `getColorBorderClass` 决定）
- `Checkbox`：控制完成状态，切换时调用 `onToggleComplete`
- 标题：已完成时加 `line-through text-muted-foreground` class
- 描述摘要：最多显示 2 行，超出截断
- 标签列表：`Badge` 组件，点击 `TagManager` 弹窗
- 操作按钮组（图标按钮）：编辑、管理标签、删除
- 删除时触发 `AlertDialog` 弹出确认，确认后调用 `onDelete`

---

#### 3.5.5 `SearchBar.tsx`

**Props：**`value: string`、`onChange: (value: string) => void`

**渲染：**
- `Input`，搜索图标
- 使用 `useEffect` + `setTimeout(300ms)` 实现防抖，防抖后调用 `onChange`

---

#### 3.5.6 `TagSidebar.tsx`

**Props：**`tags: Tag[]`、`selectedTagIds: string[]`、`noTags: boolean`、`onSelect`、`onNoTagsToggle`

**渲染：**
- 固定选项「全部」（点击清空所有筛选）
- 固定选项「无标签」（切换 `no_tags` 参数）
- 标签列表：每个标签显示名称 + `Badge` 数量，点击切换选中状态（多选：已选中则移除，未选中则加入）
- 选中状态：`bg-accent` 背景高亮

---

#### 3.5.7 `TicketList.tsx`

**Props：**`tickets: Ticket[]`、`total: number`、`page: number`、`pageSize: number`、`onPageChange`、各事件回调

**渲染：**
- `TicketCard` 列表（`map`）
- 空状态提示（无 Ticket 时显示「暂无 Ticket，点击新建」）
- 底部 `Pagination` 控件

---

### 3.6 页面组装（`App.tsx`）

**整体结构：**

```
App
├── 顶部导航栏 (header)
│   ├── Logo / 应用名
│   └── Button「新建 Ticket」→ 打开 TicketForm（创建模式）
└── 主内容区 (main, flex)
    ├── TagSidebar（左侧固定宽度 240px）
    └── 右侧内容区（flex-1）
        ├── SearchBar + 状态筛选 Tabs（全部/未完成/已完成）
        └── TicketList
```

**状态管理（App 级别）：**
- `filters: TicketFilters` — 聚合所有筛选条件（q、completed、tag_ids、no_tags、offset、limit）
- `formOpen: boolean` + `editingTicket: Ticket | null` — 控制 TicketForm 的打开状态
- 使用 `useTickets` 和 `useTags` Hook

**筛选联动逻辑：**
- SearchBar onChange → 更新 `filters.q`，重置 `filters.offset=0`
- 状态 Tabs onChange → 更新 `filters.completed`，重置 offset
- TagSidebar onSelect → 更新 `filters.tag_ids`，重置 offset
- 分页 onPageChange → 更新 `filters.offset`
- 每次 `filters` 变更时（`useEffect`）触发 `loadTickets(filters)`

**Toast 通知：**在 `main.tsx` 中引入 Sonner 的 `<Toaster />`，各 Hook 中使用 `toast.success/error`。

---

## 阶段四：测试

### 4.1 后端测试

#### 4.1.1 `tests/conftest.py`

**Fixtures：**

- `engine`（session 级别）：连接测试数据库 `postgres_test`，创建所有表
- `db`（function 级别）：每个测试函数使用独立事务，测试结束后回滚（避免 DROP/重建开销）
- `client`（function 级别）：创建 `TestClient`，通过 `app.dependency_overrides[get_db]` 注入测试 Session

**测试数据库准备：**
- 在 `conftest.py` 中读取 `DATABASE_URL`，将数据库名替换为 `postgres_test`
- 在运行测试前手动创建：`CREATE DATABASE postgres_test;`

#### 4.1.2 `tests/test_schemas.py`

测试 Pydantic Schema 校验逻辑（纯 Python，无需数据库）：

- `TicketCreate`：title 为空字符串 → 抛出校验错误
- `TicketCreate`：title 超过 200 字符 → 抛出校验错误
- `TicketCreate`：color 非法值 → 抛出校验错误
- `TicketCreate`：color 合法值 → 通过
- `TicketCreate`：color 为 `None` → 通过
- `TagCreate`：name 为空 → 抛出校验错误
- `AddTagToTicket`：tag_id 和 tag_name 均为 None → 抛出校验错误

#### 4.1.3 `tests/test_tickets.py`

覆盖 Ticket CRUD 全部接口，参照规格文档 10.1.3 节的测试用例表逐一实现。

**典型测试结构：**
```python
def test_create_ticket_success(client):
    response = client.post("/tickets", json={"title": "测试 Ticket"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "测试 Ticket"
    assert data["completed"] is False
    assert data["color"] is None

def test_create_ticket_empty_title(client):
    response = client.post("/tickets", json={"title": ""})
    assert response.status_code == 422
```

#### 4.1.4 `tests/test_tags.py`

覆盖 Tag 相关接口，参照规格文档 10.1.3 节标签部分测试用例。

#### 4.1.5 `tests/test_ticket_tags.py`

覆盖标签关联接口：
- 用 tag_id 添加标签
- 用 tag_name 添加标签（自动创建）
- 重复添加同一标签返回 409
- 移除标签后 tag 本身仍存在
- 删除 Ticket 后 ticket_tags 级联删除

---

### 4.2 前端测试

#### 4.2.1 `tests/mocks/handlers.ts`

用 msw 定义所有 API Mock 处理器（`http.get`、`http.post` 等），覆盖：
- `GET /tickets` → 返回包含 2–3 条 Ticket 的 mock 列表
- `POST /tickets` → 返回新建 Ticket
- `PATCH /tickets/:id` → 返回更新后 Ticket
- `DELETE /tickets/:id` → 返回 204
- `GET /tags` → 返回 mock 标签列表
- `POST /tickets/:id/tags` → 返回更新后标签列表
- `DELETE /tickets/:id/tags/:tagId` → 返回 204

#### 4.2.2 `tests/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'
export const server = setupServer(...handlers)
```

在 `tests/setup.ts` 中：
```typescript
import { server } from './mocks/server'
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

#### 4.2.3 `tests/lib/utils.test.ts`

- `getColorBorderClass(null)` → 返回透明边框 class
- `getColorBorderClass('red')` → 返回红色边框 class
- 遍历全部 7 种颜色，确认均有对应 class

#### 4.2.4 `tests/components/TicketCard.test.tsx`

按规格文档 10.2.3 节的用例逐一实现：
- 标题、颜色边框 class、标签徽章正确渲染
- 已完成时标题有 `line-through` class，复选框为 checked
- color 为 null 时左边框为透明 class
- 点击删除 → AlertDialog 出现 → 点击取消 → onDelete 未被调用
- 点击删除 → AlertDialog → 点击确认 → onDelete 被调用一次

#### 4.2.5 `tests/components/TicketForm.test.tsx`

- 标题为空点击保存 → 显示校验错误，onSubmit 未调用
- 填写合法标题后点击保存 → onSubmit 被调用，参数含 title
- 点击颜色色块 → 选中状态更新（has ring class）
- 编辑模式：表单预填充 ticket 的现有数据

#### 4.2.6 `tests/components/SearchBar.test.tsx`

- 输入文字后立即不触发 onChange（防抖）
- 300ms 后 onChange 被调用，参数为输入值

#### 4.2.7 `tests/integration/createTicket.test.tsx`

- 渲染 App 或主列表页组件（with msw）
- 点击「新建 Ticket」→ Dialog 出现
- 填写标题 → 点击保存 → POST 请求被发出（用 msw 验证）→ 列表刷新，新 Ticket 出现

#### 4.2.8 `tests/integration/filterAndSearch.test.tsx`

- 渲染组件，msw 返回 3 条 Ticket（含不同标签）
- 输入搜索关键词（等待防抖）→ GET 请求含 `q=` 参数
- 点击状态 Tab「已完成」→ GET 请求含 `completed=true`
- 点击标签侧边栏中某标签 → GET 请求含 `tag_ids=` 参数

---

## 阶段五：联调收尾

### 5.1 联调步骤

1. 启动后端：
   ```bash
   cd week01/backend
   uvicorn app.main:app --reload --port 8000
   ```
2. 启动前端：
   ```bash
   cd week01/frontend
   yarn dev
   ```
   （端口 5173）
3. 浏览器访问 `http://localhost:5173`，按以下流程手动验证：

| 场景 | 验证要点 |
|------|---------|
| 新建 Ticket | 表单打开，填写标题 + 颜色，保存后列表出现新条目，颜色边框正确 |
| 编辑 Ticket | 打开编辑表单，数据预填充，修改后保存，列表更新 |
| 完成状态切换 | 点击复选框，标题加删除线，再次点击恢复 |
| 删除 Ticket | 二次确认弹出，取消无效，确认后条目移除 |
| 添加标签 | 管理标签 Popover，搜索已有标签关联，输入新名称自动创建并关联 |
| 移除标签 | 标签旁 X 图标，点击解除关联，Ticket 上标签消失 |
| 标签侧边栏筛选 | 点击不同标签，列表过滤正确 |
| 多标签 AND 筛选 | 同时选中两个标签，仅显示同时包含两者的 Ticket |
| 「无标签」筛选 | 仅显示无标签 Ticket |
| 标题搜索 | 输入关键词，防抖后列表更新，不区分大小写 |
| 状态筛选 | 切换全部/未完成/已完成 Tab，列表正确过滤 |
| 筛选组合 | 标签 + 状态 + 搜索同时生效，结果为三者交集 |
| 分页 | 数据量超过 20 条时分页控件出现，翻页正常 |

### 5.2 错误边界验证

- 断开后端服务，前端操作时显示 Toast 错误提示，页面不崩溃
- 创建标题超过 200 字符，前端实时拦截，显示校验错误

### 5.3 运行全部测试

```bash
# 后端测试
cd week01/backend
pytest --cov=app --cov-report=term-missing

# 前端测试
cd week01/frontend
yarn test --coverage
```

确认所有测试通过，覆盖率满足预期后，视为本阶段完成。

---

## 任务清单

### 阶段一：脚手架
- [ ] 1.1 创建顶层目录结构与根 `.gitignore`
- [ ] 1.2 后端：虚拟环境、依赖安装、目录骨架、Alembic 初始化
- [ ] 1.3 前端：Vite 项目创建、Tailwind v4 配置、Shadcn 初始化、测试依赖安装

### 阶段二：后端
- [ ] 2.1 `database.py`：数据库连接与 Session
- [ ] 2.2 数据模型：`ticket.py`、`tag.py`、`ticket_tag.py`
- [ ] 2.3 Alembic 迁移：生成并执行初始迁移
- [ ] 2.4 Schema：`schemas/ticket.py`、`schemas/tag.py`
- [ ] 2.5 CRUD：`crud/ticket.py`、`crud/tag.py`
- [ ] 2.6 路由：`routers/tickets.py`、`routers/tags.py`
- [ ] 2.7 `main.py`：CORS、路由注册，Swagger UI 验证

### 阶段三：前端
- [ ] 3.1 `src/types/index.ts`：TypeScript 类型定义
- [ ] 3.2 `src/api/`：`client.ts`、`tickets.ts`、`tags.ts`
- [ ] 3.3 `src/lib/utils.ts`：颜色映射工具函数
- [ ] 3.4 `src/hooks/useTickets.ts`、`useTags.ts`
- [ ] 3.5.1 `ColorPicker.tsx`
- [ ] 3.5.2 `TagManager.tsx`
- [ ] 3.5.3 `TicketForm.tsx`（Dialog）
- [ ] 3.5.4 `TicketCard.tsx`（含删除确认）
- [ ] 3.5.5 `SearchBar.tsx`（防抖）
- [ ] 3.5.6 `TagSidebar.tsx`
- [ ] 3.5.7 `TicketList.tsx`（含分页）
- [ ] 3.6 `App.tsx`：页面组装、状态聚合、筛选联动

### 阶段四：测试
- [ ] 4.1.1 `tests/conftest.py`（后端）
- [ ] 4.1.2 `test_schemas.py`
- [ ] 4.1.3 `test_tickets.py`
- [ ] 4.1.4 `test_tags.py`
- [ ] 4.1.5 `test_ticket_tags.py`
- [ ] 4.2.1 `tests/mocks/handlers.ts`（前端）
- [ ] 4.2.2 `tests/mocks/server.ts` + `setup.ts`
- [ ] 4.2.3 `tests/lib/utils.test.ts`
- [ ] 4.2.4 `tests/components/TicketCard.test.tsx`
- [ ] 4.2.5 `tests/components/TicketForm.test.tsx`
- [ ] 4.2.6 `tests/components/SearchBar.test.tsx`
- [ ] 4.2.7 `tests/integration/createTicket.test.tsx`
- [ ] 4.2.8 `tests/integration/filterAndSearch.test.tsx`

### 阶段五：联调收尾
- [ ] 5.1 手动联调（按验证表逐项）
- [ ] 5.2 错误边界验证
- [ ] 5.3 全量测试通过

---

*文档版本：1.0 | 实现计划代号：00020 | 创建日期：2026-02-25*
