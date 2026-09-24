import React, { useState, useMemo } from 'react';
import { MaterialItem } from '../types';
import {
  Film,
  Music,
  Image as ImageIcon,
  Type,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  ArrowDownRight,
  Sparkles,
  FolderOpen,
  UploadCloud,
  Lightbulb,
} from 'lucide-react';
import { formatBytes } from '../utils/draftEngine';

interface MaterialTableProps {
  materials: MaterialItem[];
  filterUsedOnly: boolean;
  onToggleFilterUsed: (val: boolean) => void;
  selectedMaterialId: string | null;
  onSelectMaterial: (id: string | null) => void;
  onLinkExternalMedia?: () => void;
  onSelectFiles?: () => void;
}

export const MaterialTable: React.FC<MaterialTableProps> = ({
  materials,
  filterUsedOnly,
  onToggleFilterUsed,
  selectedMaterialId,
  onSelectMaterial,
  onLinkExternalMedia,
  onSelectFiles,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'used' | 'waste' | 'video' | 'audio' | 'image' | 'font'>('all');

  const stats = useMemo(() => {
    const totalCount = materials.length;
    const usedMaterials = materials.filter((m) => m.isUsedOnTimeline);
    const wasteMaterials = materials.filter((m) => !m.isUsedOnTimeline);

    const totalBytes = materials.reduce((acc, m) => acc + m.sizeBytes, 0);
    const usedBytes = usedMaterials.reduce((acc, m) => acc + m.sizeBytes, 0);
    const wasteBytes = wasteMaterials.reduce((acc, m) => acc + m.sizeBytes, 0);

    const savedRatio = totalBytes > 0 ? (wasteBytes / totalBytes) * 100 : 0;

    return {
      totalCount,
      usedCount: usedMaterials.length,
      wasteCount: wasteMaterials.length,
      totalBytes,
      usedBytes,
      wasteBytes,
      savedRatio,
    };
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      if (filterUsedOnly && !m.isUsedOnTimeline) return false;

      if (activeTab === 'used' && !m.isUsedOnTimeline) return false;
      if (activeTab === 'waste' && m.isUsedOnTimeline) return false;
      if (activeTab === 'video' && m.type !== 'video') return false;
      if (activeTab === 'audio' && m.type !== 'audio') return false;
      if (activeTab === 'image' && m.type !== 'image') return false;
      if (activeTab === 'font' && m.type !== 'font') return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          m.name.toLowerCase().includes(term) ||
          m.originalPath.toLowerCase().includes(term) ||
          m.targetSubdir.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }, [materials, filterUsedOnly, activeTab, searchTerm]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Film className="w-3.5 h-3.5 text-blue-400" />;
      case 'audio':
        return <Music className="w-3.5 h-3.5 text-emerald-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-purple-400" />;
      case 'font':
        return <Type className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Film className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="bg-[#12141a]/90 rounded-xl border border-white/10 flex flex-col flex-1 min-h-0 overflow-hidden shadow-md">
      {/* Table Toolbar */}
      <div className="p-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-2.5 shrink-0 bg-white/[0.01]">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            全部素材 ({stats.totalCount})
          </button>
          <button
            onClick={() => setActiveTab('used')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'used'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-emerald-300 hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            时间线已使用 ({stats.usedCount})
          </button>
          <button
            onClick={() => setActiveTab('waste')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'waste'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-zinc-400 hover:text-rose-300 hover:bg-white/5'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            未上轨媒体 ({stats.wasteCount})
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Type filters */}
          <button
            onClick={() => setActiveTab('video')}
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              activeTab === 'video' ? 'bg-blue-500/20 text-blue-300' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            视频
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              activeTab === 'audio' ? 'bg-emerald-500/20 text-emerald-300' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            音频
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              activeTab === 'image' ? 'bg-purple-500/20 text-purple-300' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            图片
          </button>
          <button
            onClick={() => setActiveTab('font')}
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              activeTab === 'font' ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            字体
          </button>
        </div>

        {/* Search & Only Used Switcher */}
        <div className="flex items-center gap-2">
          {/* Quick Filter Toggle */}
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-colors">
            <input
              type="checkbox"
              checked={filterUsedOnly}
              onChange={(e) => onToggleFilterUsed(e.target.checked)}
              className="rounded accent-emerald-500 cursor-pointer w-3.5 h-3.5"
            />
            <span className="font-medium flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              仅显示时间线素材
            </span>
          </label>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索素材名/路径..."
              className="w-40 focus:w-52 transition-all bg-black/40 border border-white/10 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Materials Table List OR Guidance Banner when 0 materials */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {materials.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-start p-6 text-center max-w-2xl mx-auto overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-lg shadow-amber-500/5 mt-2">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
              <span>为什么未能直接解码源素材？</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-normal border border-amber-500/30">
                剪映 6.0+ AES 密文保护机制
              </span>
            </h3>

            <div className="text-xs text-zinc-300 leading-relaxed mb-4 max-w-xl text-left bg-black/40 border border-white/10 rounded-xl p-3.5 space-y-2 font-sans">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">1.</span>
                <span>
                  <strong className="text-white">剪映官方 AES-128 加密：</strong>
                  自剪映 6.0 起（包含 11.x、12.x），剪映将记录时间线轨道和原始素材路径的核心配置文件进行了强加密，任何第三方软件均无法强行解密。
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">2.</span>
                <span>
                  <strong className="text-white">素材外部存放机制：</strong>
                  剪映为了节省草稿文件夹体积，默认<strong className="text-amber-300">绝不复制视频原件</strong>到草稿中，你的几十 GB 源素材全部留在电脑的原始目录（如桌面、下载、移动硬盘等）。
                </span>
              </div>
            </div>

            {/* Two 100% Guaranteed Solutions for Non-Programmers */}
            <div className="w-full text-left space-y-3 mb-5">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-transparent border border-indigo-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                    <span className="text-xs font-bold text-white">彻底解决办法一：一键选择素材文件夹（最快，0编程）</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-mono">推荐方案</span>
                </div>
                <p className="text-[11px] text-zinc-400 mb-3">
                  只要直接指定您这批视频/音频平时存放在电脑哪个文件夹，系统将自动扫描秒级建立关联并自动上轨：
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {onLinkExternalMedia && (
                    <button
                      type="button"
                      onClick={onLinkExternalMedia}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 border border-indigo-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>一键选择素材所在文件夹 (自动扫描并智能上轨)</span>
                    </button>
                  )}
                  {onSelectFiles && (
                    <button
                      type="button"
                      onClick={onSelectFiles}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-medium border border-white/10 transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                      <span>或选择单个音视频文件</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-white/20 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                  <span className="text-xs font-bold text-white">彻底解决办法二：在剪映中“另存草稿 (勾选拷贝素材)”</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  在 Mac 剪映中打开当前工程 ➔ 点击顶部菜单「<strong className="text-zinc-200">文件</strong>」➔「<strong className="text-zinc-200">草稿另存为...</strong>」➔ 勾选「<strong className="text-amber-300">拷贝素材到草稿</strong>」导出；或者在剪映右上角点击「<strong className="text-zinc-200">导出</strong>」➔「<strong className="text-zinc-200">导出草稿包</strong>」。导出的文件夹素材完全内嵌，拖入本工具即可 100% 完全识别！
                </p>
              </div>
            </div>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">未找到符合当前筛选条件的素材</div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#161820] text-zinc-400 text-[11px] font-medium border-b border-white/10 z-10">
              <tr>
                <th className="py-2 px-3">素材状态</th>
                <th className="py-2 px-3">素材文件名称 / 原始路径</th>
                <th className="py-2 px-3">V2PRO 归档结构子目录</th>
                <th className="py-2 px-3">时间线轨道与引用</th>
                <th className="py-2 px-3 text-right">文件体积</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMaterials.map((mat) => {
                const isSelected = selectedMaterialId === mat.id;
                return (
                  <tr
                    key={mat.id}
                    onClick={() => onSelectMaterial(isSelected ? null : mat.id)}
                    className={`hover:bg-white/[0.04] transition-colors cursor-pointer group ${
                      isSelected ? 'bg-indigo-500/15' : ''
                    }`}
                  >
                    {/* Status */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      {mat.isUsedOnTimeline ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          <CheckCircle2 className="w-3 h-3" />
                          时间线已使用
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-500/15 text-zinc-400 border border-zinc-500/25">
                          未上轨素材
                        </span>
                      )}
                    </td>

                    {/* Name & Original Path */}
                    <td className="py-2 px-3 max-w-[280px]">
                      <div className="flex items-center gap-2">
                        <div className="shrink-0 p-1 rounded bg-white/5 border border-white/5">
                          {getTypeIcon(mat.type)}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-medium text-zinc-100 truncate group-hover:text-white flex items-center gap-1.5">
                            <span>{mat.name}</span>
                            {mat.realFile ? (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-medium">
                                本地实体已就绪
                              </span>
                            ) : (
                              <span
                                className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25 font-mono font-medium"
                                title="位于剪映工程外部路径，可在 05_NOTES/MISSING_MEDIA.txt 查看或用终端脚本拷贝"
                              >
                                外部路径
                              </span>
                            )}
                            {mat.resolution && (
                              <span className="text-[9px] px-1 rounded bg-white/10 text-zinc-400 font-mono">
                                {mat.resolution}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate mono-code font-light">
                            {mat.originalPath}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Target Subdirectory */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-indigo-300 font-mono text-[11px]">
                        <ArrowDownRight className="w-3 h-3 text-zinc-500" />
                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
                          {mat.targetSubdir}/
                        </span>
                      </div>
                    </td>

                    {/* Tracks & Usage Count */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      {mat.isUsedOnTimeline ? (
                        <div className="flex items-center gap-1">
                          {mat.timelineTracks.map((tr, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-mono"
                            >
                              {tr === 'main_video'
                                ? 'V1主轨'
                                : tr === 'pip'
                                ? 'V2画中画'
                                : tr === 'audio'
                                ? 'A1音轨'
                                : tr === 'sfx'
                                ? 'A2音效'
                                : 'T1字幕'}
                            </span>
                          ))}
                          <span className="text-[10px] text-zinc-400 ml-1">
                            × {mat.timelineUsageCount} 次
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-500 italic">未在时间线使用</span>
                      )}
                    </td>

                    {/* Size */}
                    <td className="py-2 px-3 text-right whitespace-nowrap font-mono text-zinc-300">
                      <span className={mat.isUsedOnTimeline ? 'text-zinc-200' : 'text-zinc-500'}>
                        {formatBytes(mat.sizeBytes)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary Footer */}
      <div className="px-3 py-2 border-t border-white/10 bg-[#161820] flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-4 text-zinc-400">
          <span>
            当前显示: <strong className="text-zinc-200">{filteredMaterials.length}</strong> / {materials.length} 个素材
          </span>
          <span className="h-3 w-px bg-white/10" />
          <span>
            工程全部素材: <strong className="text-zinc-200 font-mono">{formatBytes(stats.totalBytes)}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-400">时间线已使用:</span>
          <span className="text-emerald-400 font-mono font-semibold">{formatBytes(stats.usedBytes)}</span>
          {stats.wasteCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-medium border border-emerald-500/30">
              节约 {stats.savedRatio.toFixed(1)}% ({formatBytes(stats.wasteBytes)} 冗余)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
