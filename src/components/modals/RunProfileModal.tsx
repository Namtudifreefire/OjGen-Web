import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../i18n';
import { X, CheckCircle2, Plus, Trash2, Download, Upload, Copy, FileCode, Terminal, Play, ChevronDown, ChevronUp } from 'lucide-react';

interface RunCommand {
  name: string;
  command: string;
  args: string;
  description: string;
}

interface RunProfileData {
  version: number;
  problemId: string;
  mainFile: string;
  buildCommands: RunCommand[];
  runCommands: RunCommand[];
  testCommands: RunCommand[];
  envVars: Record<string, string>;
}

const DEFAULT_PROFILE: RunProfileData = {
  version: 1,
  problemId: '',
  mainFile: 'solution.cpp',
  buildCommands: [
    { name: 'Build C++', command: 'g++', args: '-std=c++17 -O2 -pipe -static -s -o solution solution.cpp', description: 'Biên dịch C++17 với tối ưu hóa' },
    { name: 'Build C', command: 'gcc', args: '-std=c11 -O2 -pipe -static -s -o solution solution.c', description: 'Biên dịch C11' },
    { name: 'Build Rust', command: 'rustc', args: '-C opt-level=3 -o solution solution.rs', description: 'Biên dịch Rust release' },
    { name: 'Build Go', command: 'go', args: 'build -o solution solution.go', description: 'Biên dịch Go' },
    { name: 'Build Java', command: 'javac', args: 'Solution.java', description: 'Biên dịch Java' },
    { name: 'Build Pascal', command: 'fpc', args: '-O2 -XS solution.pas', description: 'Biên dịch Pascal' },
  ],
  runCommands: [
    { name: 'Run C++/C/Rust/Go', command: './solution', args: '', description: 'Chạy file thực thi native' },
    { name: 'Run Java', command: 'java', args: 'Solution', description: 'Chạy Java class' },
    { name: 'Run Python', command: 'python3', args: 'solution.py', description: 'Chạy Python 3' },
    { name: 'Run Node.js', command: 'node', args: 'solution.js', description: 'Chạy Node.js' },
    { name: 'Run Kotlin', command: 'kotlin', args: 'solution.jar', description: 'Chạy Kotlin JAR' },
  ],
  testCommands: [
    { name: 'Test đơn giản', command: './solution', args: '< input.in > output.out', description: 'Chạy với input/output file' },
    { name: 'Test với time limit', command: 'timeout', args: '2 ./solution < input.in > output.out', description: 'Giới hạn 2 giây' },
  ],
  envVars: {},
};
const profileDefaults = (language: 'vi' | 'en', problemId: string): RunProfileData => {
  const labels: Record<string, string> = {
    'Biên dịch C++17 với tối ưu hóa': 'Compile optimized C++17', 'Biên dịch C11': 'Compile C11',
    'Biên dịch Rust release': 'Compile Rust release', 'Biên dịch Go': 'Compile Go',
    'Biên dịch Java': 'Compile Java', 'Biên dịch Pascal': 'Compile Pascal',
    'Chạy file thực thi native': 'Run native executable', 'Chạy Java class': 'Run Java class',
    'Chạy Python 3': 'Run Python 3', 'Chạy Node.js': 'Run Node.js', 'Chạy Kotlin JAR': 'Run Kotlin JAR',
    'Test đơn giản': 'Basic test', 'Chạy với input/output file': 'Run with input/output files',
    'Test với time limit': 'Test with time limit', 'Giới hạn 2 giây': 'Two-second limit',
  };
  const commands = (items: RunCommand[]) => items.map(item => ({ ...item,
    name: language === 'en' ? labels[item.name] ?? item.name : item.name,
    description: language === 'en' ? labels[item.description] ?? item.description : item.description,
  }));
  return { ...DEFAULT_PROFILE, problemId, buildCommands: commands(DEFAULT_PROFILE.buildCommands),
    runCommands: commands(DEFAULT_PROFILE.runCommands), testCommands: commands(DEFAULT_PROFILE.testCommands), envVars: {} };
};

