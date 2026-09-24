export type DraftVersion = '11.5.0' | '10.x' | 'cross_platform';

export type MaterialType = 'video' | 'audio' | 'image' | 'font';

export type TrackType = 'main_video' | 'pip' | 'audio' | 'sfx' | 'text' | 'compound';

export type DraftArchitectureType =
  | 'type_a_plain' // A. 可直接读取的明文工程 (传统 draft_content.json 或普通 JSON)
  | 'type_b_encrypted' // B. 加密工程 (存在 AES 密文且无法解析出有效 schema)
  | 'type_c_mac_timelines' // C. 新版 Mac draft_info + Timelines 结构
  | 'type_d_unknown'; // D. 其他未知结构

export interface DraftDiagnosis {
  architecture: DraftArchitectureType;
  architectureLabel: string;
  jianyingVersion: string;
  detectedEngineType: string;
  keyFilesFound: string[];
  isEncrypted: boolean;
  canExtractMedia: boolean;
  diagnosisMessage: string;
  preventedFakePack?: boolean;
}

export interface KeyFileAnalysisItem {
  fileName: string;
  category?: 'timelines' | 'materials' | 'metadata' | 'attachments' | 'virtual_store' | 'layout_config' | 'resources';
  status: 'parsed_ok' | 'encrypted' | 'binary' | 'warning';
  sizeBytes: number;
  details: string;
  importance?: 'core' | 'important' | 'supporting';
}

export interface TimelineSegment {
  id: string;
  materialId: string;
  startSec: number;
  durationSec: number;
  label: string;
  sourceStartSec: number;
}

export interface TimelineTrack {
  id: string;
  type: TrackType;
  name: string;
  color: string;
  segments: TimelineSegment[];
}

export interface TimelineItem {
  id: string;
  name: string;
  folderName?: string;
  isMain: boolean;
  durationSec: number;
  tracks: TimelineTrack[];
  materialIds: string[];
}

export interface MaterialItem {
  id: string;
  name: string;
  type: MaterialType;
  originalPath: string;
  targetSubdir: string; // '02_MEDIA/VIDEO' | '02_MEDIA/AUDIO' | etc.
  targetRelativePath: string;
  sizeBytes: number;
  durationSec?: number;
  resolution?: string;
  format?: string;
  isUsedOnTimeline: boolean;
  timelineUsageCount: number;
  timelineTracks: TrackType[];
  sha256Checksum: string;
  sampleContent?: string;
  realFile?: File; // Real local file if loaded from folder or linked
  fileHandle?: FileSystemFileHandle; // Real file system handle
  isMissing?: boolean;
}

export interface FolderFileEntry {
  relativePath: string;
  file: File;
  handle?: FileSystemFileHandle;
}

export interface ProjectDraft {
  id: string;
  name: string;
  version: string;
  compatTier: DraftVersion;
  lastModified: string;
  fps: number;
  durationSec: number;
  resolution: string;
  materials: MaterialItem[];
  tracks: TimelineTrack[];
  timelines: TimelineItem[];
  activeTimelineId: string;
  rawDraftJson?: any;
  draftRootPath: string;
  isRealLocalFolder?: boolean;
  isEncrypted?: boolean;
  encryptionNote?: string;
  folderFiles?: FolderFileEntry[];
  directoryHandle?: FileSystemDirectoryHandle;
  diagnosis: DraftDiagnosis;
  keyFilesAnalysis: KeyFileAnalysisItem[];
}

export interface PackagingConfig {
  exportSpec: DraftVersion;
  exportMode: 'used_only' | 'all_materials'; // 'used_only' 仅时间线使用素材 | 'all_materials' 全部素材
  onlyUsedMaterials?: boolean; // Convenience flag synced with exportMode === 'used_only'
  targetDirectory: string;
  createSubdirs: boolean;
  generateBashScript: boolean;
  sha256Verify: boolean;
  selectedTimelineId: string; // 'all' or specific timeline id
  macUsername?: string;
}

export interface PackagingProgress {
  status: 'idle' | 'analyzing' | 'packing' | 'verifying' | 'completed' | 'error';
  progressPercent: number;
  currentFile: string;
  currentPhase: string;
  speedMBps: number;
  bytesTransferred: number;
  totalBytes: number;
  timeElapsedSec: number;
  etaSec: number;
  sha256Results: {
    fileName: string;
    targetPath: string;
    hash: string;
    verified: boolean;
    status: 'passed' | 'failed';
  }[];
  offlineRedBarRate: number; // 0%
  completedAt?: string;
  packageFolderPath?: string;
  copiedMediaCount?: number;
  missingMediaCount?: number;
  packageReportText?: string;
  packageInfoJson?: string;
  installerCommandText?: string;
  copiedMediaList?: string[];
  missingMediaList?: string[];
  sha256SumsText?: string;
}

