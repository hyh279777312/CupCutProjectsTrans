import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  Terminal,
  FileText,
  Apple,
  BookOpen,
  FolderTree,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { ProjectDraft } from '../types';

interface SettingsMenuProps {
  currentProject: ProjectDraft | null;
  onOpenBashModal?: () => void;
  onOpenSha256Report?: () => void;
  onOpenMacNativeAppModal?: () => void;
  onOpenOfficialGuide?: () => void;
  onOpenKeyFilesModal?: () => void;
  macUsername?: string;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  currentProject,
  onOpenBashModal,
  onOpenSha256Report,
  onOpenMacNativeAppModal,
  onOpenOfficialGuide,
  onOpenKeyFilesModal,
  macUsername,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleItemClick = (action?: () => void) => {
    if (!action) return;
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Settings Gear Trigger Button */}
      <button
        id="btn-global-settings-toggle"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-indigo-600/30 border-indigo-400/50 text-white shadow-lg shadow-indigo-600/20'
            : 'bg-white/5 hover:bg-white/10 active:bg-white/15 border-white/10 text-zinc-300 hover:text-white'
        }`}
        title="工具与高级设置 (新机脚本、05_REPORT、Mac 原生 App、排查手册)"
      >
        <Settings
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-90 text-indigo-300' : 'group-hover:rotate-45'
          }`}
        />
      </button>

      {/* Backdrop for click outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Settings Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-84 z-50 bg-[#151821]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl shadow-black/90 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-2 pt-1 pb-1.5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                <span>工具与高级设置</span>
              </h4>
              <p className="text-[10px] text-zinc-400">
                集成辅助脚本、合规报告与系统工具
              </p>
            </div>
            {currentProject && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                已载入草稿
              </span>
            )}
          </div>

          {/* Section 1: Packaging & Migration Tools */}
          <div className="space-y-1">
            <div className="text-[10px] font-semibold text-zinc-400 px-2 py-0.5 uppercase tracking-wider">
              跨机迁移工具
            </div>

            {/* 1. New Machine Installer & Bash Scripts */}
            <button
              id="btn-settings-bash-scripts"
              type="button"
              disabled={!currentProject}
              onClick={() => handleItemClick(onOpenBashModal)}
              className="w-full text-left p-2 rounded-xl transition-all flex items-start gap-2.5 group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-cyan-400 mt-0.5">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-100 group-hover:text-white">
                    新机安装器与终端脚本
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-1">
                  生成【安装剪映工程.command】脚本与离线秒拷命令
                </p>
              </div>
            </button>

            {/* 2. 05_REPORT Archive Report */}
            <button
              id="btn-settings-sha256-report"
              type="button"
              disabled={!currentProject}
              onClick={() => handleItemClick(onOpenSha256Report)}
              className="w-full text-left p-2 rounded-xl transition-all flex items-start gap-2.5 group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-amber-400 mt-0.5">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-100 group-hover:text-white">
                    查看 05_REPORT 归档报告
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-1">
                  导出 SHA256 完整性清单与四份合规归档证书
                </p>
              </div>
            </button>

            {/* 3. Key Files Deep Analysis */}
            {onOpenKeyFilesModal && (
              <button
                id="btn-settings-key-files"
                type="button"
                disabled={!currentProject}
                onClick={() => handleItemClick(onOpenKeyFilesModal)}
                className="w-full text-left p-2 rounded-xl transition-all flex items-start gap-2.5 group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-indigo-400 mt-0.5">
                  <FolderTree className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-100 group-hover:text-white">
                      工程关键文件深度分析
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">
                    解析 draft_info.json、Timelines/project.json 结构
                  </p>
                </div>
              </button>
            )}
          </div>

          <div className="border-t border-white/10" />

          {/* Section 2: Application & System Guides */}
          <div className="space-y-1">
            <div className="text-[10px] font-semibold text-zinc-400 px-2 py-0.5 uppercase tracking-wider">
              系统与运行环境
            </div>

            {/* 4. Mac Native App Install Guide */}
            {onOpenMacNativeAppModal && (
              <button
                id="btn-settings-mac-native-app"
                type="button"
                onClick={() => handleItemClick(onOpenMacNativeAppModal)}
                className="w-full text-left p-2 rounded-xl transition-all flex items-start gap-2.5 group cursor-pointer hover:bg-white/5"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-cyan-400 mt-0.5">
                  <Apple className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-100 group-hover:text-white">
                      安装 Mac 原生独立 App
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">
                    独立窗口运行，基于苹果 WebKit 纯净内核无弹窗
                  </p>
                </div>
              </button>
            )}

            {/* 5. Official Troubleshooting Guide */}
            {onOpenOfficialGuide && (
              <button
                id="btn-settings-official-guide"
                type="button"
                onClick={() => handleItemClick(onOpenOfficialGuide)}
                className="w-full text-left p-2 rounded-xl transition-all flex items-start gap-2.5 group cursor-pointer hover:bg-white/5"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-emerald-400 mt-0.5">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-100 group-hover:text-white">
                      剪映官方避坑排查手册
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">
                    草稿层级、双端路径规范、脱机排查与急救彩蛋
                  </p>
                </div>
              </button>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-1 border-t border-white/10 px-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>Mac 用户: {macUsername || 'mac'}</span>
            <span>Jianying V3 Pro</span>
          </div>
        </div>
      )}
    </div>
  );
};
