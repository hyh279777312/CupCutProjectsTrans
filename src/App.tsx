import React, { useState, useRef, useMemo } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { TimelineViewer } from './components/TimelineViewer';
import { MaterialTable } from './components/MaterialTable';
import { ExportControlPanel } from './components/ExportControlPanel';
import { BashScriptModal } from './components/BashScriptModal';
import { Sha256ReportModal } from './components/Sha256ReportModal';
import { KeyFilesAnalysisModal } from './components/KeyFilesAnalysisModal';
import { MissingAssetsPackagingModal } from './components/MissingAssetsPackagingModal';
import { OfficialGuideModal } from './components/OfficialGuideModal';
import { MacNativeAppModal } from './components/MacNativeAppModal';
import {
  FolderFileEntry,
  MaterialItem,
  PackagingConfig,
  PackagingProgress,
  ProjectDraft,
} from './types';
import {
  diagnoseAndParseJianyingFolder,
  runLocalDirectoryPackaging,
  generatePackV2ProCommandScript,
  addOrLinkExternalFilesToProject,
  ensureProjectTracksAndSegments,
  parseDraftZipFile,
  formatBytes,
} from './utils/draftEngine';
import {
  CheckCircle2,
  AlertCircle,
  Folder,
  FolderUp,
  FolderOpen,
  Sparkles,
  ShieldCheck,
  Film,
  Lock,
  Loader2,
  X,
  HardDrive,
  FolderTree,
  Terminal,
  Package,
} from 'lucide-react';

