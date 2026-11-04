# M1：DeepDot 品牌统一

目标：将 GitHub 仓库、npm 包、Web/PWA、白色机器人图标与 README 统一为 DeepDot，并保留原提交和用户数据。

## 范围与提交

1. 重命名 GitHub 仓库并更新 origin，记录原地址重定向。
2. 将四个 workspace 和跨包引用改为 @deepdot/*；根包改为 deepdot，由 npm 重新生成 lockfile。按 shared/pi-runner、server、web、根配置拆分提交。
3. 沿用 OpenDot 白色机器人 SVG，使用单一源生成 Web/PWA 图标和 README Logo；新增可重复生成命令。
4. 更新 Web 页面、manifest、Service Worker 缓存与应用标题。
5. 重写中文 README，增加原创架构图，完整呈现非多 Agent 目标与真实状态。
6. 更新路线、差距、协作规范及 M1 验收记录，完成后按用户授权合并 main。

允许修改：四包源码中的包引用、package.json/lockfile、Web 品牌组件与静态资源、图标源/生成脚本、README、docs/deepdot 文档和 AGENTS.md。禁止改变业务逻辑或移除 Router（属于 M2）。

## 兼容与验证

- 保留 DEEP_WORKER_*、dw_session、数据库文件名、存储目录与历史数据格式。
- 不引入 Electron 空壳；当前未有桌面包，后续桌面图标复用同一源。
- npm 干净安装、build、typecheck、完整测试及 diff 检查通过。
- 检查生成图标尺寸、manifest 和源一致性，预览 SVG/PNG，并验证页面品牌及构建资源。
- README 区分已验收基础、计划能力和外部验收；不宣传多 Agent，不把规划当实现。
- 小提交逐项推送，PR CI 通过后采用 merge commit 合并 main，保留原始提交。
