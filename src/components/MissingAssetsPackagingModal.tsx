import React, { useState } from 'react';
import {
  AlertTriangle,
  FolderOpen,
  Terminal,
  Download,
  X,
  Check,
  Copy,
  ArrowRight,
  ShieldCheck,
  FileVideo,
  FileAudio,
} from 'lucide-react';
import { MaterialItem, PackagingConfig, ProjectDraft } from '../types';
import { formatBytes } from '../utils/draftEngine';

interface MissingAssetsPackagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectDraft;
  config: PackagingConfig;
  missingMaterials: MaterialItem[];
  onLinkFolder: () => void;
  onOpenBashModal: () => void;
  onProceedLightweightZip: () => void;
}

export const MissingAssetsPackagingModal: React.FC<MissingAssetsPackagingModalProps> = ({
  isOpen,
  onClose,
  project,
  config,
  missingMaterials,
  onLinkFolder,
  onOpenBashModal,
  onProceedLightweightZip,
}) => {
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const videoCount = missingMaterials.filter((m) => m.type === 'video').length;
  const audioCount = missingMaterials.filter((m) => m.type === 'audio').length;
  const otherCount = missingMaterials.length - videoCount - audioCount;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#141620] border border-white/15 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                检测到 {missingMaterials.length} 个素材位于草稿外部绝对路径
              </h3>
              <p className="text-[11px] text-zinc-400">
                剪映未将音视频原件复制入草稿内部，而是记录了 Mac 本地绝对路径
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Summary Banner */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
            <div className="text-amber-300 space-y-1">
              <div className="font-semibold text-amber-200">
                时间线上有 {videoCount > 0 ? `${videoCount} 个视频 ` : ''}
                {audioCount > 0 ? `${audioCount} 个音频 ` : ''}
                {otherCount > 0 ? `${otherCount} 个其他素材` : ''} 待拷贝
              </div>
              <div className="text-[11px] text-amber-300/80 leading-relaxed">
                受 macOS 沙箱机制保护，直接在网页中拷贝需先通过访达授权素材目录，或者通过系统终端脚本一键完成秒拷：
              </div>
            </div>
          </div>

          {/* List of sample missing items */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-medium text-zinc-300 flex items-center justify-between">
              <span>时间线引用的原始文件路径清单 (前 4 项):</span>
              <span className="text-[10px] text-zinc-500 font-mono">共 {missingMaterials.length} 项</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto bg-black/40 p-2 rounded-xl border border-white/5 font-mono text-[10px]">
              {missingMaterials.slice(0, 4).map((m, idx) => (
                <div key={idx} className="text-zinc-300 flex items-center justify-between py-0.5">
                  <span className="truncate max-w-[450px]">{m.originalPath}</span>
                  <span className="text-zinc-500 shrink-0 ml-2">{formatBytes(m.sizeBytes)}</span>
                </div>
              ))}
              {missingMaterials.length > 4 && (
                <div className="text-zinc-500 text-[10px] pt-1">
                  ... 以及另外 {missingMaterials.length - 4} 个媒体文件
                </div>
              )}
            </div>
          </div>

          {/* 3 Practical Solutions */}
          <div className="space-y-2.5 pt-1">
            <div className="font-semibold text-zinc-200 text-xs">请选择处理方式：</div>

            {/* Option A: Link Folder */}
            <div className="p-3 rounded-xl bg-[#1a1d28] border border-white/10 hover:border-indigo-500/40 transition-colors flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-indigo-400" />
                  <span>方式 1: 关联素材所在的文件夹 (最推荐)</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                    零命令行
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  点击授权素材所在的文件夹（如 Movies 或外置硬盘），即可直接将文件直接拷贝入 02_MEDIA 目录。
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLinkFolder();
                }}
                className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-sm cursor-pointer"
              >
                <span>关联文件夹</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Option B: Terminal Command Script */}
            <div className="p-3 rounded-xl bg-[#1a1d28] border border-white/10 hover:border-emerald-500/40 transition-colors flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>方式 2: 使用 pack_v2pro.command 终端脚本</span>
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                    原生 rsync 秒级
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  自动生成针对 Mac 的 .command 执行脚本，直接在 macOS Terminal 中读取任意系统绝对路径并创建 01_PROJECT + 02_MEDIA + 05_NOTES。
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenBashModal}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-sm cursor-pointer"
              >
                <span>打开脚本</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Option C: Direct Directory Packaging (with Notes) */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-colors flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>方式 3: 先行直接生成目录 (在 05_NOTES/ 生成清单)</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  先完成 01_PROJECT 复制与 05_NOTES 报告生成，外部素材路径将完整记录在 MISSING_MEDIA.txt 中。
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onProceedLightweightZip();
                }}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white font-medium text-xs transition-colors shrink-0 cursor-pointer"
              >
                <span>继续落盘</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-500">
          <span>建议优先点击【关联文件夹】授权读取原素材</span>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
};