interface RunProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: RunProfileData) => void;
  initialProfile?: RunProfileData;
  currentProblemId?: string;
}

export const RunProfileModal: React.FC<RunProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProfile,
  currentProblemId,
}) => {
  const { language } = useTranslation();
  const tr = (vi: string, en: string) => language === 'en' ? en : vi;
  const defaultProfile = useRef<RunProfileData>(profileDefaults(language, currentProblemId || ''));
  const [profile, setProfile] = useState<RunProfileData>(initialProfile || defaultProfile.current);
  const [activeSection, setActiveSection] = useState<'main' | 'build' | 'run' | 'test' | 'env'>('main');
  const [expandedCommands, setExpandedCommands] = useState<Set<string>>(new Set());
  const [jsonView, setJsonView] = useState(false);
  useEffect(() => {
    if (initialProfile) return;
    if (profile !== defaultProfile.current) return;
    defaultProfile.current = profileDefaults(language, currentProblemId || '');
    setProfile(defaultProfile.current);
  }, [language, initialProfile, currentProblemId]);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedCommands);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedCommands(next);
  };

  const addCommand = (section: 'buildCommands' | 'runCommands' | 'testCommands') => {
    const newCmd: RunCommand = {
      name: `${tr('Lệnh mới', 'New command')} ${profile[section].length + 1}`,
      command: '',
      args: '',
      description: '',
    };
    setProfile({ ...profile, [section]: [...profile[section], newCmd] });
  };

  const updateCommand = (section: 'buildCommands' | 'runCommands' | 'testCommands', index: number, updates: Partial<RunCommand>) => {
    const next = [...profile[section]];
    next[index] = { ...next[index], ...updates };
    setProfile({ ...profile, [section]: next });
  };

  const removeCommand = (section: 'buildCommands' | 'runCommands' | 'testCommands', index: number) => {
    const next = profile[section].filter((_, i) => i !== index);
    setProfile({ ...profile, [section]: next });
  };

  const moveCommand = (section: 'buildCommands' | 'runCommands' | 'testCommands', index: number, direction: 'up' | 'down') => {
    const next = [...profile[section]];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= next.length) return;
    [next[index], next[targetIdx]] = [next[targetIdx], next[index]];
    setProfile({ ...profile, [section]: next });
  };

  const downloadProfile = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `run.ojrun.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.buildCommands && parsed.runCommands) {
          setProfile({ ...parsed, problemId: currentProblemId || parsed.problemId });
        } else {
          alert(tr('File không đúng định dạng run profile.', 'The file is not a valid run profile.'));
        }
      } catch (err: any) {
        alert(tr(`Lỗi đọc file: ${err.message}`, `Could not read file: ${err.message}`));
      }
    };
    reader.readAsText(file);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(profile, null, 2));
    alert(tr('Đã chép JSON vào clipboard', 'JSON copied to clipboard'));
  };

  if (!isOpen) return null;

  const sections = [
    { key: 'main', label: tr('Chung', 'General'), icon: FileCode },
    { key: 'build', label: 'Build', icon: Terminal },
    { key: 'run', label: 'Run', icon: Play },
    { key: 'test', label: 'Test', icon: CheckCircle2 },
    { key: 'env', label: 'Env', icon: Copy },
  ] as const;

  const renderCommandEditor = (section: 'buildCommands' | 'runCommands' | 'testCommands', label: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300">{label} ({profile[section].length})</span>
        <button
          onClick={() => addCommand(section)}
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded bg-blue-600 hover:bg-blue-500 text-white transition"
        >
          <Plus className="w-3 h-3" />{tr("Thêm", "Add")}
        </button>
      </div>

      {profile[section].length === 0 && (
        <div className="p-4 text-center text-slate-500 text-xs italic bg-slate-950 rounded border border-slate-800">{tr("Chưa có lệnh nào. Nhấn \"Thêm\" để tạo mới.", "No commands yet. Select “Add” to create one.")}
        </div>
      )}

      {profile[section].map((cmd, idx) => {
        const id = `${section}-${idx}`;
        const expanded = expandedCommands.has(id);
        return (
          <div key={id} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleExpand(id)}
              className="w-full p-3 flex items-center justify-between hover:bg-slate-900/60 transition"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''} flex-shrink-0`}>
                  <ChevronDown className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={cmd.name}
                  onChange={e => updateCommand(section, idx, { name: e.target.value })}
                  className="font-semibold text-slate-100 bg-transparent border-b border-slate-700 focus:border-blue-500 focus:outline-none px-1 py-0.5 flex-1 min-w-0"
                  placeholder={tr("Tên lệnh", "Command name")}
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveCommand(section, idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 text-slate-400 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title={tr("Di chuyển lên", "Move up")}
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => moveCommand(section, idx, 'down')}
                  disabled={idx === profile[section].length - 1}
                  className="p-1 text-slate-400 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title={tr("Di chuyển xuống", "Move down")}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => removeCommand(section, idx)}
                  className="p-1 text-slate-400 hover:text-red-400 transition"
                  title={tr("Xóa lệnh", "Delete command")}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </button>

            {expanded && (
              <div className="p-3 border-t border-slate-800 space-y-3 bg-slate-900/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{tr("Lệnh (command)", "Command")}</label>
                    <input
                      type="text"
                      value={cmd.command}
                      onChange={e => updateCommand(section, idx, { command: e.target.value })}
                      className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                      placeholder="g++, python3, ./solution..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{tr("Tham số (args)", "Arguments")}</label>
                    <input
                      type="text"
                      value={cmd.args}
                      onChange={e => updateCommand(section, idx, { args: e.target.value })}
                      className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                      placeholder="-std=c++17 -O2 solution.cpp"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{tr("Mô tả", "Description")}</label>
                  <textarea
                    rows={2}
                    value={cmd.description}
                    onChange={e => updateCommand(section, idx, { description: e.target.value })}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder={tr("Mô tả lệnh này...", "Describe this command...")}
                  />
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">{tr("Command đầy đủ:", "Full command:")} <span className="text-blue-400">{cmd.command} {cmd.args}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderEnvEditor = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300">{tr("Biến môi trường (", "Environment variables (")}{Object.keys(profile.envVars).length})</span>
        <button
          onClick={() => {
            const next = { ...profile.envVars, [`VAR${Object.keys(profile.envVars).length + 1}`]: '' };
            setProfile({ ...profile, envVars: next });
          }}
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded bg-blue-600 hover:bg-blue-500 text-white transition"
        >
          <Plus className="w-3 h-3" />{tr("Thêm", "Add")}
        </button>
      </div>

      {Object.keys(profile.envVars).length === 0 && (
        <div className="p-4 text-center text-slate-500 text-xs italic bg-slate-950 rounded border border-slate-800">{tr("Chưa có biến môi trường.", "No environment variables.")}
        </div>
      )}

      {Object.entries(profile.envVars).map(([key, value]) => (
        <div key={key} className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg">
          <input
            type="text"
            value={key}
            onChange={e => {
              const next = { ...profile.envVars };
              delete next[key];
              next[e.target.value] = value;
              setProfile({ ...profile, envVars: next });
            }}
            className="flex-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
            placeholder={tr("TÊN_BIẾN", "VARIABLE_NAME")}
          />
          <span className="text-slate-500">=</span>
          <input
            type="text"
            value={value}
            onChange={e => {
              const next = { ...profile.envVars };
              next[key] = e.target.value;
              setProfile({ ...profile, envVars: next });
            }}
            className="flex-1 text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
            placeholder={tr("giá trị", "value")}
          />
          <button
            onClick={() => {
              const next = { ...profile.envVars };
              delete next[key];
              setProfile({ ...profile, envVars: next });
            }}
            className="p-1 text-slate-400 hover:text-red-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>{tr("Hồ sơ chạy thử (.ojrun.json)", "Run profile (.ojrun.json)")}</span>
            </h3>
            <p className="text-xs text-slate-400">{tr("Cấu hình build, run, test đa ngôn ngữ cho bài thi", "Configure build, run and test commands for multiple languages")}</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
              <input type="checkbox" checked={jsonView} onChange={e => setJsonView(e.target.checked)} className="rounded bg-slate-900 border-slate-700 text-blue-600 w-3.5 h-3.5" />
              {tr('Xem JSON', 'View JSON')}
            </label>
            <button onClick={downloadProfile} className="px-2.5 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />{tr("Xuất", "Export")}
            </button>
            <button onClick={copyJson} className="px-2.5 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1">
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
            <input type="file" accept=".json" onChange={handleFileLoad} className="hidden" id="run-profile-upload" />
            <label htmlFor="run-profile-upload" className="px-2.5 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />{tr("Nhập", "Import")}
            </label>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex p-2 bg-slate-950/60 border-b border-slate-800 overflow-x-auto">
          {sections.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`px-3 py-1.5 rounded font-medium text-xs transition whitespace-nowrap flex items-center gap-1.5 ${activeSection === s.key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <s.icon className="w-3.5 h-3.5" /> {s.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-4">
          {jsonView ? (
            <div className="h-[500px] bg-slate-950 border border-slate-800 rounded-lg p-3 overflow-auto">
              <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap">{JSON.stringify(profile, null, 2)}</pre>
            </div>
          ) : activeSection === 'main' ? (
            <div className="space-y-4 max-w-2xl">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-300 mb-3">{tr("Thông tin chung", "General information")}</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{tr("ID bài toán", "Problem ID")}</label>
                    <input
                      type="text"
                      value={profile.problemId}
                      onChange={e => setProfile({ ...profile, problemId: e.target.value })}
                      className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{tr("File chính (main file)", "Main file")}</label>
                    <input
                      type="text"
                      value={profile.mainFile}
                      onChange={e => setProfile({ ...profile, mainFile: e.target.value })}
                      className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-300 mb-3">{tr("Ngôn ngữ phổ biến & mẫu lệnh", "Common languages & command examples")}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {[
                    { lang: 'C++17', build: 'g++ -std=c++17 -O2 -pipe -static -s -o solution solution.cpp', run: './solution' },
                    { lang: 'C11', build: 'gcc -std=c11 -O2 -pipe -static -s -o solution solution.c', run: './solution' },
                    { lang: 'Rust', build: 'rustc -C opt-level=3 -o solution solution.rs', run: './solution' },
                    { lang: 'Go', build: 'go build -o solution solution.go', run: './solution' },
                    { lang: 'Java', build: 'javac Solution.java', run: 'java Solution' },
                    { lang: 'Python 3', build: tr('(không cần build)', '(no build required)'), run: 'python3 solution.py' },
                    { lang: 'Node.js', build: tr('(không cần build)', '(no build required)'), run: 'node solution.js' },
                    { lang: 'Pascal', build: 'fpc -O2 -XS solution.pas', run: './solution' },
                    { lang: 'Kotlin', build: 'kotlinc solution.kt -include-runtime -d solution.jar', run: 'kotlin solution.jar' },
                  ].map((l, i) => (
                    <div key={i} className="p-2 bg-slate-900 rounded border border-slate-800">
                      <p className="font-semibold text-blue-400">{l.lang}</p>
                      <p className="font-mono text-slate-500">Build: {l.build}</p>
                      <p className="font-mono text-slate-500">Run: {l.run}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeSection === 'build' ? (
            renderCommandEditor('buildCommands', tr('Lệnh Build', 'Build commands'))
          ) : activeSection === 'run' ? (
            renderCommandEditor('runCommands', tr('Lệnh Run', 'Run commands'))
          ) : activeSection === 'test' ? (
            renderCommandEditor('testCommands', tr('Lệnh Test', 'Test commands'))
          ) : (
            renderEnvEditor()
          )}

          {/* Footer Actions */}
          <div className="mt-4 flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs">{tr("Đóng", "Close")}
            </button>
            <button
              onClick={() => onSave(profile)}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{tr("Lưu hồ sơ chạy", "Save run profile")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
