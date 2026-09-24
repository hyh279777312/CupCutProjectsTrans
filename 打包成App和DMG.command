#!/bin/bash
# ==============================================================================
#  剪映工程打包工具 (Jianying Packager V2 Pro)
#  双击自动打包为 macOS .app 和 .dmg 安装镜像 (macOS Double-Click Packager)
# ==============================================================================

# 自动定位到脚本所在根目录
cd "$(dirname "$0")" || exit 1

# 给予执行权限并调用核心打包脚本
chmod +x scripts/package_mac.sh
./scripts/package_mac.sh

echo "按任意键退出终端窗口..."
read -n 1 -s
