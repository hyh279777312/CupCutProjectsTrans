import React, { useState } from 'react';
import {
  BookOpen,
  X,
  AlertTriangle,
  FolderTree,
  FileCheck2,
  Terminal,
  Sparkles,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Layers,
  Wrench,
} from 'lucide-react';

interface OfficialGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  macUsername?: string;
}

export const OfficialGuideModal: React.FC<OfficialGuideModalProps> = ({
  isOpen,
  onClose,
  macUsername = 'hyh',
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'paths' | 'easteregg' | 'faq'>('rules');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const macDefaultPath = `~/Movies/JianyingPro/User Data/Projects/com.lveditor.draft`;
  const macExpandedPath = `/Users/${macUsername}/Movies/JianyingPro/User Data/Projects/com.lveditor.draft`;
  const winDefaultPath = `%LOCALAPPDATA%\\JianyingPro\\User Data\\Projects\\com.lveditor.draft`;

  const macHistoryCmd = `defaults read ~/Library/Containers/com.lemon.lvpro/Data/Library/Preferences/com.bytedance.JianyingPro GlobalSettings.History.oldCustomDraftPathList`;
  const winHistoryCmd = `reg query HKCU\\Software\\Bytedance\\JianyingPro\\GlobalSettings\\History /v oldCustomDraftPathList`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121520] border border-white/15 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#171a29]/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">剪映官方技术指南与避坑手册</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ByteDance 官方规范提取
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                源自官方《剪映专业版常见问题操作指引》，深度指导跨设备工程迁移与草稿防丢
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

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-white/10 bg-[#141724] flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'rules'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>核心规范 (单层平铺铁律)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paths')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'paths'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>双端路径 & 历史命令速查</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('easteregg')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'easteregg'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>官方隐藏调试彩蛋 (草稿急救)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'faq'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>为什么直接复制会脱机？</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed">
          {activeTab === 'rules' && (
            <div className="space-y-4">
              {/* Rule 1: No nested folders */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>核心硬性铁律：剪映草稿列表【绝不跨层加载】！</span>
                </div>
                <p className="text-zinc-300">
                  官方手册第 29 页明确指出：
                  <span className="text-amber-300 font-semibold">
                    “需要确保 JianyingPro Drafts 目录的下一级为一个一个的草稿！放在更里面一层（例如 Drafts/分类目录/草稿名）会被剪映完全忽略！”
                  </span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-amber-500/20 text-[11px] font-mono">
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
                    <div className="font-bold text-rose-400 mb-1">❌ 错误层级（剪映首页 100% 找不到）：</div>
                    <div>JianyingPro Drafts/</div>
                    <div>　└─ 我的打包分类/</div>
                    <div>　　　└─ 09月21日(1)/ &lt;-- 嵌套过深，被直接忽略</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                    <div className="font-bold text-emerald-400 mb-1">✓ 正确层级（单层平铺，瞬间显示）：</div>
                    <div>JianyingPro Drafts/</div>
                    <div>　└─ 09月21日(1)/ &lt;-- 第一级子目录</div>
                    <div>　　　├─ draft_content.json</div>
                    <div>　　　└─ draft_info.json</div>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  💡 本打包工具生成的【安装剪映工程.command】已自动遵循此规范，解压时严格将草稿平铺入库至第一级，杜绝首页找不到草稿的问题！
                </p>
              </div>

              {/* Rule 2: Draft Identity dual files */}
              <div className="p-4 rounded-xl bg-[#171b29] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <FileCheck2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>剪映草稿“双核心识别文件”</span>
                </div>
                <p className="text-zinc-300">
                  官方手册第 9 页与第 29 页指出：全盘排查草稿目录时，判定该目录为剪映工程的核心依据是该目录下必须包含：
                </p>
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-1 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                    1. draft_content.json（核心轨道素材索引）
                  </span>
                  <span className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
                    2. draft_info.json（草稿元数据与配置）
                  </span>
                  <span className="px-2 py-1 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300">
                    3. draft_meta_info.json（首页展示台账，新版有 Timelines/）
                  </span>
                </div>
              </div>

              {/* Rule 3: Read-Only attribute trap */}
              <div className="p-4 rounded-xl bg-[#171b29] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>目录权限陷阱：防止草稿被设为“只读”</span>
                </div>
                <p className="text-zinc-300">
                  官方手册第 20-21 页警示：如果草稿目录被意外勾选了 Windows【只读】属性，或者在 macOS 下缺少写入权限（Read-Only），会导致剪映退出时
                  <span className="text-rose-400 font-semibold">“保存草稿失败，编辑内容全部丢失”</span>。
                </p>
                <p className="text-[11px] text-zinc-400">
                  🛡️ 本工具迁移脚本已自动注入了 <code className="text-cyan-300 font-mono">chmod -R 755</code> 和安全隔离清理命令，确保解压后具备完全读写权限。
                </p>
              </div>
            </div>
          )}

          {activeTab === 'paths' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#171b29] border border-white/10 space-y-3">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>macOS 剪映草稿默认路径 (官网版 & App Store 版)</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="text-[11px] text-zinc-400 mb-1">官网安装版（最常用，推荐）：</div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/10 font-mono text-[11px] text-cyan-300">
                      <span className="truncate">{macDefaultPath}</span>
                      <button
                        type="button"
                        onClick={() => copyText('mac_default', macDefaultPath)}
                        className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white shrink-0 cursor-pointer"
                      >
                        {copiedKey === 'mac_default' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>复制</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-zinc-400 mb-1">当前 Mac 用户绝对路径 (按 Cmd+Shift+G 直接跳转)：</div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/10 font-mono text-[11px] text-indigo-300">
                      <span className="truncate">{macExpandedPath}</span>
                      <button
                        type="button"
                        onClick={() => copyText('mac_abs', macExpandedPath)}
                        className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white shrink-0 cursor-pointer"
                      >
                        {copiedKey === 'mac_abs' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>复制</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#171b29] border border-white/10 space-y-3">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span>Windows 剪映草稿默认路径</span>
                </div>
                <div>
                  <div className="text-[11px] text-zinc-400 mb-1">在文件资源管理器地址栏直接粘贴回车：</div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/10 font-mono text-[11px] text-purple-300">
                    <span className="truncate">{winDefaultPath}</span>
                    <button
                      type="button"
                      onClick={() => copyText('win_default', winDefaultPath)}
                      className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white shrink-0 cursor-pointer"
                    >
                      {copiedKey === 'win_default' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>复制</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#171b29] border border-white/10 space-y-3">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>官方历史自定义路径查询命令（找回以前设置过的盘符）</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  官方手册第 8-9 页介绍：如果您曾经在全局设置里修改过草稿位置但忘记保存在哪个移动硬盘或盘符，可在终端/CMD 运行以下官方命令查询：
                </p>

                <div className="space-y-2 font-mono text-[11px]">
                  <div>
                    <div className="text-zinc-400 mb-1">macOS 终端查询命令：</div>
                    <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/10 text-emerald-300">
                      <span className="truncate">{macHistoryCmd}</span>
                      <button
                        type="button"
                        onClick={() => copyText('mac_cmd', macHistoryCmd)}
                        className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white shrink-0 cursor-pointer"
                      >
                        {copiedKey === 'mac_cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>复制</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-zinc-400 mb-1">Windows CMD 查询命令：</div>
                    <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/10 text-emerald-300">
                      <span className="truncate">{winHistoryCmd}</span>
                      <button
                        type="button"
                        onClick={() => copyText('win_cmd', winHistoryCmd)}
                        className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white shrink-0 cursor-pointer"
                      >
                        {copiedKey === 'win_cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>复制</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'easteregg' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-purple-500/15 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">官方隐藏彩蛋：【恢复草稿备份】紧急救援通道</h4>
                </div>
                <p className="text-zinc-300">
                  官方手册第 23-25 页公开的剪映专业版（5.1.0 及之后版本）隐藏调试模式，当您误删了时间线或者草稿损坏时，可通过此秘技救急：
                </p>

                <div className="space-y-2 bg-black/40 p-3 rounded-xl border border-white/10 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 font-bold text-[11px]">
                      1
                    </span>
                    <span>打开剪映电脑版首页，点击右上角的【设置（齿轮图标）】进入菜单。</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 font-bold text-[11px]">
                      2
                    </span>
                    <span>
                      点击【版本号（如 5.3.0）】，在弹出的版本弹窗中：
                      <span className="text-amber-300 font-bold"> 快速连续点击 10 下剪映大图标！</span>
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 font-bold text-[11px]">
                      3
                    </span>
                    <span>
                      系统将唤出隐藏的【调试窗口】，依次切换到【功能操作】 -&gt; 点击【恢复草稿备份】。
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 font-bold text-[11px]">
                      4
                    </span>
                    <span>在草稿备份列表中，根据操作时间戳将历史快照一键“恢复至新草稿”！</span>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-400">
                  📌 提示：官方调试备份仅恢复时间线结构。若涉及外部素材脱机，依然需要依赖本工具的【02_MEDIA 物理资产自愈引擎】进行路径绑定。
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>为什么剪映官方说“不能直接跨设备复制草稿”？</span>
                </div>
                <p className="text-zinc-300">
                  官方手册第 30 页明确写道：
                  <span className="text-rose-300 font-semibold">
                    “不可以将草稿目录复制并粘贴直接使用，直接使用会出现草稿打不开、内容为空、媒体丢失（Media Not Found）等一系列问题。”
                  </span>
                </p>
                <div className="space-y-2 text-zinc-300 pt-2 border-t border-rose-500/20">
                  <div className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">1. 绝对路径写死：</span>
                    <span>
                      剪映草稿内部（draft_content.json）记录的是原电脑本地磁盘的绝对路径（如 <code className="text-rose-300 font-mono">D:\Videos\01.mp4</code> 或 <code className="text-rose-300 font-mono">/Users/usernameA/Movies/...</code>），拷贝到新电脑后绝对路径断开，剪映判定找不到素材，直接亮起全屏红条脱机！
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">2. 跨平台斜杠与编码：</span>
                    <span>Windows 的反斜杠（\）与盘符格式（C:\）在 Mac 上无法识别，且中文字符存在 NFC/NFD 规范分解差异。</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">3. 付费/VIP 素材权限（手册第 17 页）：</span>
                    <span>
                      “专业版暂不支持跨电脑迁移本地付费草稿”。若工程内含 VIP 特效/音乐，在新电脑未登录同 VIP 账号时会拦截打开。
                    </span>
                  </div>
                </div>
              </div>

              {/* How our tool solves it */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>本打包工具是如何真正攻克并解决上述难题的？</span>
                </div>
                <div className="space-y-2 text-zinc-300 text-[11px]">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓ 资产自包含打包：</span>
                    <span>
                      自动把时间线所引用的所有外部素材统一抽取拷贝到工程内的 <code className="text-emerald-300 font-mono">02_MEDIA</code> 独立文件夹中，脱离原机器文件依赖。
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓ 目标机现场路径自动重写自愈：</span>
                    <span>
                      在安装时通过自带的自愈引擎，动态侦测新机器的真实用户名与绝对路径，重写 draft_content.json 与所有配置，将老路径全部替换为新路径，开箱即用 0 脱机！
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓ 自动入库与平铺放行：</span>
                    <span>
                      严格按剪映官方规范平铺写入 <code className="text-emerald-300 font-mono">JianyingPro Drafts/</code> 第一级目录，去除只读与系统隔离标记，保证剪映首页瞬间识别！
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#141724] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-zinc-400">
            按 ESC 键或点击右上角关闭 · 遵循剪映官方规范设计
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};
