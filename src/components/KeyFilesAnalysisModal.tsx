import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lock,
  FileCode,
  X,
  Layers,
  FolderTree,
  HardDrive,
  Copy,
  Check,
} from 'lucide-react';
import { KeyFileAnalysisItem, ProjectDraft } from '../types';
import { formatBytes } from '../utils/draftEngine';

interface KeyFilesAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectDraft | null;
}

export const KeyFilesAnalysisModal: React.FC<KeyFilesAnalysisModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !project) return null;

  const handleCopySummary = () => {
    const lines = [
      `=== 剪映草稿关键文件深度分析报告 ===`,
      `工程名称: ${project.name}`,
      `架构分类: ${project.diagnosis.architectureLabel}`,
      `剪映版本: ${project.version}`,
      `检测引擎: ${project.diagnosis.detectedEngineType}`,
      `时间线总长: ${project.durationSec.toFixed(1)}s`,
      `轨道数: ${project.tracks.length}`,
      `素材数: ${project.materials.length}`,
      ``,
      `[关键文件清单]`,
      ...project.keyFilesAnalysis.map(
        (k, i) =>
          `[${i + 1}] ${k.fileName} (${formatBytes(k.sizeBytes)}) - [${k.status.toUpperCase()}] ${k.details}`
      ),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#14161f] border border-white/15 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#191c26]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                剪映草稿关键文件深度分析矩阵
                <span className="text-[10px] text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded font-mono font-medium">
                  {project.diagnosis.architectureLabel.split(' ')[0]}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                全面接管分析 Timelines、draft_info 及全套 8+ 核心配置附件，破除对旧版 draft_content.json 的单一依赖
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制分析结果' : '复制分析明细'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Diagnosis Overview Banner */}
        <div className="px-5 py-3 bg-[#11131a] border-b border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg">
              <span className="text-[10px] text-zinc-400 block">剪映工程版本</span>
              <span className="font-mono font-semibold text-white">{project.version}</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg">
              <span className="text-[10px] text-zinc-400 block">架构分类</span>
              <span className="font-mono font-semibold text-cyan-300 truncate block">
                {project.diagnosis.architectureLabel.split(' ')[0]}
              </span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg">
              <span className="text-[10px] text-zinc-400 block">时间线轨道序列</span>
              <span className="font-mono font-semibold text-emerald-400">
                {project.timelines.length} 个序列 · {project.tracks.length} 条轨道
              </span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg">
              <span className="text-[10px] text-zinc-400 block">识别素材总数</span>
              <span className="font-mono font-semibold text-amber-300">{project.materials.length} 个资产</span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-300 mt-2.5 leading-relaxed bg-white/[0.03] p-2 rounded border border-white/5">
            {project.diagnosis.diagnosisMessage}
          </p>
        </div>

        {/* Key Files Table */}
        <div className="flex-1 p-5 overflow-y-auto bg-[#0c0d12]">
          {/* Architecture Concept Callout */}
          <div className="mb-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-start gap-2.5 text-xs text-indigo-200">
            <Layers className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-white block">
                现代剪映“去 draft_content.json”分布式架构深度洞察
              </span>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                新版剪映已解耦为多文件系统：
                <strong className="text-cyan-300 font-mono"> Timelines/project.json </strong>掌管时间线多序列轨道，
                <strong className="text-amber-300 font-mono"> draft_info.json </strong>记录素材绝对路径与工程比例，
                <strong className="text-purple-300 font-mono"> attachment_editing.json </strong>持久化关键帧调色，
                <strong className="text-emerald-300 font-mono"> draft_virtual_store.json </strong>缓存虚拟映射。
                全面聚焦分析并打包这批关键文件，才能确保草稿跨机拷贝 100% 还原。
              </p>
            </div>
          </div>

          <h4 className="text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>核心配置文件读取状态清单 ({project.keyFilesAnalysis.length} 个关键项)</span>
          </h4>

          <div className="space-y-2">
            {project.keyFilesAnalysis.map((file, idx) => {
              const categoryLabel =
                file.category === 'timelines'
                  ? '时间线总控'
                  : file.category === 'materials'
                  ? '素材库参数'
                  : file.category === 'metadata'
                  ? '草稿台账'
                  : file.category === 'attachments'
                  ? '扩展附件'
                  : file.category === 'virtual_store'
                  ? '虚拟存储池'
                  : file.category === 'resources'
                  ? '内部资源库'
                  : '排版/配置';

              const categoryBadgeColor =
                file.category === 'timelines'
                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                  : file.category === 'materials'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : file.category === 'metadata'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : file.category === 'attachments'
                  ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                  : file.category === 'virtual_store'
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                  : 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30';

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#14161f] border border-white/10 hover:border-white/20 transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      {file.status === 'parsed_ok' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : file.status === 'encrypted' ? (
                        <Lock className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-white text-xs">{file.fileName}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono border ${categoryBadgeColor}`}>
                          {categoryLabel}
                        </span>
                        {file.importance === 'core' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            核心必迁
                          </span>
                        )}
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                            file.status === 'parsed_ok'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : file.status === 'encrypted'
                              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {file.status === 'parsed_ok'
                            ? '已解析接管'
                            : file.status === 'encrypted'
                            ? '密文文件'
                            : '备用/警告'}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1">{file.details}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <span className="font-mono text-zinc-300 block text-xs">{formatBytes(file.sizeBytes)}</span>
                    <span className="text-[10px] text-zinc-500">文件体积</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Folder File Tree Preview */}
          {project.folderFiles && project.folderFiles.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/10">
              <h4 className="text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span>草稿目录全文件概览 (共 {project.folderFiles.length} 个文件/文件夹)</span>
              </h4>
              <div className="bg-[#10121a] border border-white/5 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1 font-mono text-[11px] text-zinc-400">
                {project.folderFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between hover:text-white py-0.5">
                    <span className="truncate max-w-[500px]">{f.relativePath}</span>
                    <span className="text-[10px] text-zinc-500 shrink-0 ml-2">{formatBytes(f.file.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
