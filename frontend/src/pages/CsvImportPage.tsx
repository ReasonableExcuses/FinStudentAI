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
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-white">CSV Transaction Import</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Bulk import your bank or expense exports with automatic AI categorization and outlier evaluation.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload Zone Card */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">Select or Drop Your Transaction CSV</h3>
        <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
          Required column headers: <code className="text-brand-300 font-mono">date</code>,{' '}
          <code className="text-brand-300 font-mono">description</code>,{' '}
          <code className="text-brand-300 font-mono">amount</code>,{' '}
          <code className="text-brand-300 font-mono">type</code> (expense / income).
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <label className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 cursor-pointer transition">
            <span>Browse CSV File</span>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>

          <button
            type="button"
            onClick={downloadSampleCsv}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sample CSV</span>
          </button>
        </div>

        {file && (
          <div className="mt-6 p-3 rounded-xl bg-slate-900 border border-slate-700/80 inline-flex items-center space-x-3 text-xs">
            <FileSpreadsheet className="w-4 h-4 text-brand-400" />
            <span className="text-white font-medium">{file.name}</span>
            <span className="text-slate-500 font-mono">({(file.size / 1024).toFixed(1)} KB)</span>
            <button
              onClick={handleUploadAndPreview}
              disabled={isUploading}
              className="ml-3 px-3 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold hover:bg-teal-500/30 transition disabled:opacity-50"
            >
              {isUploading ? 'Analyzing...' : 'Run AI Preview'}
            </button>
          </div>
        )}
      </div>

      {/* AI Preview Section */}
      {previewRows.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white font-display">
                AI Categorization Preview ({previewRows.length} Rows)
              </h3>
            </div>
            <button
              onClick={handleConfirmImport}
              disabled={isConfirming}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition disabled:opacity-50"
            >
              <span>{isConfirming ? 'Importing...' : 'Confirm & Save Transactions'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">AI Category</th>
                  <th className="pb-3 font-semibold text-center">Confidence</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                  <th className="pb-3 font-semibold text-center">Anomaly</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2.5 text-slate-400 whitespace-nowrap">{row.date}</td>
                    <td className="py-2.5 font-medium text-white">{row.description}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          row.type === 'income' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-500/10 text-brand-300 border border-brand-500/20">
                        {row.ai_category}
                      </span>
                    </td>
                    <td className="py-2.5 text-center font-mono text-brand-400 font-semibold">
                      {(row.confidence * 100).toFixed(0)}%
                    </td>
                    <td
                      className={`py-2.5 text-right font-mono font-bold ${
                        row.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {row.type === 'income' ? '+' : '-'}₹{row.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-center">
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
