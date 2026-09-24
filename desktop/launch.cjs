const { spawn, execSync } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

const PORT = 3000;
const URL = `http://localhost:${PORT}`;

function isServerListening(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function findDesktopAppEngine() {
  if (process.platform === 'darwin') {
    // Check Chrome / Edge App Mode
    const candidates = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      `${process.env.HOME}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      `${process.env.HOME}/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge`,
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    ];

    for (const bin of candidates) {
      if (fs.existsSync(bin)) {
        return { type: 'app_mode', bin };
      }
    }
  }
  return null;
}

async function main() {
  console.log('\n======================================================');
  console.log('   剪映工程打包工具 (Jianying Packager V2 Pro)');
  console.log('   启动独立桌面应用窗口测试 (Desktop App Mode)');
  console.log('======================================================\n');

  // Check if server is already running
  let serverRunning = await isServerListening(PORT);

  let devServerProcess = null;
  if (!serverRunning) {
    console.log(`[1/3] 正在启动后台服务 (端口: ${PORT})...`);

    // Check if dist exists, otherwise run vite dev
    const distIndex = path.join(__dirname, '../dist/index.html');
    const hasDist = fs.existsSync(distIndex);

    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const serverArgs = hasDist ? ['run', 'preview', '--', '--port', `${PORT}`, '--host', '0.0.0.0'] : ['run', 'dev'];

    devServerProcess = spawn(npmCmd, serverArgs, {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
      env: { ...process.env, PORT: `${PORT}` }
    });

    devServerProcess.stdout.on('data', (d) => {
      const msg = d.toString();
      if (msg.includes('Local:') || msg.includes('ready in')) {
        // server ready
      }
    });

    devServerProcess.stderr.on('data', (d) => {
      // ignore verbose vite warnings
    });

    // Wait for server to become responsive
    console.log('[2/3] 等待服务准备就绪...');
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 400));
      if (await isServerListening(PORT)) {
        serverRunning = true;
        break;
      }
    }

    if (!serverRunning) {
      console.error('❌ 服务启动超时，请重试');
      if (devServerProcess) devServerProcess.kill();
      process.exit(1);
    }
  } else {
    console.log(`[1/3] 检测到本地服务已在端口 ${PORT} 运行`);
  }

  console.log('[3/3] 正在调起独立桌面窗口...');

  // 1. Try launching with Electron if installed
  let electronLaunched = false;
  try {
    const electronPkgPath = require.resolve('electron', { paths: [path.join(__dirname, '..')] });
    if (electronPkgPath) {
      const electronBin = require('electron');
      if (typeof electronBin === 'string' && fs.existsSync(electronBin)) {
        console.log('✓ 采用 Electron 原生桌面引擎启动独立窗口...');
        const electronProc = spawn(electronBin, [path.join(__dirname, 'main.cjs')], {
          stdio: 'inherit',
          env: { ...process.env, VITE_DEV_SERVER_URL: URL }
        });

        electronProc.on('exit', (code) => {
          if (devServerProcess) devServerProcess.kill();
          process.exit(code || 0);
        });
        electronLaunched = true;
        return;
      }
    }
  } catch (e) {
    // Electron not installed locally
  }

  // 2. If Electron not installed, check for App-Mode (No browser tabs, no address bar, independent window!)
  const appEngine = findDesktopAppEngine();
  if (appEngine) {
    console.log(`✓ 采用系统独立 App 窗口模式 (无标签页、无地址栏的纯粹桌面应用):`);
    console.log(`  引擎路径: ${appEngine.bin}`);

    // Create temp user data directory so it runs as an isolated desktop app instance
    const userDataDir = path.join(process.env.TMPDIR || '/tmp', 'jianying_packager_desktop_profile');

    const appProc = spawn(appEngine.bin, [
      `--app=${URL}`,
      '--window-size=1440,920',
      '--window-position=120,80',
      `--user-data-dir=${userDataDir}`,
      '--disable-extensions',
      '--no-first-run',
      '--no-default-browser-check'
    ], {
      detached: true,
      stdio: 'ignore'
    });
    appProc.unref();

    console.log('\n======================================================');
    console.log('🎉 独立桌面 App 已成功弹出！');
    console.log(`   访问地址: ${URL}`);
    console.log('   退出请直接关闭桌面应用窗口或在终端按 Ctrl+C');
    console.log('======================================================\n');

    // Keep parent process alive to clean up server on exit
    process.on('SIGINT', () => {
      console.log('\n正在停止后台服务...');
      if (devServerProcess) devServerProcess.kill();
      process.exit(0);
    });

    return;
  }

  // 3. Fallback: prompt for electron or open
  console.log('✓ 正在打开独立窗口...');
  if (process.platform === 'darwin') {
    execSync(`open -na "Safari" "${URL}" || open "${URL}"`);
  } else {
    execSync(`xdg-open "${URL}" || open "${URL}"`);
  }
}

main().catch(console.error);
