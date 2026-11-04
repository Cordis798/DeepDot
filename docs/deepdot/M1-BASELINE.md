# M1 品牌统一验收

日期：2026-11-04；基线 main 为 07c54d1。

- GitHub 已重命名为 Cordis798/DeepDot；origin 指向新仓库，完整历史保留。
- 根包 deepdot，四个 workspace 为 @deepdot/*；全部运行与测试源码的跨包导入已更新。
- 原创 assets/deepdot.svg 为唯一源，npm run generate:icons 输出 README Logo、Web SVG 和 180/192/512/1024 PNG；已检查尺寸、源一致性并目视预览 512px 图标。
- 新增开发依赖 @resvg/resvg-js，用于构建期 SVG 渲染；业务依赖版本保持不变。
- Web 标题、登录/初始化/导航/集成页面和 PWA 名称统一。Service Worker 更新缓存名并清理旧品牌 shell 缓存。
- 保留 DEEP_WORKER_*、dw_session、deep-worker.db、原 localStorage 键及容器镜像标签；无数据库迁移。
- README 完整列出非多 Agent 目标，区分当前基础、规划与外部验收；没有把云端、眼镜或家居标为已实现。
- 当前没有 Electron workspace，因此只提供可复用图标源，不宣称桌面安装包通过验收。

## 实际检查

Node 24.15.0 / npm 11.12.1：干净 npm ci --ignore-scripts、build、typecheck 均通过；完整测试 87 文件 / 256 用例通过，耗时 27.28 秒。图标尺寸/源一致性、旧标识保留、前端品牌引用及提交范围空白检查已核对。

早期两条安装命令重叠导致安装目录暂时不完整，已串行干净安装恢复。npm 初次再生成 lockfile 使用 CRLF 导致较大提交差异，后续用格式化工具统一为 LF；保留已推送提交，最终 PR 的 lockfile 差异仅包含包改名与渲染器相关条目。

本阶段不改变业务逻辑，不退役现有 Router；后者属于 M2。最终以阶段 PR 和合并后的 main CI 为交付证据。用户已明确授权本阶段完成后合并 main。

用户最新调整：Logo 沿用只读参考 OpenDot/assets/miniclaw-icon.svg 的白色机器人，源复制至 assets/deepdot.svg，所有导出重新生成。此要求替代此前原创圆点方案；参考目录未修改。
