import React, { useState } from 'react';
import { Terminal, Copy, Check, X, Download, ShieldCheck, FolderTree, Sparkles, Laptop, RefreshCw, FileCode } from 'lucide-react';
import { ProjectDraft, PackagingConfig } from '../types';
import {
  generatePackV2ProCommandScript,
  generateInstallerCommandScript,
  generatePackageInfoJson,
} from '../utils/draftEngine';

interface BashScriptModalProps {
  project: ProjectDraft | null;
  config: PackagingConfig;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'installer' | 'pack' | 'pkginfo';
}

export const BashScriptModal: React.FC<BashScriptModalProps> = ({
  project,
  config,
  isOpen,
  onClose,
  defaultTab = 'installer',
}) => {
  const [activeTab, setActiveTab] = useState<'installer' | 'pack' | 'pkginfo'>(defaultTab);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !project) return null;

  const installerContent = generateInstallerCommandScript(project, config);
  const packContent = generatePackV2ProCommandScript(project, config);
  const pkgInfoContent = generatePackageInfoJson(project, config);

  const currentContent =
    activeTab === 'installer'
      ? installerContent
      : activeTab === 'pack'
      ? packContent
      : pkgInfoContent;

  const currentFileName =
    activeTab === 'installer'
      ? '安装剪映工程.command'
      : activeTab === 'pack'
      ? '制作迁移包.command'
      : 'PACKAGE_INFO.json';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const isJson = activeTab === 'pkginfo';
    const mime = isJson ? 'application/json;charset=utf-8' : 'text/x-sh;charset=utf-8';
    const blob = new Blob([currentContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#14161f] border border-white/15 rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#191c26]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs sm:text-sm text-white flex items-center gap-2">
                <span>剪映 V3 跨机迁移脚本与自动安装中心</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono">
                  全流程非ZIP
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                新电脑一键双击自动入库剪映本地草稿库并自愈路径，彻底解决剪映无“导入工程”菜单痛点
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-2.5 bg-[#161822] border-b border-white/10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('installer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-colors border-t border-x cursor-pointer ${
              activeTab === 'installer'
                ? 'bg-[#0c0d12] border-white/15 text-cyan-300 border-b-transparent'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold">⭐️ 新电脑一键安装器 (安装剪映工程.command)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pack')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-colors border-t border-x cursor-pointer ${
              activeTab === 'pack'
                ? 'bg-[#0c0d12] border-white/15 text-indigo-300 border-b-transparent'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>旧电脑离线制作脚本 (制作迁移包.command)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pkginfo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-colors border-t border-x cursor-pointer ${
              activeTab === 'pkginfo'
                ? 'bg-[#0c0d12] border-white/15 text-amber-300 border-b-transparent'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>核心迁移元数据 (PACKAGE_INFO.json)</span>
          </button>
        </div>

        {/* Action & Info Bar */}
        <div className="px-5 py-2.5 bg-black/40 border-b border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono text-zinc-300 text-[11px]">
            <span className="text-cyan-400 font-bold">$</span>
            <span className="text-zinc-100 font-semibold">{currentFileName}</span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">
              {activeTab === 'installer'
                ? '新 Mac 双击直接执行：自动探查草稿库 + 路径重写 + 唤醒剪映'
                : activeTab === 'pack'
                ? '旧 Mac 终端秒级非ZIP克隆'
                : '素材新旧路径重写映射表'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制内容' : '复制代码'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-medium transition-colors cursor-pointer border border-white/10"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>下载 {currentFileName}</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 p-4 overflow-y-auto bg-[#0c0d12]">
          <pre className="text-[11px] text-zinc-300 leading-relaxed whitespace-pre font-mono selection:bg-indigo-500/30">
            {currentContent}
          </pre>
        </div>

        {/* Footer Note */}
        <div className="px-5 py-2.5 bg-[#14161f] border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
          <span>
            {activeTab === 'installer'
              ? '💡 提示：在生成的迁移包根目录中已自动包含该脚本，在新 Mac 上双击即可完成 3 秒入库！'
              : '💡 提示：无需安装任何第三方库，完全基于 macOS 自带的原生工具与 Python 3 引擎运行。'}
          </span>
          <button
            onClick={onClose}
            className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
