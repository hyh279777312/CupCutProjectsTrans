import React from 'react';
import { FolderUp, RefreshCw, Package } from 'lucide-react';
import { ProjectDraft } from '../types';
import { SettingsMenu } from './SettingsMenu';

interface HeaderBarProps {
  currentProject: ProjectDraft | null;
  onOpenDraftPicker: () => void;
  onOpenZipPicker?: () => void;
  onOpenKeyFilesModal?: () => void;
  onOpenOfficialGuide?: () => void;
  onOpenMacNativeAppModal?: () => void;
  onOpenBashModal?: () => void;
  onOpenSha256Report?: () => void;
  macUsername?: string;
  onChangeMacUsername?: (u: string) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentProject,
  onOpenDraftPicker,
  onOpenZipPicker,
  onOpenKeyFilesModal,
  onOpenOfficialGuide,
  onOpenMacNativeAppModal,
  onOpenBashModal,
  onOpenSha256Report,
  macUsername,
}) => {
  return (
    <header className="border-b border-white/10 bg-[#12141a]/95 backdrop-blur-md px-4 py-2.5 flex items-center justify-between shrink-0 select-none z-20">
      {/* App Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <img
            src="/app-icon.svg"
            alt="Jianying Packager App Icon"
            className="w-8 h-8 rounded-xl shadow-md border border-white/10"
            referrerPolicy="no-referrer"
          />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
              剪映工程打包工具
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30">
                V2 PRO
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Right Action Navigation */}
      <div className="flex items-center gap-2">
        {!currentProject ? (
          <div className="flex items-center gap-2">
            <button
              id="btn-select-draft-folder"
              onClick={onOpenDraftPicker}
              className="group relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 border border-indigo-300/40 transition-all cursor-pointer"
              title="选择剪映草稿文件夹（自动分析时间线与素材）"
            >
              <FolderUp className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" />
              <span>选择草稿文件夹</span>
            </button>
            {onOpenZipPicker && (
              <button
                type="button"
                id="btn-select-draft-zip"
                onClick={onOpenZipPicker}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/15 text-zinc-200 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                title="导入 .zip 草稿工程压缩包（免解压直接读取分析）"
              >
                <Package className="w-3.5 h-3.5 text-cyan-400" />
                <span>导入草稿 .zip</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDraftPicker}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              title="选择其他剪映草稿工程文件夹"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>更换文件夹</span>
            </button>
            {onOpenZipPicker && (
              <button
                onClick={onOpenZipPicker}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                title="更换其他草稿 .zip 压缩包"
              >
                <Package className="w-3.5 h-3.5 text-cyan-400" />
                <span>更换 .zip</span>
              </button>
            )}
          </div>
        )}

        {/* Unified Settings Icon & Menu */}
        <SettingsMenu
          currentProject={currentProject}
          onOpenBashModal={onOpenBashModal}
          onOpenSha256Report={onOpenSha256Report}
          onOpenMacNativeAppModal={onOpenMacNativeAppModal}
          onOpenOfficialGuide={onOpenOfficialGuide}
          onOpenKeyFilesModal={onOpenKeyFilesModal}
          macUsername={macUsername}
        />
      </div>
    </header>
  );
};
