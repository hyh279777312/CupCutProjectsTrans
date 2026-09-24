#!/bin/bash
# ==============================================================================
#  剪映工程打包工具 (Jianying Packager V2 Pro)
#  一键自动打包为 macOS .app 和 .dmg 安装镜像
# ==============================================================================

set -e

# 定位脚本所在目录至项目根目录
cd "$(dirname "$0")/.." || exit 1
ROOT_DIR="$(pwd)"

BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

APP_NAME="剪映工程打包工具"
BUNDLE_ID="com.jianying.packager"
VERSION="2.0.0"
OUTPUT_DIR="${ROOT_DIR}/dist_mac"
DMG_NAME="${APP_NAME}_v${VERSION}_macOS.dmg"

echo -e "${CYAN}${BOLD}"
echo "  ╔════════════════════════════════════════════════════════════════╗"
echo "  ║        剪映工程打包工具 - macOS 原生 .app & .dmg 自动打包       ║"
echo "  ║      Jianying Packager - macOS App & DMG Automated Packager    ║"
echo "  ╚════════════════════════════════════════════════════════════════╝"
echo -e "${RESET}"

# 1. 检查 Node.js 环境
echo -e "${CYAN}[1/6] 检查 Node.js 构建环境...${RESET}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 未检测到 Node.js，请先安装 Node.js 18+ 后重试。${RESET}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js 环境正常 ($(node -v))${RESET}"

# 2. 自动安装依赖包
echo -e "${CYAN}[2/6] 检查并自动安装项目依赖...${RESET}"
if [ ! -d "node_modules" ] || [ ! -f "node_modules/vite/package.json" ]; then
    echo -e "${YELLOW}⏳ 正在自动运行 npm install 安装依赖...${RESET}"
    npm install
fi
echo -e "${GREEN}✓ 依赖项已完整就绪${RESET}"

# 3. 编译前端生产静态资源
echo -e "${CYAN}[3/6] 执行生产环境构建 (npm run build)...${RESET}"
npm run build
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ 静态资源编译失败，未找到 dist/index.html${RESET}"
    exit 1
fi
echo -e "${GREEN}✓ 前端产物编译成功 (dist/)${RESET}"

# 4. 生成应用专属高清图标及 macOS .icns 图标文件
echo -e "${CYAN}[4/6] 生成高清 macOS 图标 (.icns)...${RESET}"
node scripts/generate_icon.cjs

ICON_PNG="${ROOT_DIR}/public/app-icon.png"
ICNS_FILE="${ROOT_DIR}/public/app.icns"

# macOS 原生转换 ICNS
if [ "$(uname)" = "Darwin" ]; then
    if command -v iconutil &> /dev/null && command -v sips &> /dev/null; then
        echo -e "${YELLOW}正在通过 macOS iconutil 编译多分辨率图标层...${RESET}"
        ICONSET_DIR="/tmp/app_icon.iconset"
        rm -rf "$ICONSET_DIR"
        mkdir -p "$ICONSET_DIR"

        sips -z 16 16     "$ICON_PNG" --out "${ICONSET_DIR}/icon_16x16.png" > /dev/null
        sips -z 32 32     "$ICON_PNG" --out "${ICONSET_DIR}/icon_16x16@2x.png" > /dev/null
        sips -z 32 32     "$ICON_PNG" --out "${ICONSET_DIR}/icon_32x32.png" > /dev/null
        sips -z 64 64     "$ICON_PNG" --out "${ICONSET_DIR}/icon_32x32@2x.png" > /dev/null
        sips -z 128 128   "$ICON_PNG" --out "${ICONSET_DIR}/icon_128x128.png" > /dev/null
        sips -z 256 256   "$ICON_PNG" --out "${ICONSET_DIR}/icon_128x128@2x.png" > /dev/null
        sips -z 256 256   "$ICON_PNG" --out "${ICONSET_DIR}/icon_256x256.png" > /dev/null
        sips -z 512 512   "$ICON_PNG" --out "${ICONSET_DIR}/icon_256x256@2x.png" > /dev/null
        sips -z 512 512   "$ICON_PNG" --out "${ICONSET_DIR}/icon_512x512.png" > /dev/null
        sips -z 1024 1024 "$ICON_PNG" --out "${ICONSET_DIR}/icon_512x512@2x.png" > /dev/null

        iconutil -c icns "$ICONSET_DIR" -o "$ICNS_FILE"
        rm -rf "$ICONSET_DIR"
        echo -e "${GREEN}✓ 已生成原生 app.icns 图标${RESET}"
    fi
