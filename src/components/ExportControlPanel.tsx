import React, { useState, useRef } from 'react';
import {
  Folder,
  FolderOpen,
  CheckCircle2,
  Terminal,
  Settings2,
  ShieldCheck,
  Copy,
  FileCode2,
  Zap,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  FolderTree,
  Lock,
  Layers,
  FileText,
} from 'lucide-react';
import { PackagingConfig, PackagingProgress, ProjectDraft } from '../types';
import { formatBytes } from '../utils/draftEngine';

interface ExportControlPanelProps {
  project: ProjectDraft | null;
  config: PackagingConfig;
  onChangeConfig: (newConfig: PackagingConfig) => void;
  targetDirHandle: FileSystemDirectoryHandle | null;
  targetDirName: string | null;
  onSelectTargetDirHandle: (handle: FileSystemDirectoryHandle | null, name: string | null) => void;
  onStartPacking: () => void;
  onOpenBashModal: () => void;
  onOpenKeyFilesModal: () => void;
  onOpenSha256Report?: () => void;
  progress: PackagingProgress;
}

export const ExportControlPanel: React.FC<ExportControlPanelProps> = ({
  project,
  config,
  onChangeConfig,
  targetDirHandle,
  targetDirName,
  onSelectTargetDirHandle,
  onStartPacking,
  onOpenBashModal,
  onOpenKeyFilesModal,
  onOpenSha256Report,
  progress,
}) => {
  const [copiedQuickPath, setCopiedQuickPath] = useState(false);
  const directoryInputRef = useRef<HTMLInputElement>(null);

  const handleBrowseLocalDirectory = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
        });
        if (dirHandle && dirHandle.name) {
          onSelectTargetDirHandle(dirHandle, dirHandle.name);
          onChangeConfig({ ...config, targetDirectory: `~/Desktop/${dirHandle.name}` });
        }
      } else {
        directoryInputRef.current?.click();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        directoryInputRef.current?.click();
      }
    }
  };

  const handleFallbackDirectorySelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const firstFile = files[0];
      const relPath = firstFile.webkitRelativePath || '';
      const folderName = relPath.split('/')[0] || 'Selected_Output';
      onSelectTargetDirHandle(null, folderName);
      onChangeConfig({ ...config, targetDirectory: `~/Desktop/${folderName}` });
    }
  };

  const selectedMaterials = project
    ? config.exportMode === 'used_only'
      ? project.materials.filter((m) => m.isUsedOnTimeline)
      : project.materials
    : [];

  const totalRawBytes = project ? project.materials.reduce((a, b) => a + b.sizeBytes, 0) : 0;
  const finalBytes = selectedMaterials.reduce((a, b) => a + b.sizeBytes, 0);
  const savedBytes = Math.max(0, totalRawBytes - finalBytes);
  const savedRatio = totalRawBytes > 0 ? (savedBytes / totalRawBytes) * 100 : 0;

  const readyFilesCount = selectedMaterials.filter((m) => m.realFile).length;
  const missingFilesCount = selectedMaterials.filter((m) => !m.realFile).length;

  const isEncryptedUnreadable = project?.diagnosis.architecture === 'type_b_encrypted';

  return (
    <div className="w-[320px] md:w-[340px] lg:w-[360px] h-full shrink-0 bg-[#12141a]/95 rounded-xl border border-white/10 p-3 flex flex-col justify-between overflow-hidden shadow-xl text-zinc-100">
      <div className="space-y-2.5 overflow-y-auto pr-1 min-h-0 flex-1">
        {/* Module Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-xs text-white">V3 跨机迁移控制台</span>
          </div>
          <button
            type="button"
            onClick={onOpenKeyFilesModal}
            disabled={!project}
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono transition-colors disabled:opacity-40 cursor-pointer"
            title="查看 draft_info.json、Timelines/project.json 深度解析明细"
          >
            <FolderTree className="w-3 h-3" />
            <span>关键文件分析</span>
          </button>
        </div>

        {/* 1. Architecture Diagnosis Alert or Status */}
        {project && (
          <div
            className={`p-2.5 rounded-xl border text-xs ${
              isEncryptedUnreadable
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                : 'bg-indigo-950/30 border-indigo-500/30 text-zinc-200'
            }`}
          >
            <div className="flex items-center justify-between font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-xs">
                {isEncryptedUnreadable ? (
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                )}
                草稿架构诊断
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10">
                {project.diagnosis.architectureLabel.split(' ')[0]}
              </span>
            </div>

            {isEncryptedUnreadable ? (
              <div className="space-y-1 font-mono text-[11px] text-rose-300">
                <p>当前剪映版本：{project.diagnosis.jianyingVersion}</p>
                <p>工程：{project.name}</p>
                <p>草稿：AES 加密</p>
                <p className="text-amber-300">时间线素材：无法直接读取，因此没有执行“假打包”</p>
              </div>
            ) : (
              <p className="text-[11px] text-zinc-300 leading-snug">
                {project.diagnosis.diagnosisMessage}
              </p>
            )}
          </div>
        )}

        {/* 2. Packaging Mode Selection: Used Materials vs All Materials */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300 block">
            <span>打包范围模式</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => onChangeConfig({ ...config, exportMode: 'used_only' })}
              className={`py-2 px-2.5 rounded-lg text-[11px] font-medium text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                config.exportMode === 'used_only'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                仅打包已使用素材
              </span>
              <span className="text-[9px] opacity-80 leading-none">排除库中未上轨废料 (推荐)</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeConfig({ ...config, exportMode: 'all_materials' })}
              className={`py-2 px-2.5 rounded-lg text-[11px] font-medium text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                config.exportMode === 'all_materials'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <span className="font-bold flex items-center gap-1">
                <Folder className="w-3 h-3 text-blue-300" />
                打包全部素材
              </span>
              <span className="text-[9px] opacity-80 leading-none">已使用 + 未使用全部归档</span>
            </button>
          </div>
        </div>

        {/* 3. Sequence / Timeline Scope Selection */}
        {project && project.timelines && project.timelines.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                目标时间线序列
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {project.timelines.length} 个序列可用
              </span>
            </label>
            <select
              value={config.selectedTimelineId}
              onChange={(e) => onChangeConfig({ ...config, selectedTimelineId: e.target.value })}
              className="w-full bg-[#12141a] border border-white/15 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none cursor-pointer"
            >
              <option value="all">全部时间线序列 (打包所有序列使用的素材)</option>
              {project.timelines.map((tl) => (
                <option key={tl.id} value={tl.id}>
                  {tl.name} ({tl.tracks.length} 轨道)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 4. Material Readiness Card */}
        <div className="p-2 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-200 flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              素材状态与目录规范
            </span>
            {project && (
              <span
                className={`text-[9px] font-mono font-medium px-1.5 py-0.2 rounded border ${
                  missingFilesCount === 0
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}
              >
                {missingFilesCount === 0 ? '全部就绪' : `${missingFilesCount} 个待关联/脚本秒拷`}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="bg-white/[0.03] p-1.5 rounded border border-white/5">
              <span className="text-zinc-400 block text-[9px]">纳入素材</span>
              <span className="font-mono font-bold text-emerald-400 text-xs">{selectedMaterials.length} 个</span>
            </div>
            <div className="bg-white/[0.03] p-1.5 rounded border border-white/5">
              <span className="text-zinc-400 block text-[9px]">预估体积</span>
              <span className="font-mono font-bold text-zinc-200 text-xs">{formatBytes(finalBytes)}</span>
            </div>
          </div>

          {/* Target Directory Structure Preview */}
          <div className="bg-[#0e1017] p-1.5 rounded-lg border border-white/5 font-mono text-[9.5px] text-zinc-400 space-y-0.5 leading-tight">
            <div className="text-cyan-300 font-bold truncate">
              {project ? `${project.name}_JianyingPackage/` : '项目_JianyingPackage/'}
            </div>
            <div className="text-amber-300">├── PACKAGE_INFO.json</div>
            <div className="text-cyan-400 font-semibold">├── 安装剪映工程.command (⭐️ 新电脑一键入库)</div>
            <div className="text-zinc-400">├── 01_PROJECT/ (剪映原始草稿)</div>
            <div className="text-emerald-400">├── 02_MEDIA/ (VIDEO, AUDIO, IMAGE)</div>
            <div className="text-indigo-400">└── 05_REPORT/ (归档报告与哈希)</div>
          </div>
        </div>

        {/* 5. Output Destination Directory */}
        <div className="space-y-1 p-2 rounded-xl bg-black/40 border border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-zinc-200 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-indigo-400" />
              <span>本地保存输出目标目录</span>
            </label>
            {targetDirName ? (
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                已指定: {targetDirName}
              </span>
            ) : (
              <span className="text-[10px] text-zinc-400 font-mono">访达点选 / 自动生成</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={config.targetDirectory}
                onChange={(e) => {
                  onChangeConfig({ ...config, targetDirectory: e.target.value });
                  if (targetDirName && !e.target.value.includes(targetDirName)) {
                    onSelectTargetDirHandle(null, null);
                  }
                }}
                className="w-full bg-[#12141a] border border-white/15 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none"
                placeholder="选择或输入本地保存根目录..."
              />
            </div>

            <button
              type="button"
              onClick={handleBrowseLocalDirectory}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1.5 shrink-0 shadow-sm border border-indigo-400/30 cursor-pointer"
              title="在访达中选择目标文件夹"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>浏览...</span>
            </button>

            <input
              ref={directoryInputRef}
              type="file"
              // @ts-ignore
              webkitdirectory=""
              directory=""
              className="hidden"
              onChange={handleFallbackDirectorySelected}
            />
          </div>
        </div>

        {/* Progress & Speed Monitoring Area (When Active) */}
        {(progress.status === 'packing' ||
          progress.status === 'analyzing' ||
          progress.status === 'verifying' ||
          progress.status === 'completed') && (
          <div className="p-3 rounded-xl bg-black/50 border border-indigo-500/30 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-indigo-300 flex items-center gap-1.5">
                {progress.status === 'completed' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                )}
                {progress.currentPhase}
              </span>
              <span className="font-mono font-bold text-white text-xs">
                {progress.progressPercent}%
              </span>
            </div>

            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-400 transition-all duration-200"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-zinc-400 font-mono">
              <div className="bg-white/5 p-1 rounded">
                <span className="block text-[9px] text-zinc-500">传输速率</span>
                <span className="text-cyan-300 font-semibold">{progress.speedMBps} MB/s</span>
              </div>
              <div className="bg-white/5 p-1 rounded">
                <span className="block text-[9px] text-zinc-500">已传输</span>
                <span className="text-zinc-200 font-semibold">{formatBytes(progress.bytesTransferred)}</span>
              </div>
              <div className="bg-white/5 p-1 rounded">
                <span className="block text-[9px] text-zinc-500">状态</span>
                <span className="text-emerald-300 font-semibold">非ZIP直接落盘</span>
              </div>
            </div>

            {progress.status === 'completed' && (
              <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onOpenSha256Report}
                  className="flex items-center gap-1 hover:underline text-left cursor-pointer"
                  title="点击查看 05_REPORT 报告与完整性核验证书"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>已生成迁移包与【安装剪映工程.command】 [查看报告]</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Action Triggers */}
      <div className="space-y-2 pt-3 border-t border-white/10 shrink-0">
        <button
          onClick={onStartPacking}
          disabled={
            !project ||
            isEncryptedUnreadable ||
            progress.status === 'packing' ||
            progress.status === 'analyzing' ||
            progress.status === 'verifying'
          }
          className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
            !project || isEncryptedUnreadable
              ? 'bg-white/5 border border-white/10 text-zinc-500 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 active:scale-[0.99] text-white shadow-lg shadow-indigo-500/20 cursor-pointer'
          }`}
        >
          <Zap className={`w-4 h-4 ${!project ? 'text-zinc-500' : 'text-amber-300 fill-amber-300'}`} />
          <span>
            {isEncryptedUnreadable
              ? '草稿加密无法直接读取 (杜绝假打包)'
              : project
              ? '一键生成 V3 跨机迁移包 (内置新机安装器)'
              : '请先载入剪映草稿工程'}
          </span>
        </button>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 pt-0.5">
          <span className="text-[10px] text-zinc-500 font-mono">
            {project ? '已就绪 · 非ZIP物理秒拷' : '等待载入草稿'}
          </span>
          <span className="text-[10px] text-zinc-500">
            高级脚本与报告已收纳至右上角 ⚙️
          </span>
        </div>
      </div>
    </div>
  );
};
