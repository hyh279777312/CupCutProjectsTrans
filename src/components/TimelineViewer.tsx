import React, { useState } from 'react';
import { TimelineTrack, MaterialItem, TimelineItem } from '../types';
import { Film, Layers, Music, Volume2, Type, Clock, CheckCircle2 } from 'lucide-react';
import { formatTime } from '../utils/draftEngine';

interface TimelineViewerProps {
  tracks: TimelineTrack[];
  materials: MaterialItem[];
  timelines?: TimelineItem[];
  activeTimelineId?: string;
  onSelectTimeline?: (id: string) => void;
  totalDurationSec: number;
  highlightMaterialId?: string | null;
  onSelectMaterial?: (materialId: string) => void;
}

export const TimelineViewer: React.FC<TimelineViewerProps> = ({
  tracks,
  materials,
  timelines = [],
  activeTimelineId = 'main_timeline',
  onSelectTimeline,
  totalDurationSec,
  highlightMaterialId,
  onSelectMaterial,
}) => {
  const [hoveredSeg, setHoveredSeg] = useState<{
    label: string;
    duration: number;
    start: number;
    materialName: string;
  } | null>(null);

  const tracksMaxSec = tracks.reduce(
    (max, t) =>
      Math.max(
        max,
        (t.segments || []).reduce(
          (sMax, s) => Math.max(sMax, (s.startSec || 0) + (s.durationSec || 0)),
          0
        )
      ),
    0
  );
  const duration = Math.max(30, tracksMaxSec, totalDurationSec || 0);

  const getTrackIcon = (type: string) => {
    switch (type) {
      case 'main_video':
        return <Film className="w-3.5 h-3.5 text-blue-400" />;
      case 'pip':
        return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      case 'audio':
        return <Music className="w-3.5 h-3.5 text-emerald-400" />;
      case 'sfx':
        return <Volume2 className="w-3.5 h-3.5 text-cyan-400" />;
      case 'text':
        return <Type className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Film className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  // Generate time markers
  const markers = [0, 0.2, 0.4, 0.6, 0.8, 1.0].map((ratio) => ({
    sec: ratio * duration,
    pct: ratio * 100,
  }));

  return (
    <div className="bg-[#12141a]/90 rounded-xl border border-white/10 p-3 flex flex-col gap-2 shadow-md">
      {/* Timeline Header with Sequence Switcher */}
      <div className="flex flex-wrap items-center justify-between text-xs pb-1.5 border-b border-white/5 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            时间线轨道与序列审查
          </span>
          <span className="text-[10px] text-zinc-400 font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
            {tracks.length} 条音画字幕轨道
          </span>
        </div>

        {/* Timeline Switcher Tabs if multiple timelines exist */}
        {timelines.length > 0 && (
          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
            <button
              type="button"
              onClick={() => onSelectTimeline && onSelectTimeline('all')}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-all cursor-pointer ${
                activeTimelineId === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              全部序列 ({timelines.length})
            </button>
            {timelines.map((tl) => (
              <button
                key={tl.id}
                type="button"
                onClick={() => onSelectTimeline && onSelectTimeline(tl.id)}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-all truncate max-w-[140px] cursor-pointer ${
                  activeTimelineId === tl.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
                title={tl.name}
              >
                {tl.isMain ? '主时间线' : tl.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 text-[11px] text-zinc-400">
          {hoveredSeg ? (
            <span className="text-cyan-300 font-mono truncate max-w-[320px]">
              [{hoveredSeg.label}] {formatTime(hoveredSeg.start)} - {formatTime(hoveredSeg.start + hoveredSeg.duration)} (
              {hoveredSeg.duration.toFixed(1)}s)
            </span>
          ) : (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span className="font-mono text-zinc-300">时长: {formatTime(totalDurationSec)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Time Scale Bar */}
      <div className="relative h-4 bg-black/40 rounded border border-white/5 px-2 flex items-center">
        <div className="w-28 shrink-0 text-[10px] text-zinc-400 font-mono">轨道 / 时间轴</div>
        <div className="relative flex-1 h-full">
          {markers.map((m, idx) => (
            <div
              key={idx}
              className="absolute top-0 bottom-0 flex flex-col justify-between"
              style={{ left: `${m.pct}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-px h-1 bg-white/20 mx-auto" />
              <span className="text-[9px] font-mono text-zinc-400 leading-none">
                {formatTime(m.sec)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tracks Container */}
      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
        {tracks.length === 0 || !tracks.some((t) => t.segments && t.segments.length > 0) ? (
          <div className="py-3 px-2 text-center text-[11px] text-zinc-400 bg-black/20 rounded border border-white/5">
            时间线轨道暂未读取到片段。可点击右上角“关联素材文件夹”或拖入媒体文件自动绑定。
          </div>
        ) : (
          tracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-2 h-7 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg px-2 border border-white/5 transition-colors group"
            >
              {/* Track Label */}
              <div className="w-28 shrink-0 flex items-center gap-1.5 overflow-hidden">
                {getTrackIcon(track.type)}
                <span className="text-[11px] font-medium text-zinc-300 truncate">
                  {track.name}
                </span>
              </div>

              {/* Track Timeline Area */}
              <div className="relative flex-1 h-5 bg-black/50 rounded overflow-hidden border border-white/[0.06]">
                {track.segments.map((seg) => {
                  const leftPct = (seg.startSec / duration) * 100;
                  const widthPct = Math.max(1.8, (seg.durationSec / duration) * 100);
                  const mat = materials.find((m) => m.id === seg.materialId);
                  const isHighlighted = highlightMaterialId && seg.materialId === highlightMaterialId;

                  return (
                    <div
                      key={seg.id}
                      onClick={() => onSelectMaterial && onSelectMaterial(seg.materialId)}
                      onMouseEnter={() =>
                        setHoveredSeg({
                          label: seg.label,
                          duration: seg.durationSec,
                          start: seg.startSec,
                          materialName: mat?.name || seg.materialId,
                        })
                      }
                      onMouseLeave={() => setHoveredSeg(null)}
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        backgroundColor: track.color + '40',
                        borderColor: isHighlighted ? '#ffffff' : track.color,
                      }}
                      className={`absolute top-0.5 bottom-0.5 rounded border px-1 flex items-center justify-between cursor-pointer transition-all duration-150 overflow-hidden ${
                        isHighlighted ? 'ring-2 ring-white z-10 brightness-125' : 'hover:brightness-125'
                      }`}
                    >
                      <span className="text-[9px] font-medium text-white/90 truncate leading-none">
                        {seg.label}
                      </span>
                      <span className="text-[8px] font-mono text-white/60 shrink-0 ml-1 hidden sm:inline">
                        {seg.durationSec.toFixed(1)}s
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
