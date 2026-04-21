# 今日更新总结（2026-04-21）

## 更新功能概览

1. 修复正式环境“页面一直转圈圈（Loading）”
   - 目标：避免在浏览器存储异常（localStorage 被禁用/异常、数据被污染等）时，认证检查导致页面状态无法结束，从而无限 Loading。
   - 结果：即使存储读取失败，也会安全回退为未登录状态，并继续走登录/重定向流程，不再卡死。

2. 修复静态导出部署下部分路由访问 “Not Found”
   - 目标：静态导出 `out/` 产物里很多页面是 `login.html`、`group/join.html` 这种形式；当服务器访问 `/login`、`/group/join` 未做重写时会 404。
   - 结果：内置静态服务器支持 “无后缀路径 → .html” 的自动回退，减少部署踩坑。

## 今日变更文件清单（源码）

- [frontend/lib/store.ts](file:///F:/work/code/ogbo-web3-app-master/frontend/lib/store.ts)
- [frontend/app/page.tsx](file:///F:/work/code/ogbo-web3-app-master/frontend/app/page.tsx)
- [frontend/app/login/page.tsx](file:///F:/work/code/ogbo-web3-app-master/frontend/app/login/page.tsx)
- [frontend/scripts/serve-out.js](file:///F:/work/code/ogbo-web3-app-master/frontend/scripts/serve-out.js)

## 文件功能与本次改动点

### frontend/lib/store.ts

- 文件功能
  - 全局状态管理（Zustand store）：登录态、钱包、聊天、行情、资产同步等核心状态与动作。
- 本次改动点
  - `checkAuthStatus()` 增加防御性 `try/catch`，localStorage/数据异常时不抛错，直接回退为未登录状态，避免页面卡在 Loading。
  - `syncWalletAssets()` 调用改为吞掉异常（防止未处理的 Promise 拒绝影响运行时稳定性）。

### frontend/app/page.tsx

- 文件功能
  - Web 端主入口页面（首页），负责启动时的认证检查、未登录跳转、聊天初始化、价格轮询、主 UI 渲染。
- 本次改动点
  - 启动认证检查时加兜底，确保 `isChecking` 一定会在超时后关闭（不再因为异常导致无限 Loading）。

### frontend/app/login/page.tsx

- 文件功能
  - 登录页入口：启动时检查是否已登录；已登录则重定向回首页；未登录展示登录组件。
- 本次改动点
  - 与首页一致：认证检查加兜底，确保 `isChecking` 一定会结束，避免登录页也出现无限 Loading。

### frontend/scripts/serve-out.js

- 文件功能
  - 本地/服务器静态资源服务脚本：默认把 `frontend/out/` 当作静态站点目录提供 HTTP 访问。
  - 支持 SPA fallback：找不到资源时回退到 `index.html`。
- 本次改动点
  - 增加 “无后缀路径 → .html 文件” 回退：
    - 例如 `/login` → 尝试读取 `out/login.html`
    - 例如 `/group/join` → 尝试读取 `out/group/join.html`
  - 仍保留原有的目录 `index.html` 逻辑与最终 `index.html` fallback。

## 迁移到正式服务器时需要更新哪些内容

1. 必须更新构建产物
   - `frontend/out/`（需要重新构建生成，再覆盖到正式服务器）

2. 如果正式服务器用 Node 跑 `pnpm run serve:out`
   - 除了更新 `out/`，还需要更新本次修改过的源码文件（至少包含 `frontend/scripts/serve-out.js`）。

3. 环境变量（在“构建 out 的机器”或“运行 serve:out 的机器”上配置）
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - 如启用 OKX 资产接口：
     - `NEXT_PUBLIC_OKX_API_KEY`
     - `NEXT_PUBLIC_OKX_SECRET_KEY`
     - `NEXT_PUBLIC_OKX_PASSPHRASE`