fi

# 5. 构建原生 macOS .app 独立应用包
echo -e "${CYAN}[5/6] 组装原生独立 macOS 应用包 (${APP_NAME}.app)...${RESET}"
rm -rf "${OUTPUT_DIR}"
mkdir -p "${OUTPUT_DIR}"

APP_BUNDLE="${OUTPUT_DIR}/${APP_NAME}.app"
CONTENTS="${APP_BUNDLE}/Contents"
MACOS_DIR="${CONTENTS}/MacOS"
RESOURCES_DIR="${CONTENTS}/Resources"

mkdir -p "${MACOS_DIR}"
mkdir -p "${RESOURCES_DIR}/app"

# 复制编译后的前端资源到 App Resources
cp -R "${ROOT_DIR}/dist/"* "${RESOURCES_DIR}/app/"
cp "${ROOT_DIR}/public/app-icon.png" "${RESOURCES_DIR}/app-icon.png"
if [ -f "$ICNS_FILE" ]; then
    cp "$ICNS_FILE" "${RESOURCES_DIR}/app.icns"
fi

# 创建 Info.plist
cat > "${CONTENTS}/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleDisplayName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleIdentifier</key>
    <string>${BUNDLE_ID}</string>
    <key>CFBundleVersion</key>
    <string>${VERSION}</string>
    <key>CFBundleShortVersionString</key>
    <string>${VERSION}</string>
    <key>CFBundleExecutable</key>
    <string>JianyingPackagerLauncher</string>
    <key>CFBundleIconFile</key>
    <string>app.icns</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSSupportsAutomaticGraphicsSwitching</key>
    <true/>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
</dict>
</plist>
EOF

# 创建独立桌面运行启动器脚本 (Executable Launcher)
cat > "${MACOS_DIR}/JianyingPackagerLauncher" <<'EOF'
#!/bin/bash
DIR="$(cd "$(dirname "$0")/../Resources" && pwd)"
APP_DIR="${DIR}/app"
PORT=32190

# 寻找系统空闲端口
while lsof -i:"$PORT" &> /dev/null; do
    PORT=$((PORT + 1))
done

# 在后台启动轻量静态文件服务器
if command -v python3 &> /dev/null; then
    (cd "$APP_DIR" && python3 -m http.server "$PORT" --bind 127.0.0.1) &
    SERVER_PID=$!
elif command -v node &> /dev/null; then
    node -e "
      const http = require('http');
      const fs = require('fs');
      const path = require('path');
      const base = '${APP_DIR}';
      const mimes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
      http.createServer((req, res) => {
        let p = path.join(base, req.url.split('?')[0]);
        if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
        if (!fs.existsSync(p)) p = path.join(base, 'index.html');
        const ext = path.extname(p);
        res.writeHead(200, { 'Content-Type': mimes[ext] || 'application/octet-stream' });
        fs.createReadStream(p).pipe(res);
      }).listen(${PORT}, '127.0.0.1');
    " &
    SERVER_PID=$!
fi

# 等待端口响应
for i in {1..20}; do
    if curl -s "http://127.0.0.1:${PORT}" &> /dev/null; then
        break
    fi
    sleep 0.2
done

