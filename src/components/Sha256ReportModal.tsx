import React, { useState } from 'react';
import { ShieldCheck, Check, Copy, X, FileText, Download, FolderCheck, AlertTriangle, FileCode } from 'lucide-react';
import { PackagingConfig, PackagingProgress, ProjectDraft } from '../types';
import { generatePackageNotes, generatePackageInfoJson } from '../utils/draftEngine';

interface Sha256ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectDraft | null;
  config: PackagingConfig;
  progress: PackagingProgress;
}

export const Sha256ReportModal: React.FC<Sha256ReportModalProps> = ({
  isOpen,
  onClose,
  project,
  config,
  progress,
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'copied' | 'missing' | 'sha' | 'pkginfo'>('report');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !project) return null;

  const notes = generatePackageNotes(project, config);
  const pkgInfoJson = generatePackageInfoJson(project, config);

  const getCurrentText = () => {
    switch (activeTab) {
      case 'report':
        return notes.packageReportText;
      case 'copied':
        return notes.copiedMediaText;
      case 'missing':
        return notes.missingMediaText;
      case 'sha':
        return notes.sha256SumsText;
      case 'pkginfo':
        return pkgInfoJson;
    }
  };

  const getFileName = () => {
    switch (activeTab) {
      case 'report':
        return 'PACKAGE_REPORT.txt';
      case 'copied':
        return 'COPIED_MEDIA.txt';
      case 'missing':
        return 'MISSING_MEDIA.txt';
      case 'sha':
        return 'SHA256SUMS.txt';
      case 'pkginfo':
        return 'PACKAGE_INFO.json';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCurrent = () => {
    const isJson = activeTab === 'pkginfo';
    const mime = isJson ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8';
    const blob = new Blob([getCurrentText()], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFileName();
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#14161f] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-[#191c26]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-white flex items-center gap-2">
                05_REPORT/ 归档报告与自愈映射清单
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono">
                  标准迁移规范
                </span>
              </h3>
              <p className="text-[10px] text-zinc-400">
                工程: {project.name} | 模式: {config.exportMode === 'used_only' ? '仅已使用' : '全部素材'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制' : '复制文本'}</span>
            </button>
            <button
              onClick={handleDownloadCurrent}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 {getFileName()}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 px-4 py-2 bg-black/40 border-b border-white/5 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'report' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            PACKAGE_REPORT.txt
          </button>
          <button
            onClick={() => setActiveTab('copied')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'copied' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            COPIED_MEDIA.txt
          </button>
          <button
            onClick={() => setActiveTab('missing')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'missing' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            MISSING_MEDIA.txt
          </button>
          <button
            onClick={() => setActiveTab('sha')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'sha' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            SHA256SUMS.txt
          </button>
          <button
            onClick={() => setActiveTab('pkginfo')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'pkginfo' ? 'bg-indigo-600 text-white' : 'text-amber-400/80 hover:text-amber-300 hover:bg-white/5'
            }`}
          >
            PACKAGE_INFO.json
          </button>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 p-4 overflow-y-auto bg-[#0c0d12]">
          <pre className="mono-code text-[11px] text-zinc-300 leading-relaxed whitespace-pre font-mono">
            {getCurrentText()}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#14161f] border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400">
          <span>💡 提示：该目录下所有报告均在打包时自动写入 05_REPORT 文件夹与迁移包根目录。</span>
          <button
            onClick={onClose}
            className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
