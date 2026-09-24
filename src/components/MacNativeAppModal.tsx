import React, { useState } from 'react';
import {
  X,
  Apple,
  Copy,
  Check,
  Compass,
  CheckCircle2,
  Sparkles,
  Download,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Layers,
  Info
} from 'lucide-react';

interface MacNativeAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MacNativeAppModal: React.FC<MacNativeAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyUrl = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCommand = () => {
    const script = `#!/bin/bash
# ==============================================================================
# 剪映工程打包迁移助手 - macOS 原生 WebKit 独立 App 唤起器
# 说明: 本脚本使用 Mac 系统原生自带的 Safari/WebKit 打开，绝不调用任何 Google Chrome
# ==============================================================================

echo "=================================================="
echo "正在使用 macOS 系统原生 Safari 唤起纯净独立应用..."
echo "=================================================="

open -a Safari "${currentUrl}"

echo ""
echo "⭐️ 接下来只需一步即可保存为桌面独立应用："
echo "在打开的 Safari 顶部菜单栏中，点击："
echo "【文件 (File)】 ➡️ 【添加到程序坞 (Add to Dock)...】"
echo "点击【添加】，即刻在 Mac 应用程序和程序坞中生成独立 App！"
echo ""
`;
    const blob = new Blob([script], { type: 'text/x-sh;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '在Safari中打开并添加为独立App.command';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#141721] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#171b28]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shadow-inner">
              <Apple className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  安装为 Mac 原生独立 App
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium">
                  苹果 WebKit 内核 · 零外部弹窗
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                无需任何编程基础，2 步将本工具永久保存为纯净 Mac 原生独立程序
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-zinc-300 text-xs leading-relaxed">
          {/* Why Chrome Popup Happened */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-200 text-xs block mb-1">
                为什么之前启动时会弹出“欢迎使用 Google Chrome”弹窗？
              </span>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                这是因为之前是通过 Google Chrome 浏览器创建的网页快捷方式。每次启动时，Chrome 会强制检测并弹出自己的浏览器首启欢迎窗（询问设为默认浏览器、发送使用报告）。
                <strong className="text-amber-300">
                  【方案 A】采用 macOS 系统原生的 WebKit 内核（Safari 底层），完全不调用 Chrome，彻底根除该弹窗！
                </strong>
              </p>
            </div>
          </div>

          {/* Step 1 & Step 2 */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>极简安装两步法（完全无需懂代码，只需点击 2 次鼠标）</span>
            </h4>

            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[11px] font-mono border border-cyan-500/30">
                    1
                  </span>
                  第一步：在 Mac 自带的 Safari 浏览器中打开本网址
                </span>
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-blue-400" />
                  苹果自带 Safari
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                请先复制下方本应用的专属访问地址，然后粘贴到 Mac 自带的 Safari 浏览器地址栏中打开：
              </p>

              <div className="flex items-center gap-2 bg-[#0c0e14] p-2 rounded-lg border border-white/10">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="bg-transparent text-zinc-300 font-mono text-[11px] w-full focus:outline-none select-all truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>已复制网址！</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制网址</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500">
                  或者您也可以直接下载一键唤起脚本，双击自动在 Safari 中打开：
                </span>
                <button
                  type="button"
                  onClick={handleDownloadCommand}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>下载【在Safari中打开.command】</span>
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[11px] font-mono border border-emerald-500/30">
                    2
                  </span>
                  第二步：在 Safari 顶部菜单点击「添加到程序坞」
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">
                  ✨ 核心步骤
                </span>
              </div>
              <p className="text-[11px] text-zinc-300">
                在 Safari 打开本页面后，看您 Mac 屏幕最上方的系统菜单栏，依次点击：
              </p>

              <div className="p-3 bg-[#0d1017] rounded-lg border border-white/10 font-mono text-xs text-zinc-200 flex flex-wrap items-center gap-2">
                <span className="px-2 py-1 bg-white/10 rounded text-white font-bold">文件 (File)</span>
                <span className="text-zinc-500">➔</span>
                <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded text-emerald-300 font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  添加到程序坞... (Add to Dock)
                </span>
                <span className="text-zinc-500">➔</span>
                <span className="text-zinc-400">在弹窗中确认名称为「剪映迁移助手」，点击【添加】</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="bg-white/[0.02] p-2 rounded border border-white/5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-zinc-300">完全独立的独立桌面窗口，无地址栏与标签页</span>
                </div>
                <div className="bg-white/[0.02] p-2 rounded border border-white/5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-zinc-300">彻底与 Chrome 剥离，绝不弹出默认浏览器提示</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clean previous Chrome shortcut */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>如何清理之前残留的 Chrome 弹窗图标？</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              打开 Mac 的「访达」➡️ 点击左侧「应用程序」➡️ 找到「Chrome 应用程序」文件夹或旧的「剪映工程打包工具」图标，直接将其拖入废纸篓删除即可。以后只使用程序坞中新生成的 WebKit 独立图标。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#171b28] border-t border-white/10 flex items-center justify-between">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>macOS 官方原生 WebKit 架构，安全、纯净、无任何广告与弹窗</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            我知道了，去操作
          </button>
        </div>
      </div>
    </div>
  );
};