URL="http://127.0.0.1:${PORT}"
USER_DATA_DIR="/tmp/jianying_packager_app_runtime"

# 以独立桌面窗口调起（无地址栏、无标签页、原生独立窗口）
CHROME_APP="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
EDGE_APP="/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
BRAVE_APP="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"

if [ -f "$CHROME_APP" ]; then
    "$CHROME_APP" --app="$URL" --window-size=1440,920 --user-data-dir="$USER_DATA_DIR" --disable-extensions
elif [ -f "$EDGE_APP" ]; then
    "$EDGE_APP" --app="$URL" --window-size=1440,920 --user-data-dir="$USER_DATA_DIR" --disable-extensions
elif [ -f "$BRAVE_APP" ]; then
    "$BRAVE_APP" --app="$URL" --window-size=1440,920 --user-data-dir="$USER_DATA_DIR" --disable-extensions
else
    open "$URL"
fi

# 退出时杀掉本地后台轻量服务器
if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
fi
EOF

chmod +x "${MACOS_DIR}/JianyingPackagerLauncher"
echo -e "${GREEN}✓ ${APP_NAME}.app 组装完成！${RESET}"

# 6. 生成 macOS .dmg 安装盘镜像
echo -e "${CYAN}[6/6] 制作 macOS .dmg 磁盘镜像安装包...${RESET}"
DMG_PATH="${OUTPUT_DIR}/${DMG_NAME}"
rm -f "$DMG_PATH"

if [ "$(uname)" = "Darwin" ]; then
    STAGING_DIR="/tmp/jianying_dmg_staging"
    rm -rf "$STAGING_DIR"
    mkdir -p "$STAGING_DIR"

    cp -R "$APP_BUNDLE" "$STAGING_DIR/"
    # 创建 /Applications 快捷安装软链接
    ln -s /Applications "$STAGING_DIR/Applications (拖移至此安装)"

    echo -e "${YELLOW}正在使用 hdiutil 压缩生成 UDZO DMG...${RESET}"
    hdiutil create -volname "${APP_NAME}" \
                   -srcfolder "$STAGING_DIR" \
                   -ov \
                   -format UDZO \
                   "$DMG_PATH" > /dev/null

    rm -rf "$STAGING_DIR"
    echo -e "${GREEN}✓ DMG 安装包制作完成！${RESET}"
    echo -e "${CYAN}文件路径: ${DMG_PATH}${RESET}"

    # 尝试在访达中显示打包结果
    if command -v open &> /dev/null; then
        open "${OUTPUT_DIR}"
    fi
else
    echo -e "${YELLOW}当前为 Linux 交叉构建环境，将 .app 打包为通用交付归档${RESET}"
    if command -v zip &> /dev/null; then
        (cd "${OUTPUT_DIR}" && zip -r "${APP_NAME}_macOS.zip" "${APP_NAME}.app" > /dev/null)
        echo -e "${GREEN}✓ 已生成 macOS 应用交付包: ${OUTPUT_DIR}/${APP_NAME}_macOS.zip${RESET}"
    elif command -v tar &> /dev/null; then
        (cd "${OUTPUT_DIR}" && tar -czf "${APP_NAME}_macOS.tar.gz" "${APP_NAME}.app")
        echo -e "${GREEN}✓ 已生成 macOS 应用交付包: ${OUTPUT_DIR}/${APP_NAME}_macOS.tar.gz${RESET}"
    fi
fi

echo -e "\n${GREEN}${BOLD}======================================================${RESET}"
echo -e "${GREEN}${BOLD}🎉 macOS .app 与 .dmg 打包全部成功！${RESET}"
echo -e "   产物目录: ${OUTPUT_DIR}"
echo -e "   独立程序: ${APP_BUNDLE}"
if [ -f "$DMG_PATH" ]; then
    echo -e "   DMG镜像 : ${DMG_PATH}"
fi
echo -e "${GREEN}${BOLD}======================================================${RESET}\n"
