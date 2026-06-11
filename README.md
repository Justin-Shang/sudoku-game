# Sudoku Game 🎮🔢

> **专为 8～12 岁孩子设计的卡通风格数独游戏** — 四档难度 × 四套皮肤，浏览器即开即玩。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C8?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🎯 项目定位

这是一个为孩子设计的数独游戏，**不是标准的竞技数独**——UI 采用圆润的卡通风格，配色明亮友好，交互反馈带可爱的抖动动画，让孩子在轻松的氛围中培养逻辑思维。

| 适合谁 | 特点 |
|--------|------|
| 👦 8-12 岁孩子 | 卡通 UI、柔和配色、正向反馈 |
| 👨‍👩‍👧‍👦 亲子互动 | 低上手门槛，家长可陪同 |
| 🧩 数独初学者 | 从初级 38 线索轻松入门 |
| 🏫 课堂教学 | 免费浏览器运行，无需安装 |

---

## ✨ 功能特色

### 🎯 四档难度

| 难度 | 图标 | 线索数 | 适合 |
|:----:|:----:|:------:|:----:|
| 初级 | 🌸 | 38 格 | 数独新手，轻松入门 |
| 中级 | 🌊 | 32 格 | 有一定基础，需要简单推理 |
| 高级 | 🔥 | 26 格 | 考验逻辑，挑战自我 |
| 专家 | ⚡ | 22 格 | 对标竞技数独大师 |

### 🎨 四套皮肤（即时切换）

| 皮肤 | 主色调 | 氛围 |
|:----:|:-------|:-----|
| 🌸 粉色少女 | 薄荷紫粉 | 温柔可爱 |
| 🔵 深海蓝 | 蓝绿清爽 | 沉静专注 |
| 🟠 阳光橙 | 暖橙金黄 | 活泼明朗 |
| 🌙 星空夜 | 深色星空 | 护眼暗色 |

### 🕹️ 游戏交互

- **9×9 标准数独** — 每局随机生成，保证有解
- **❤️ 3 次反悔机会** — 每次可撤销上一步操作
- **❌ 错误高亮** — 填错的数字显示红色并附带抖动动画
- **🔢 同数字高亮** — 选中格子时，棋盘上相同数字淡色提示
- **📏 关联行列高亮** — 自动标出同行、同列、同宫格
- **⏱️ 计时器** — 记录每局完成用时
- **⌨️ 键盘全支持** — 数字键 1-9 填入，方向键移动，Delete 清除

---

## 🖥️ 截图预览

| 游戏主界面 | 难度选择 | 皮肤切换 |
|:---------:|:--------:|:--------:|
| ![游戏](docs/screenshots/game.png) | ![难度](docs/screenshots/difficulty.png) | ![皮肤](docs/screenshots/themes.png) |

> ⚠️ 截图为占位符，部署后可用真实截图替换。

---

## 🏗️ 项目结构

```
sudoku-game/
├── artifacts/
│   └── sudoku-game/               # 🎮 主游戏应用
│       └── src/
│           ├── lib/
│           │   └── sudoku.ts       # 🧠 数独生成与验证算法
│           ├── pages/
│           │   └── Game.tsx        # 🎯 游戏主界面（全部游戏逻辑）
│           ├── App.tsx             # 🚪 路由入口
│           └── index.css           # 🎨 主题 CSS 变量（四套皮肤）
│       └── public/                 # 静态资源
├── lib/                            # 共享库（monorepo 内部包）
│   ├── api-spec/                   # OpenAPI 规范
│   ├── api-zod/                    # Zod 验证 schema
│   ├── api-client-react/           # React Query hooks
│   └── db/                         # 数据库层（Drizzle ORM）
├── scripts/                        # 构建与部署脚本
└── pnpm-workspace.yaml             # Monorepo 工作空间
```

---

## 🧠 核心技术

### 数独生成算法

采用经典的三步法生成谜题：

```
1️⃣ 填充对角线宫格
    ┌─────┬─────┬─────┐
    │  ✅  │     │     │  ← 对角线上三个 3×3
    │  ✅  │     │     │     宫格互不影响，随机填充
    │  ✅  │     │     │
    ├─────┼─────┼─────┤
    │     │  ✅  │     │
    │     │  ✅  │     │
    │     │  ✅  │     │
    ├─────┼─────┼─────┤
    │     │     │  ✅  │
    │     │     │  ✅  │
    │     │     │  ✅  │
    └─────┴─────┴─────┘

2️⃣ 回溯法填充剩余格子
    用深度优先搜索填入非对角线区域，回溯到找到完整解
    → 得到一个 81 格全填满的完整数独

3️⃣ 随机移除格子生成谜题
    从完整解中随机移除格子，保留对应难度数量的线索
    → 得到可玩的谜题（保证唯一解）
```

### 技术栈明细

| 层级 | 技术 |
|:-----|:-----|
| **前端框架** | React 18 + TypeScript 5.9 |
| **构建工具** | Vite 6 |
| **样式** | Tailwind CSS v4 |
| **图标** | Lucide React |
| **包管理** | pnpm workspaces（Monorepo） |
| **后端（辅助）** | Express 5 + Drizzle ORM + PostgreSQL |
| **验证** | Zod v4 + drizzle-zod |
| **API 代码生成** | Orval（OpenAPI → hooks + Zod） |

---

## 🚀 快速开始

### 环境要求

- **Node.js** 20+
- **pnpm** 9+

### 启动游戏

```bash
# 1. 克隆项目
git clone https://github.com/Justin-Shang/sudoku-game.git
cd sudoku-game

# 2. 安装依赖
pnpm install

# 3. 启动游戏（dev 模式）
pnpm --filter @workspace/sudoku-game run dev
```

浏览器打开 **http://localhost:5173** 即可游玩 🎉

---

## 🧪 脚本参考

```bash
pnpm run typecheck                        # 全项目类型检查
pnpm run build                            # 类型检查 + 全量构建
pnpm --filter @workspace/sudoku-game run dev   # 启动游戏（开发）
pnpm run typecheck:libs                   # 仅检查共享库类型
```

---

## 🧩 Roadmap（想法）

- [ ] 🏆 **在线排行榜** — 按难度记录最快完成时间
- [ ] 📤 **题目分享** — 生成链接分享给朋友挑战
- [ ] 🌐 **联机对战** — 实时多人竞速
- [ ] 🔄 **更多题型** — 6×6 迷你数独、杀手数独
- [ ] 💡 **智能提示** — 选中格子时给出推理路径提示
- [ ] 🌍 **多语言** — 英文 / 日文等界面

---

## 📄 License

[MIT](LICENSE)

---

## 🤝 贡献

喜欢这个项目？欢迎提 issue 或 PR！如果有好的想法（新皮肤主题、新游戏模式），先开 issue 讨论再动手。

---

*Made with 💜 for young puzzle lovers — by Justin-Shang*
