import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Sparkles
} from 'lucide-react';
import { csvApi } from '../services/api';

export const CsvImportPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setPreviewRows([]);
    }
  };

  const handleUploadAndPreview = async () => {
    if (!file) {
      setError('Please select a CSV file first.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await csvApi.preview(formData);
      setPreviewRows(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process CSV file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewRows || previewRows.length === 0) return;

    setIsConfirming(true);
    try {
      await csvApi.confirm(previewRows);
      setSuccessMsg(`Successfully imported ${previewRows.length} transactions!`);
      setTimeout(() => {
        navigate('/transactions');
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to import transactions.');
    } finally {
      setIsConfirming(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent =
      'date,description,amount,type\n' +
      '2026-09-23,Lunch at canteen,120,expense\n' +
      '2026-09-23,Uber to college,180,expense\n' +
      '2026-09-22,Freelance payment,2000,income\n' +
      '2026-09-21,Netflix monthly subscription,199,expense\n' +
      '2026-09-20,Pizza Hut dinner with friends,450,expense\n' +
      '2026-09-18,Celebration dinner at restaurant,1800,expense\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_student_transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">CSV Transaction Import</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Bulk import your bank statements with automated AI categorization and outlier validation.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 text-[#34d399] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload Zone Card */}
      <div className="fin-card p-6 sm:p-10 border border-white/[0.08] text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#10b981] mb-4">
          <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">Select or Drop Your Transaction CSV</h3>
        <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
          Required column headers: <code className="text-[#34d399] font-mono">date</code>,{' '}
          <code className="text-[#34d399] font-mono">description</code>,{' '}
          <code className="text-[#34d399] font-mono">amount</code>,{' '}
          <code className="text-[#34d399] font-mono">type</code> (expense / income).
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <label className="px-5 py-2.5 rounded-full bg-[#10b981] hover:bg-[#34d399] text-[#042f1a] font-bold text-xs shadow-sm cursor-pointer transition active:scale-95">
            <span>Browse CSV File</span>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>

          <button
            type="button"
            onClick={downloadSampleCsv}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold border border-white/[0.08] transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sample CSV</span>
          </button>
        </div>

        {file && (
          <div className="mt-6 p-3 rounded-xl bg-[#0c0e12] border border-white/[0.08] flex flex-wrap items-center justify-center gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-[#10b981]" />
              <span className="text-white font-medium">{file.name}</span>
              <span className="text-slate-500 font-mono-numbers">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button
              onClick={handleUploadAndPreview}
              disabled={isUploading}
              className="px-3.5 py-1.5 rounded-full bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30 font-bold hover:bg-[#10b981]/30 transition disabled:opacity-50"
            >
              {isUploading ? 'Analyzing...' : 'Run AI Preview'}
            </button>
          </div>
        )}
      </div>

      {/* AI Preview Section */}
      {previewRows.length > 0 && (
        <div className="fin-card p-4 sm:p-6 border border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#10b981]" />
              <h3 className="text-sm font-bold text-white font-display">
                AI Categorization Preview ({previewRows.length} Rows)
              </h3>
            </div>
            <button
              onClick={handleConfirmImport}
              disabled={isConfirming}
              className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-full bg-[#10b981] hover:bg-[#34d399] text-[#042f1a] font-bold text-xs transition active:scale-95 disabled:opacity-50"
            >
              <span>{isConfirming ? 'Importing...' : 'Confirm & Save Transactions'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Description</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold">AI Category</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Confidence</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Anomaly</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{row.date}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{row.description}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          row.type === 'income' ? 'bg-[#10b981]/15 text-[#34d399]' : 'bg-white/[0.04] text-slate-400'
                        }`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#10b981]/10 text-[#34d399] border border-[#10b981]/25">
                        {row.ai_category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-numbers text-[#10b981] font-semibold">
                      {(row.confidence * 100).toFixed(0)}%
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono-numbers font-bold ${
                        row.type === 'income' ? 'text-[#10b981]' : 'text-slate-100'
                      }`}
                    >
                      {row.type === 'income' ? '+' : '-'}₹{row.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {row.is_anomaly ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Unusual
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Normal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