export default function App() {
  const [currentProject, setCurrentProject] = useState<ProjectDraft | null>(null);
  const [filterUsedOnly, setFilterUsedOnly] = useState(true);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [activeTimelineId, setActiveTimelineId] = useState<string>('all');
  const [macUsername, setMacUsername] = useState<string>('hyh');

  // Folder loading states
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const externalMediaInputRef = useRef<HTMLInputElement>(null);
  const externalFilesInputRef = useRef<HTMLInputElement>(null);

  // Configuration state
  const [config, setConfig] = useState<PackagingConfig>({
    exportSpec: '11.5.0',
    exportMode: 'used_only',
    selectedTimelineId: 'all',
    onlyUsedMaterials: true,
    targetDirectory: '~/Desktop/Jianying_Packaged_V2',
    createSubdirs: true,
    generateBashScript: true,
    sha256Verify: true,
  });

  // Packaging progress state
  const [targetDirHandle, setTargetDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [targetDirName, setTargetDirName] = useState<string | null>(null);
  const [progress, setProgress] = useState<PackagingProgress>({
    status: 'idle',
    progressPercent: 0,
    currentFile: '',
    currentPhase: '',
    speedMBps: 0,
    bytesTransferred: 0,
    totalBytes: 0,
    timeElapsedSec: 0,
    etaSec: 0,
    sha256Results: [],
    offlineRedBarRate: 0,
  });

  // Modals
  const [isBashModalOpen, setIsBashModalOpen] = useState(false);
  const [isSha256ModalOpen, setIsSha256ModalOpen] = useState(false);
  const [isKeyFilesModalOpen, setIsKeyFilesModalOpen] = useState(false);
  const [isMissingModalOpen, setIsMissingModalOpen] = useState(false);
  const [isOfficialGuideModalOpen, setIsOfficialGuideModalOpen] = useState(false);
  const [isMacNativeAppModalOpen, setIsMacNativeAppModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState(false);
  const [missingMaterialsList, setMissingMaterialsList] = useState<MaterialItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPwa(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPwa = async () => {
    setIsMacNativeAppModalOpen(true);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleFilter = (val: boolean) => {
    setFilterUsedOnly(val);
    setConfig((prev) => ({
      ...prev,
      onlyUsedMaterials: val,
      exportMode: val ? 'used_only' : 'all_materials',
    }));
  };

  // Direct folder parsing handler with V2PRO Architecture Diagnosis
  const processFolderEntries = async (
    entries: FolderFileEntry[],
    dirName?: string,
    handle?: FileSystemDirectoryHandle
  ) => {
    setIsLoadingDraft(true);
    setLoadingPhase('正在深度分析草稿关键文件 (draft_info.json, Timelines/project.json)...');
    setLoadError(null);

    try {
      const project = await diagnoseAndParseJianyingFolder(entries, dirName, handle);
      setCurrentProject(project);
      setSelectedMaterialId(null);
      setActiveTimelineId('all');
      setLoadError(null);

      // Default target directory
      setConfig((prev) => ({
        ...prev,
        targetDirectory: `~/Desktop/${project.name}_LOCAL_PACKAGE`,
      }));

      const realCount = project.materials.filter((m) => m.realFile).length;

      if (project.diagnosis.architecture === 'type_b_encrypted') {
        showToast(`⚠️ 识别到 Mac 剪映 6.0+ AES 加密工程，已启动保真分析`);
      } else {
        showToast(
          `✓ 已成功解析: ${project.name} (${project.diagnosis.architectureLabel}, 已识别 ${project.materials.length} 个媒体)`
        );
      }
    } catch (err: any) {
      console.error('Failed to parse draft folder:', err);
      const msg = err.message || '未能成功解析剪映草稿工程，请确认所选文件夹是否为剪映草稿目录';
      setLoadError(msg);
      showToast(`❌ 载入失败: ${msg}`);
    } finally {
      setIsLoadingDraft(false);
      setLoadingPhase('');
    }
  };

  // Direct Directory Picker
  const handleOpenDirectoryPicker = async () => {
    setLoadError(null);
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: 'read',
        });
        setIsLoadingDraft(true);
        setLoadingPhase(`正在读取 ${dirHandle.name} 目录结构...`);

        const entries: FolderFileEntry[] = [];
        async function readDir(dir: any, parentPath = '') {
          for await (const entry of dir.values()) {
            const rel = parentPath ? `${parentPath}/${entry.name}` : entry.name;
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              entries.push({ file, relativePath: rel });
            } else if (entry.kind === 'directory') {
              await readDir(entry, rel);
            }
          }
        }
        await readDir(dirHandle);
        await processFolderEntries(entries, dirHandle.name, dirHandle);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
        console.warn('showDirectoryPicker failed, falling back to input:', err);
        folderInputRef.current?.click();
      }
    } else {
      folderInputRef.current?.click();
    }
  };

  // Fallback hidden input change handler for folder
  const handleFolderInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const entries: FolderFileEntry[] = [];
    let dirName = '';

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const rel = f.webkitRelativePath || f.name;
      if (!dirName && f.webkitRelativePath) {
        dirName = f.webkitRelativePath.split('/')[0];
      }
      entries.push({ file: f, relativePath: rel });
    }

    await processFolderEntries(entries, dirName);
  };

  // Zip Archive input change handler (loads .zip in-memory)
  const handleZipInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingDraft(true);
    setLoadingPhase(`正在解包剪映草稿工程压缩包 ${file.name}...`);
    setLoadError(null);

    try {
      const { entries: zipEntries, rootName: zipRoot } = await parseDraftZipFile(file);
      await processFolderEntries(zipEntries, zipRoot || file.name.replace(/\.zip$/i, ''));
    } catch (err: any) {
      console.error('Failed to unpack zip draft:', err);
      setLoadError(`解包草稿压缩包失败: ${err.message || '压缩包结构异常或损坏'}`);
      setIsLoadingDraft(false);
    } finally {
      if (zipInputRef.current) zipInputRef.current.value = '';
    }
  };

  // Handler to link external media folder
  const handleLinkExternalMediaFolder = async () => {
    if (!currentProject) return;

    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker({ mode: 'read' });
        showToast(`正在扫描 ${dirHandle.name} 中的媒体文件并自动关联与上轨...`);

        const files: File[] = [];
        async function readAll(dir: any) {
          for await (const entry of dir.values()) {
            if (entry.kind === 'file') {
              const f = await entry.getFile();
              files.push(f);
            } else if (entry.kind === 'directory') {
              await readAll(entry);
            }
          }
        }
        await readAll(dirHandle);

        const { linkedCount, addedCount, updatedProject } = addOrLinkExternalFilesToProject(
          currentProject,
          files
        );

        if (addedCount > 0 || linkedCount > 0) {
          const ensured = ensureProjectTracksAndSegments(updatedProject);
          setCurrentProject(ensured);
          showToast(`✓ 成功关联/读取 ${linkedCount + addedCount} 个媒体文件，时间线轨道已自动同步！`);
        } else {
          showToast(`未在所选文件夹中找到匹配的媒体文件`);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          externalMediaInputRef.current?.click();
        }
      }
    } else {
      externalMediaInputRef.current?.click();
    }
  };

  const handleExternalMediaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentProject || !e.target.files) return;
    const files = Array.from(e.target.files);
    const { linkedCount, addedCount, updatedProject } = addOrLinkExternalFilesToProject(
      currentProject,
      files
    );
    if (addedCount > 0 || linkedCount > 0) {
      const ensured = ensureProjectTracksAndSegments(updatedProject);
      setCurrentProject(ensured);
      showToast(`✓ 成功关联/添加 ${linkedCount + addedCount} 个媒体实体！时间线轨道已就绪。`);
    } else {
      showToast(`未在所选文件夹中找到相符的媒体`);
    }
  };

  const handleExternalFilesInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentProject || !e.target.files) return;
    const files = Array.from(e.target.files);
    const { linkedCount, addedCount, updatedProject } = addOrLinkExternalFilesToProject(
      currentProject,
      files
    );
    if (addedCount > 0 || linkedCount > 0) {
      const ensured = ensureProjectTracksAndSegments(updatedProject);
      setCurrentProject(ensured);
      showToast(`✓ 成功关联/导入 ${linkedCount + addedCount} 个媒体文件，时间线轨道已生成！`);
    } else {
      showToast(`未在所选文件中找到支持的媒体`);
    }
  };

  // Drag & Drop Folder Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setLoadError(null);

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    setIsLoadingDraft(true);
    setLoadingPhase('正在读取拖入的草稿文件夹结构与媒体...');

    const entries: FolderFileEntry[] = [];
    let rootName = '';

    async function traverseEntry(itemEntry: any, path = '') {
      if (itemEntry.isFile) {
        return new Promise<void>((resolve) => {
          itemEntry.file((file: File) => {
            entries.push({ file, relativePath: path ? `${path}/${file.name}` : file.name });
            resolve();
          });
        });
      } else if (itemEntry.isDirectory) {
        if (!rootName && !path) rootName = itemEntry.name;
        const dirReader = itemEntry.createReader();
        return new Promise<void>((resolve) => {
          dirReader.readEntries(async (subEntries: any[]) => {
            for (const sub of subEntries) {
              await traverseEntry(sub, path ? `${path}/${itemEntry.name}` : itemEntry.name);
            }
            resolve();
          });
        });
      }
    }

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.webkitGetAsEntry) {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            await traverseEntry(entry);
          }
        }
      }
      if (entries.length === 0) {
        throw new Error('未在拖入的内容中检索到可读取的文件');
      }

      // Check if dropped file is a .zip archive (e.g. draft package)
      const zipEntry = entries.find((e) => e.file.name.toLowerCase().endsWith('.zip'));
      if (zipEntry) {
        setIsLoadingDraft(true);
        setLoadingPhase(`正在解包剪映草稿压缩包 ${zipEntry.file.name}...`);
        try {
          const { entries: zipEntries, rootName: zipRoot } = await parseDraftZipFile(zipEntry.file);
          await processFolderEntries(zipEntries, zipRoot || zipEntry.file.name.replace(/\.zip$/i, ''));
        } catch (zipErr: any) {
          console.error('Failed to parse dropped zip:', zipErr);
          setLoadError(`解包草稿压缩包失败: ${zipErr.message || '请确认压缩包完整'}`);
          setIsLoadingDraft(false);
        }
        return;
      }

      // Check if dropped content is a Jianying draft folder OR external media files
      const hasDraftJson = entries.some((e) => {
        const l = e.file.name.toLowerCase();
        return (
          l === 'draft_info.json' ||
          l === 'draft_content.json' ||
          l === 'draft_meta_info.json' ||
          l === 'timeline_layout.json' ||
          l === 'draft_virtual_store.json'
        );
      });

      if (!hasDraftJson && currentProject) {
        const droppedFiles = entries.map((e) => e.file);
        const { linkedCount, addedCount, updatedProject } = addOrLinkExternalFilesToProject(
          currentProject,
          droppedFiles
        );
        const ensured = ensureProjectTracksAndSegments(updatedProject);
        setCurrentProject(ensured);
        setIsLoadingDraft(false);

        if (addedCount > 0 || linkedCount > 0) {
          showToast(`✓ 成功关联/添加 ${linkedCount + addedCount} 个媒体文件，时间线已自动匹配！`);
        } else {
          showToast('已接收文件，未检测到支持的视频/音频/图片格式');
        }
        return;
      }

      await processFolderEntries(entries, rootName);
    } catch (err: any) {
      console.error(err);
      setLoadError(err.message || '拖拽读取失败，请直接点击“选择剪映草稿文件夹”按钮');
      setIsLoadingDraft(false);
    }
  };

  // Execution: Start Direct Directory Packaging (Non-ZIP V2 PRO)
  const handleStartPacking = async () => {
    if (!currentProject) {
      handleOpenDirectoryPicker();
      return;
    }

    if (currentProject.diagnosis.architecture === 'type_b_encrypted') {
      showToast(
        `当前剪映版本 6.0+ 为 AES 加密工程，时间线素材无法直接读取，已阻止假打包。`
      );
      setIsKeyFilesModalOpen(true);
      return;
    }

    // Check if any selected materials lack real File binaries
    const selectedMaterials =
      config.exportMode === 'used_only'
        ? currentProject.materials.filter((m) => m.isUsedOnTimeline)
        : currentProject.materials;

    const missing = selectedMaterials.filter((m) => !m.realFile);

    if (missing.length > 0) {
      setMissingMaterialsList(missing);
      setIsMissingModalOpen(true);
      return;
    }

    await executeDirectoryPackagingProcess();
  };

  const executeDirectoryPackagingProcess = async () => {
    if (!currentProject) return;

    let targetParentDirHandle: FileSystemDirectoryHandle | null = targetDirHandle;

    // 仅在用户尚未指定目标目录时，才在用户手势下唤起一次目录选择；若用户已选择好，直接静默使用！
    if (!targetParentDirHandle && 'showDirectoryPicker' in window) {
      try {
        showToast('请选择输出目标保存目录 (例如桌面 ~/Desktop)...');
        targetParentDirHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
        });
        if (targetParentDirHandle) {
          const dirHandle = targetParentDirHandle;
          setTargetDirHandle(dirHandle);
          setTargetDirName(dirHandle.name);
          setConfig((prev) => ({
            ...prev,
            targetDirectory: `~/Desktop/${dirHandle.name}`,
          }));
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.warn('Directory picker cancelled or unsupported, fallback to script');
      }
    } else if (targetParentDirHandle) {
      // 已经指定目标目录，静默核验/申请读写权限，绝不重复弹出文件系统选择器
      try {
        const perm = await (targetParentDirHandle as any).queryPermission?.({ mode: 'readwrite' });
        if (perm !== 'granted') {
          await (targetParentDirHandle as any).requestPermission?.({ mode: 'readwrite' });
        }
      } catch (err) {
        console.warn('Directory permission verify notice:', err);
      }
    }

    try {
      showToast('🚀 开始构建 V3 跨机可迁移工程包 (流式直写 + 新机安装器)...');
      const result = await runLocalDirectoryPackaging(
        currentProject,
        config,
        targetParentDirHandle || undefined,
        setProgress
      );

      if (result.success) {
        showToast(
          `🎉 迁移包制作完成！已内置【安装剪映工程.command】，新电脑双击即可一键入库！`
        );
        // 不自动强制弹出模态窗干扰视线，在面板内提供查看按钮更自然
      } else {
        showToast(
          `💡 已生成【制作迁移包.command】与报告清单，可直接在终端秒级执行！`
        );
      }
    } catch (err: any) {
      console.error('Packaging fatal error caught:', err);
      setProgress((prev) => ({
        ...prev,
        status: 'error',
        currentPhase: '迁移包制作异常中止: ' + (err.message || '未知错误'),
      }));
      showToast('❌ 制作过程遇到异常: ' + (err.message || '请查看控制台'));
    }
  };

  // Calculate project asset counts
  const videoCount = currentProject?.materials.filter((m) => m.type === 'video').length || 0;
  const audioCount = currentProject?.materials.filter((m) => m.type === 'audio').length || 0;
  const imageCount = currentProject?.materials.filter((m) => m.type === 'image').length || 0;
  const realEntityCount = currentProject?.materials.filter((m) => m.realFile).length || 0;
  const missingEntityCount = (currentProject?.materials.length || 0) - realEntityCount;

  // Timeline filtering
  const activeTimeline = currentProject?.timelines.find((t) => t.id === activeTimelineId);
  const activeTracks = useMemo(() => {
    if (!currentProject) return [];
    let tracks =
      activeTimeline && activeTimelineId !== 'all'
        ? activeTimeline.tracks
        : currentProject.tracks;

    const hasSegments =
      tracks && tracks.some((t) => Array.isArray(t.segments) && t.segments.length > 0);
    if (!hasSegments) {
      tracks = currentProject.tracks;
    }

    const fallbackHasSegments =
      tracks && tracks.some((t) => Array.isArray(t.segments) && t.segments.length > 0);
    if (!fallbackHasSegments && currentProject.materials && currentProject.materials.length > 0) {
      const ensured = ensureProjectTracksAndSegments(currentProject);
      return ensured.tracks;
    }

    return tracks || [];
  }, [currentProject, activeTimeline, activeTimelineId]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="h-screen w-screen bg-[#0c0d12] text-zinc-100 flex flex-col select-none overflow-hidden antialiased relative"
    >
      {/* Hidden fallback file inputs */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={handleFolderInputChange}
      />
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip,application/zip"
        className="hidden"
        onChange={handleZipInputChange}
      />
      <input
        ref={externalMediaInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={handleExternalMediaInputChange}
      />
      <input
        ref={externalFilesInputRef}
        type="file"
        multiple
        accept="video/*,audio/*,image/*"
        className="hidden"
        onChange={handleExternalFilesInputChange}
      />

      {/* Global Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-indigo-950/80 backdrop-blur-md flex flex-col items-center justify-center border-4 border-dashed border-indigo-400 m-2 rounded-2xl pointer-events-none animate-in fade-in duration-150">
          <FolderUp className="w-16 h-16 text-indigo-300 animate-bounce mb-3" />
          <h3 className="text-xl font-bold text-white mb-1">松开鼠标以载入剪映草稿</h3>
          <p className="text-xs text-indigo-200">
            支持拖入草稿文件夹或 .zip 压缩包，自动深度识别 Timelines/project.json 与全部音视频资产
          </p>
        </div>
      )}

      {/* 1. Header Bar with Unified Settings Menu */}
      <HeaderBar
        currentProject={currentProject}
        onOpenDraftPicker={handleOpenDirectoryPicker}
        onOpenZipPicker={() => zipInputRef.current?.click()}
        onOpenKeyFilesModal={() => setIsKeyFilesModalOpen(true)}
        onOpenOfficialGuide={() => setIsOfficialGuideModalOpen(true)}
        onOpenMacNativeAppModal={() => setIsMacNativeAppModalOpen(true)}
        onOpenBashModal={() => setIsBashModalOpen(true)}
        onOpenSha256Report={() => setIsSha256ModalOpen(true)}
        macUsername={macUsername}
        onChangeMacUsername={setMacUsername}
      />

      {/* 2. Workspace Viewport */}
      <main className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left/Center Workspace: Timeline & Material Table OR Pure Clean Empty State */}
        <div className="flex-1 flex flex-col min-w-0 p-3 gap-3 overflow-hidden">
          {currentProject ? (
            <>
              {/* Active Draft Project Bar */}
              <div className="bg-[#141722]/95 border border-white/10 rounded-xl px-3.5 py-2.5 flex items-center justify-between shrink-0 shadow-md">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
                    {currentProject.diagnosis.architecture === 'type_b_encrypted' ? (
                      <Lock className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Folder className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate max-w-[260px]">
                        {currentProject.name}
                      </span>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium border flex items-center gap-1 ${
                          currentProject.diagnosis.architecture === 'type_b_encrypted'
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {currentProject.diagnosis.architecture === 'type_b_encrypted' && (
                          <Lock className="w-2.5 h-2.5" />
                        )}
                        {currentProject.diagnosis.architectureLabel}
                      </span>

                      <span className="text-[10px] text-zinc-400 font-mono hidden md:inline">
                        {videoCount} 个视频 · {audioCount} 个音频 · {imageCount} 个贴图 · {currentProject.fps} FPS
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      {currentProject.materials.length === 0 ? (
                        <span className="text-[10px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded font-mono flex items-center gap-1.5">
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          未解码出源素材 (剪映 6.0+ AES 密文保护或存放在外部目录) · 请点击右侧“关联素材文件夹”或在剪映中导出草稿包
                        </span>
                      ) : missingEntityCount === 0 ? (
                        <span className="text-[10px] text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          全部媒体实体已就绪 (可直接执行 V2 PRO 目录落盘)
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          {missingEntityCount} 个素材位于工程外绝对路径 (支持关联素材目录或使用终端脚本秒拷)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Project Actions */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => setIsKeyFilesModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium border border-white/10 transition-all cursor-pointer"
                    title="分析工程内 draft_info.json, Timelines/ 等关键文件"
                  >
                    <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
                    <span>分析关键文件</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLinkExternalMediaFolder}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold border border-indigo-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                    title="在访达中选择素材所在文件夹，自动关联时间线实体并直接拷贝至 02_MEDIA"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>关联素材文件夹</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenDirectoryPicker}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium border border-white/10 transition-all cursor-pointer"
                    title="更换其他剪映草稿"
                  >
                    <FolderUp className="w-3.5 h-3.5" />
                    <span>更换草稿</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentProject(null);
                      setSelectedMaterialId(null);
                      setLoadError(null);
                      showToast('已关闭当前草稿，回到待机状态');
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5 transition-colors cursor-pointer"
                    title="卸载当前草稿"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Timeline Sequence & Dependency Visualizer */}
              <TimelineViewer
                tracks={activeTracks}
                materials={currentProject.materials}
                timelines={currentProject.timelines}
                activeTimelineId={activeTimelineId}
                onSelectTimeline={(id) => {
                  setActiveTimelineId(id);
                  setConfig((prev) => ({ ...prev, selectedTimelineId: id }));
                }}
                totalDurationSec={
                  activeTimeline && activeTimelineId !== 'all'
                    ? activeTimeline.durationSec
                    : currentProject.durationSec
                }
                highlightMaterialId={selectedMaterialId}
                onSelectMaterial={(id) => setSelectedMaterialId(id)}
              />

              {/* Materials Categorization Table */}
              <MaterialTable
                materials={currentProject.materials}
                filterUsedOnly={filterUsedOnly}
                onToggleFilterUsed={handleToggleFilter}
                selectedMaterialId={selectedMaterialId}
                onSelectMaterial={(id) => setSelectedMaterialId(id)}
                onLinkExternalMedia={handleLinkExternalMediaFolder}
                onSelectFiles={() => externalFilesInputRef.current?.click()}
              />
            </>
          ) : (
            /* Clean Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 hover:border-indigo-500/40 rounded-2xl bg-[#12141a]/60 hover:bg-[#12141a]/80 backdrop-blur-sm text-center relative overflow-hidden transition-all">
              <div className="absolute w-96 h-96 rounded-full bg-indigo-600/5 filter blur-3xl pointer-events-none" />

              {/* Loading Indicator */}
              {isLoadingDraft ? (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                  <p className="text-sm font-semibold text-white">
                    {loadingPhase || '正在分析剪映工程结构与关键文件...'}
                  </p>
                  <p className="text-xs text-zinc-400">
                    深度解析 draft_info.json, draft_meta_info.json, Timelines/project.json 及真实视频音频资产
                  </p>
                </div>
              ) : (
                <div className="max-w-md flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/10">
                    <FolderUp className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">选择或拖入剪映草稿工程</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      支持拖入草稿文件夹或 .zip 压缩包，也可以点击下方按钮在访达中点选。
                    </p>
                  </div>

                  {loadError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 text-left w-full">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{loadError}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleOpenDirectoryPicker}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.98] text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 border border-indigo-300/40 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>选择剪映草稿文件夹</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => zipInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 active:scale-[0.98] text-cyan-200 hover:text-white font-semibold text-xs border border-cyan-400/40 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-cyan-400" />
                      <span>导入草稿压缩包 (.zip)</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-zinc-500 font-mono pt-1">
                    Mac 剪映草稿通用路径: ~/Movies/JianyingPro/User Data/Projects/com.lveditor.draft
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOfficialGuideModalOpen(true)}
                    className="text-[11px] text-amber-400/90 hover:text-amber-300 underline underline-offset-4 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>查看剪映官方避坑手册 (草稿平铺规范 / 急救彩蛋 / 跨机脱机解析)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel: Packaging Control & Export Specs */}
        <div className="p-3 pl-0 flex flex-col shrink-0 overflow-hidden">
          <ExportControlPanel
            project={currentProject}
            config={config}
            onChangeConfig={(newCfg) => {
              setConfig(newCfg);
              setFilterUsedOnly(newCfg.exportMode === 'used_only');
            }}
            targetDirHandle={targetDirHandle}
            targetDirName={targetDirName}
            onSelectTargetDirHandle={(handle, name) => {
              setTargetDirHandle(handle);
              setTargetDirName(name);
            }}
            onStartPacking={handleStartPacking}
            onOpenBashModal={() => setIsBashModalOpen(true)}
            onOpenKeyFilesModal={() => setIsKeyFilesModalOpen(true)}
            onOpenSha256Report={() => setIsSha256ModalOpen(true)}
            progress={progress}
          />
        </div>
      </main>

      {/* Modals */}
      <KeyFilesAnalysisModal
        isOpen={isKeyFilesModalOpen}
        onClose={() => setIsKeyFilesModalOpen(false)}
        project={currentProject}
      />

      <BashScriptModal
        project={currentProject}
        config={config}
        isOpen={isBashModalOpen}
        onClose={() => setIsBashModalOpen(false)}
      />

      <Sha256ReportModal
        project={currentProject}
        config={config}
        progress={progress}
        isOpen={isSha256ModalOpen}
        onClose={() => setIsSha256ModalOpen(false)}
      />

      <OfficialGuideModal
        isOpen={isOfficialGuideModalOpen}
        onClose={() => setIsOfficialGuideModalOpen(false)}
        macUsername={macUsername}
      />

      <MacNativeAppModal
        isOpen={isMacNativeAppModalOpen}
        onClose={() => setIsMacNativeAppModalOpen(false)}
      />

      {currentProject && (
        <MissingAssetsPackagingModal
          isOpen={isMissingModalOpen}
          onClose={() => setIsMissingModalOpen(false)}
          project={currentProject}
          config={config}
          missingMaterials={missingMaterialsList}
          onLinkFolder={handleLinkExternalMediaFolder}
          onOpenBashModal={() => {
            setIsMissingModalOpen(false);
            setIsBashModalOpen(true);
          }}
          onProceedLightweightZip={executeDirectoryPackagingProcess}
        />
      )}

      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#1e2230] border border-white/20 text-white text-xs px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
