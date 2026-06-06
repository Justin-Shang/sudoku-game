🎮 数独小游戏
一款专为 8～12 岁孩子 设计的卡通风格数独游戏，支持多档难度和多套皮肤，运行在浏览器中，可在 Windows / macOS / Linux 任意平台游玩。

✨ 功能特色
🎯 四档难度
   难度	线索数	适合人群
🌸 初级	38 格	数独新手，轻松入门
🌊 中级	32 格	有一定基础，需要推理
🔥 高级	26 格	考验逻辑，挑战自我
⚡ 专家	22 格	对标竞技数独大师
🎨 四套皮肤（即时切换）
🌸 粉色少女 — 薄荷紫粉，温柔可爱
🔵 深海蓝 — 蓝绿清爽，沉静专注
🟠 阳光橙 — 暖橙金黄，活泼明朗
🌙 星空夜 — 深色星空，护眼暗色
🕹️ 游戏玩法
9×9 标准数独，每局随机生成，保证有解
❤️ 三次反悔机会，每次可撤销上一步操作
错误高亮：填错的数字显示红色并附带抖动动画
同数字高亮：选中格子时，棋盘上相同数字淡色提示
关联行列高亮：自动标出同行、同列、同宫格
计时器：记录完成每局的用时
键盘支持：数字键 1-9 填入，方向键移动，Delete 清除
🚀 本地运行
环境要求
Node.js 20+
pnpm 9+
启动步骤
# 克隆项目
git clone https://github.com/Justin-Shang/sudoku-game.git
cd sudoku-game
# 安装依赖
pnpm install
# 启动数独游戏
pnpm --filter @workspace/sudoku-game run dev

浏览器打开 http://localhost:5173 即可游玩。

🗂️ 项目结构
artifacts/sudoku-game/
├── src/
│   ├── lib/
│   │   └── sudoku.ts        # 数独生成与验证算法（回溯法）
│   ├── pages/
│   │   └── Game.tsx         # 游戏主界面（全部游戏逻辑）
│   ├── App.tsx              # 路由入口
│   └── index.css            # 主题 CSS 变量（四套皮肤）
└── public/

技术栈
React 18 + TypeScript
Vite 构建工具
Tailwind CSS v4 样式
Lucide React 图标
pnpm workspaces monorepo
数独生成算法
先填充对角线上三个独立的 3×3 宫格（互不影响）
用回溯法填满剩余格子，得到完整解
随机移除格子得到谜题，保留对应数量的线索
