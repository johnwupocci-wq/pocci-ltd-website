# LUXCEL 存储科技 · 存储模组科技独立站（静态源码工程）

深色科技风、中英双语的存储模组（Storage Module）厂商独立站。多文件静态工程：6 个 HTML 页面 + 原生 CSS/JS，无构建依赖，可直接部署到任意静态托管。

> 本项目为**示例站点**：品牌名、产品规格、联系方式均为占位内容（页面中已用「示例 / Sample」标注），交付后按下方清单替换为真实资料即可上线。

## 栏目与页面

| 栏目 | 文件 | 核心内容 |
| --- | --- | --- |
| 首页 | `index.html` | 品牌英雄区、产品版图、研发验证/定制适配、可信度证据条 |
| 公司介绍 | `about.html` | 使命定位、服务边界、发展脉络、质量观 |
| 产品 | `products.html` | 四大产品族（NVMe SSD / DDR5 / 工业 SATA / 嵌入式）+ 选型帮助 + 对比表 |
| 方案 | `solutions.html` | 数据中心、工业、安防、嵌入式四类场景方案 |
| 技术服务 | `services.html` | 六项服务能力、协作流程、RMA 状态流转 |
| 联系方式 | `contact.html` | 联系渠道 + 前端演示表单 + FAQ |

## 技术要点

- **中英双语**：所有文案集中在 `assets/js/i18n.js`，页面元素通过 `data-i18n` / `data-i18n-placeholder` / `data-i18n-alt` / `data-i18n-aria` 标注，右上角「中 / EN」即时切换；默认中文。语言偏好经 `localStorage` 持久化，切换后跨页面与刷新保持一致（浏览器禁用存储时自动降级为内存态）。
- **样式系统**：`assets/css/style.css` 顶部 CSS 变量为设计令牌（深空蓝黑底 `#0b0f17`、主行动色 `#2a6df0`、语义色，均按 WCAG AA 对比度校验），4px 间距尺度，响应式覆盖 320–2560px。
- **交互**：`assets/js/main.js` 负责语言切换、移动端菜单、滚动显现（`prefers-reduced-motion` 下关闭）、当前导航高亮、表单演示（含防重复提交）。不使用 `history`/`clipboard` 等受限 API。
- **图片**：5 张原创概念渲染图（`assets/img/`），由 AI 生图模型生成，无文字无水印，页面中已标注「概念图」。
- **无障碍**：跳过链接、语义化标签、可见焦点、对比度达标、键盘可达、表单错误提示与 `aria-live`。

## 本地运行

无需构建，任选一种：

```bash
# 方式一：Python 静态服务
python3 -m http.server 8080 --directory storage-module-website
# 打开 http://localhost:8080

# 方式二：直接双击 index.html（file:// 下交互同样可用）
```

## 占位内容替换清单

上线前请全局替换以下内容（同时更新 `assets/js/i18n.js` 与各 HTML 内嵌的既有文案）：

| 项目 | 当前占位 | 替换为 |
| --- | --- | --- |
| 品牌名 | LUXCEL / LUXCEL 存储科技 | 真实公司名 |
| 商务邮箱 | sales@luxcel.example.com | 真实邮箱 |
| 支持邮箱 | support@luxcel.example.com | 真实邮箱 |
| 电话 | +86 400-000-0000 | 真实电话 |
| 地址 | 示例园区 · 中国深圳 | 真实地址 |
| 产品规格 | 各产品页「示例规格」卡片与对比表 | 正式规格书数值 |
| 发展脉络 | 公司页时间线（标注示例） | 真实里程碑 |
| 概念图 | assets/img/*.png | 真实产品图（保持 16:9 附近比例） |

> 替换规格时请同步移除页面上的「示例 / Sample」徽标，并更新 README 内的声明。

## 目录结构

```
storage-module-website/
├── index.html / about.html / products.html / solutions.html / services.html / contact.html
├── assets/
│   ├── css/style.css
│   ├── js/i18n.js, main.js
│   └── img/  (5 张概念图, 2560×1440)
└── README.md
```