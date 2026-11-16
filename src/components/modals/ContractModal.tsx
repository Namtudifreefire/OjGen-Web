import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';
import { X, CheckCircle2, AlertCircle, Download, Upload, FileText, Copy, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface ValidatorContract {
  id: string;
  name: string;
  acceptPatterns: string[]; // glob patterns or regex
  rejectPatterns: string[];
  description: string;
}

interface CheckerContract {
  id: string;
  name: string;
  type: 'token' | 'float' | 'custom' | 'testlib';
  tolerance?: { rel: number; abs: number };
  customCode?: string;
  description: string;
}

interface OjContractData {
  version: number;
  validators: ValidatorContract[];
  checkers: CheckerContract[];
}

const DEFAULT_CONTRACT: OjContractData = {
  version: 1,
  validators: [
    {
      id: 'default-validator',
      name: 'Validator mặc định',
      acceptPatterns: ['*.inp', '*.in'],
      rejectPatterns: [],
      description: 'Chấp nhận mọi file input có đuôi .inp hoặc .in',
    },
  ],
  checkers: [
    {
      id: 'default-checker',
      name: 'Checker token chuẩn',
      type: 'token',
      description: 'So sánh từng token (tách bởi whitespace)',
    },
    {
      id: 'float-checker',
      name: 'Checker số thực',
      type: 'float',
      tolerance: { rel: 1e-6, abs: 1e-8 },
      description: 'So sánh số thực với sai số tương đối 1e-6 và tuyệt đối 1e-8',
    },
  ],
};
const EN_DEFAULT_CONTRACT: OjContractData = {
  ...DEFAULT_CONTRACT,
  validators: [{ ...DEFAULT_CONTRACT.validators[0], name: 'Default validator', description: 'Accept input files ending in .inp or .in' }],
  checkers: [
    { ...DEFAULT_CONTRACT.checkers[0], name: 'Standard token checker', description: 'Compare whitespace-separated tokens' },
    { ...DEFAULT_CONTRACT.checkers[1], name: 'Floating-point checker', description: 'Compare floating-point values with relative tolerance 1e-6 and absolute tolerance 1e-8' },
  ],
};

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: OjContractData) => void;
  initialContract?: OjContractData;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialContract,
}) => {
  const { language } = useTranslation();
  const tr = (vi: string, en: string) => language === 'en' ? en : vi;
  const [contract, setContract] = useState<OjContractData>(initialContract || DEFAULT_CONTRACT);
  const [activeTab, setActiveTab] = useState<'validators' | 'checkers'>('validators');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [jsonView, setJsonView] = useState(false);
  useEffect(() => {
    if (initialContract) return;
    setContract(current => {
      if (current !== DEFAULT_CONTRACT && current !== EN_DEFAULT_CONTRACT) return current;
      return language === 'en' ? EN_DEFAULT_CONTRACT : DEFAULT_CONTRACT;
    });
  }, [language, initialContract]);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedItems(next);
  };

  const addValidator = () => {
    const newValidator: ValidatorContract = {
      id: `validator-${Date.now()}`,
      name: `${tr('Validator mới', 'New validator')} ${contract.validators.length + 1}`,
      acceptPatterns: ['*.inp'],
      rejectPatterns: [],
      description: '',
    };
    setContract({ ...contract, validators: [...contract.validators, newValidator] });
  };

  const addChecker = () => {
    const newChecker: CheckerContract = {
      id: `checker-${Date.now()}`,
      name: `${tr('Checker mới', 'New checker')} ${contract.checkers.length + 1}`,
      type: 'token',
      description: '',
    };
    setContract({ ...contract, checkers: [...contract.checkers, newChecker] });
  };

  const updateValidator = (id: string, updates: Partial<ValidatorContract>) => {
    setContract({
      ...contract,
      validators: contract.validators.map(v => v.id === id ? { ...v, ...updates } : v),
    });
  };

  const updateChecker = (id: string, updates: Partial<CheckerContract>) => {
    setContract({
      ...contract,
      checkers: contract.checkers.map(c => c.id === id ? { ...c, ...updates } : c),
    });
  };

  const removeValidator = (id: string) => {
    setContract({ ...contract, validators: contract.validators.filter(v => v.id !== id) });
  };

  const removeChecker = (id: string) => {
    setContract({ ...contract, checkers: contract.checkers.filter(c => c.id !== id) });
  };

  const handleJsonPaste = () => {
    try {
      const text = prompt(tr('Dán JSON contract:', 'Paste contract JSON:'));
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.validators && parsed.checkers) {
          setContract(parsed);
        } else {
          alert(tr('JSON không đúng định dạng contract.', 'JSON is not a valid contract.'));
        }
      }
    } catch (e: any) {
      alert(tr(`Lỗi parse JSON: ${e.message}`, `JSON parse error: ${e.message}`));
    }
  };

  const downloadContract = () => {
    const blob = new Blob([JSON.stringify(contract, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contract.ojcontract.json';
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
        if (parsed.validators && parsed.checkers) {
          setContract(parsed);
        } else {
          alert(tr('File không đúng định dạng contract.', 'The file is not a valid contract.'));
        }
      } catch (err: any) {
        alert(tr(`Lỗi đọc file: ${err.message}`, `Could not read file: ${err.message}`));
      }
    };
    reader.readAsText(file);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(contract, null, 2));
    alert(tr('Đã chép JSON vào clipboard', 'JSON copied to clipboard'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>{tr("Hợp đồng Validator & Checker (.ojcontract.json)", "Validator & checker contract (.ojcontract.json)")}</span>
            </h3>
            <p className="text-xs text-slate-400">{tr("Khai báo ca chấp nhận/từ chối validator và kiểu checker cho GUI, audit và CLI", "Define validator accept/reject patterns and checker types for GUI, audit and CLI")}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleJsonPaste} className="px-2.5 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />{tr("Nhập JSON", "Import JSON")}
            </button>
            <button onClick={downloadContract} className="px-2.5 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />{tr("Xuất file", "Export file")}
            </button>
            <button onClick={copyJson} className="px-2.5 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1">
              <Copy className="w-3.5 h-3.5" /> Copy JSON
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex p-3 bg-slate-950/60 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('validators')}
            className={`px-3 py-1.5 rounded font-medium text-xs transition ${activeTab === 'validators' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Validator ({contract.validators.length})
          </button>
          <button
            onClick={() => setActiveTab('checkers')}
            className={`px-3 py-1.5 rounded font-medium text-xs transition ml-2 ${activeTab === 'checkers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Checker ({contract.checkers.length})
          </button>
          <label className="ml-4 flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
            <input type="checkbox" checked={jsonView} onChange={e => setJsonView(e.target.checked)} className="rounded bg-slate-900 border-slate-700 text-blue-600 w-3.5 h-3.5" />{tr("Xem JSON thô", "View raw JSON")}
          </label>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {jsonView ? (
            <div className="h-[500px] bg-slate-950 border border-slate-800 rounded-lg p-3 overflow-auto">
              <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap">{JSON.stringify(contract, null, 2)}</pre>
            </div>
          ) : activeTab === 'validators' ? (
            <div className="space-y-3">
              <button
                onClick={addValidator}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition"
              >
                <Plus className="w-3.5 h-3.5" />{tr("Thêm Validator", "Add validator")}
              </button>

              {contract.validators.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs italic">{tr("Chưa có validator nào", "No validators yet")}</div>
              )}

              {contract.validators.map((v, idx) => {
                const expanded = expandedItems.has(v.id);
                return (
                  <div key={v.id} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleExpand(v.id)}
                      className="w-full p-3 flex items-center justify-between hover:bg-slate-900/60 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>
                          <ChevronDown className="w-4 h-4" />
                        </span>
                        <div>
                          <input
                            type="text"
                            value={v.name}
                            onChange={e => updateValidator(v.id, { name: e.target.value })}
                            className="font-semibold text-slate-100 bg-transparent border-b border-slate-700 focus:border-blue-500 focus:outline-none px-1 py-0.5"
                            placeholder={tr("Tên validator", "Validator name")}
                          />
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">{v.id}</p>
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); removeValidator(v.id); }}
                        className="p-1 text-slate-400 hover:text-red-400 transition"
                        title={tr("Xóa validator", "Delete validator")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </button>

                    {expanded && (
                      <div className="p-3 border-t border-slate-800 space-y-3 bg-slate-900/50">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">{tr("Ca chấp nhận (Accept patterns - glob/regex, mỗi dòng một)", "Accept patterns (glob/regex, one per line)")}</label>
                          <textarea
                            rows={3}
                            value={v.acceptPatterns.join('\n')}
                            onChange={e => updateValidator(v.id, { acceptPatterns: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                            className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                            placeholder="*.inp&#10;test*.in&#10;data/sample/*"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">{tr("Ca từ chối (Reject patterns - glob/regex, mỗi dòng một)", "Reject patterns (glob/regex, one per line)")}</label>
                          <textarea
                            rows={2}
                            value={v.rejectPatterns.join('\n')}
                            onChange={e => updateValidator(v.id, { rejectPatterns: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                            className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                            placeholder="*.tmp&#10;*.bak"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">{tr("Mô tả", "Description")}</label>
                          <textarea
                            rows={2}
                            value={v.description}
                            onChange={e => updateValidator(v.id, { description: e.target.value })}
                            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                            placeholder={tr("Mô tả validator này...", "Describe this validator...")}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={addChecker}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition"
              >
                <Plus className="w-3.5 h-3.5" />{tr("Thêm Checker", "Add checker")}
              </button>

              {contract.checkers.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs italic">{tr("Chưa có checker nào", "No checkers yet")}</div>
              )}

              {contract.checkers.map((c, idx) => {
                const expanded = expandedItems.has(c.id);
                return (
                  <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleExpand(c.id)}
                      className="w-full p-3 flex items-center justify-between hover:bg-slate-900/60 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>
                          <ChevronDown className="w-4 h-4" />
                        </span>
                        <div>
                          <input
                            type="text"
                            value={c.name}
                            onChange={e => updateChecker(c.id, { name: e.target.value })}
                            className="font-semibold text-slate-100 bg-transparent border-b border-slate-700 focus:border-blue-500 focus:outline-none px-1 py-0.5"
                            placeholder={tr("Tên checker", "Checker name")}
                          />
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">{c.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={c.type}
                          onChange={e => updateChecker(c.id, { type: e.target.value as any })}
                          className="text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        >
                          <option value="token">Token Compare</option>
                          <option value="float">Float Compare</option>
                          <option value="testlib">Testlib (C++)</option>
                          <option value="custom">Custom Code</option>
                        </select>
                        <button
                          onClick={e => { e.stopPropagation(); removeChecker(c.id); }}
                          className="p-1 text-slate-400 hover:text-red-400 transition"
                          title={tr("Xóa checker", "Delete checker")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </button>

                    {expanded && (
                      <div className="p-3 border-t border-slate-800 space-y-3 bg-slate-900/50">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">{tr("Loại checker", "Checker type")}</label>
                          <select
                            value={c.type}
                            onChange={e => updateChecker(c.id, { type: e.target.value as any })}
                            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                          >
                            <option value="token">{tr("Token Compare (so sánh từng từ)", "Token comparison")}</option>
                            <option value="float">{tr("Float Compare (sai số số thực)", "Float comparison")}</option>
                            <option value="testlib">Testlib (C++ checker_testlib.cpp)</option>
                            <option value="custom">{tr("Custom Code (JS/Python tự viết)", "Custom code (JS/Python)")}</option>
                          </select>
                        </div>

                        {c.type === 'float' && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-300 mb-1">{tr("Sai số tương đối (rel_tol)", "Relative tolerance (rel_tol)")}</label>
                              <input
                                type="number"
                                step="0.000001"
                                value={c.tolerance?.rel || 1e-6}
                                onChange={e => updateChecker(c.id, { tolerance: { ...c.tolerance!, rel: parseFloat(e.target.value) } })}
                                className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-300 mb-1">{tr("Sai số tuyệt đối (abs_tol)", "Absolute tolerance (abs_tol)")}</label>
                              <input
                                type="number"
                                step="0.000001"
                                value={c.tolerance?.abs || 1e-8}
                                onChange={e => updateChecker(c.id, { tolerance: { ...c.tolerance!, abs: parseFloat(e.target.value) } })}
                                className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        )}

                        {c.type === 'custom' && (
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">{tr("Mã nguồn custom (JavaScript function check(input, output, expected))", "Custom source (JavaScript function check(input, output, expected))")}</label>
                            <textarea
                              rows={6}
                              value={c.customCode || ''}
                              onChange={e => updateChecker(c.id, { customCode: e.target.value })}
                              className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 focus:outline-none focus:border-blue-500"
                              placeholder={tr('// Trả về true nếu đúng, false nếu sai\nfunction check(input, output, expected) {\n  return output.trim() === expected.trim();\n}', '// Return true for a correct answer\nfunction check(input, output, expected) {\n  return output.trim() === expected.trim();\n}')}
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">{tr("Mô tả", "Description")}</label>
                          <textarea
                            rows={2}
                            value={c.description}
                            onChange={e => updateChecker(c.id, { description: e.target.value })}
                            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                            placeholder={tr("Mô tả checker này...", "Describe this checker...")}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-4 flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs">{tr("Đóng", "Close")}
            </button>
            <button
              onClick={() => onSave(contract)}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{tr("Lưu hợp đồng", "Save contract")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
