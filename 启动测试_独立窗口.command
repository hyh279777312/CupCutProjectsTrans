#!/bin/bash
# ==============================================================================
#  剪映工程打包工具 (Jianying Packager V2 Pro)
#  双击运行桌面独立窗口测试脚本 (macOS Double-Click Runner)
# ==============================================================================

# 自动定位到脚本所在根目录
cd "$(dirname "$0")" || exit 1
PROJECT_DIR="$(pwd)"

# 终端彩色输出定义
BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

clear
echo -e "${CYAN}${BOLD}"
echo "  ╔════════════════════════════════════════════════════════════════╗"
echo "  ║        剪映工程打包工具 - 独立桌面应用启动器 (V2 Pro)          ║"
echo "  ║      Jianying Packager - Dedicated Desktop Runner (macOS)      ║"
echo "  ╚════════════════════════════════════════════════════════════════╝"
echo -e "${RESET}"

# 1. 检查 Node.js 环境
echo -e "${CYAN}[1/4] 正在检测本地运行环境...${RESET}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 未检测到 Node.js，本工具需要 Node.js 18+ 环境。${RESET}"
    echo -e "${YELLOW}请先安装 Node.js (推荐通过 https://nodejs.org 下载安装或使用 brew install node)${RESET}"
    read -p "按回车键退出..."
    exit 1
fi

NODE_VER=$(node -v)
echo -e "${GREEN}✓ Node.js 已就绪: ${NODE_VER}${RESET}"

# 2. 自动检查并安装依赖
echo -e "${CYAN}[2/4] 正在校验项目依赖包...${RESET}"
if [ ! -d "node_modules" ] || [ ! -f "node_modules/vite/package.json" ]; then
    echo -e "${YELLOW}⏳ 首次运行或依赖缺失，正在自动安装依赖 (npm install)...${RESET}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 依赖安装失败，请检查网络后重试。${RESET}"
        read -p "按回车键退出..."
        exit 1
    fi
    echo -e "${GREEN}✓ 依赖安装完成！${RESET}"
else
    echo -e "${GREEN}✓ 依赖包已就绪 (node_modules)${RESET}"
fi

# 3. 校验并生成应用专属高清图标
echo -e "${CYAN}[3/4] 校验应用设计图标...${RESET}"
if [ ! -f "public/app-icon.svg" ] || [ ! -f "public/app-icon.png" ]; then
    node scripts/generate_icon.cjs
fi
echo -e "${GREEN}✓ 高清 macOS 拟物图标已就绪 (public/app-icon.png)${RESET}"

# 4. 启动独立桌面应用窗口
echo -e "${CYAN}[4/4] 正在调起独立桌面 App 窗口...${RESET}"
echo -e "${YELLOW}提示: 正在启动独立无边框桌面窗口，不会混入浏览器普通网页标签页${RESET}"

# 运行桌面启动引擎
node desktop/launch.cjs

# 保持终端在应用退出前挂起
echo -e "\n${CYAN}桌面应用会话已结束。${RESET}"
