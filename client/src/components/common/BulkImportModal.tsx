import React, { useState, useRef } from 'react';
import { exportToCsv, parseCsv } from '../../utils/csvHelper.js';
import { Upload, Download, AlertCircle, CheckCircle2, FileSpreadsheet, X } from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  templateFilename?: string;
  templateHeaders?: string[];
  sampleHeaders?: string[];
  sampleRows?: (string | number)[][] | Record<string, string>[];
  onImport: (rows: Record<string, string>[]) => Promise<{
    success?: boolean;
    createdCount?: number;
    updatedCount?: number;
    errors?: { row?: number; username?: string; identifier?: string; error: string }[];
  } | void>;
  entityName?: string;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  title,
  description = 'Upload an Excel or CSV file to bulk import data into the platform',
  templateFilename,
  templateHeaders,
  sampleHeaders,
  sampleRows = [],
  onImport,
  entityName = 'Records'
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    successCount: number;
    errors: { row?: number; username?: string; identifier?: string; error: string }[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const actualHeaders = sampleHeaders || templateHeaders || [];
  const actualSampleRows: (string | number)[][] = Array.isArray(sampleRows)
    ? (sampleRows.length > 0 && typeof sampleRows[0] === 'object' && !Array.isArray(sampleRows[0])
        ? (sampleRows as Record<string, string>[]).map((rowObj) => actualHeaders.map((h) => rowObj[h] || ''))
        : (sampleRows as (string | number)[][]))
    : [];

  const handleDownloadTemplate = () => {
    exportToCsv(
      templateFilename || `${title.toLowerCase().replace(/\s+/g, '-')}-template.csv`,
      actualHeaders,
      actualSampleRows
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processFile(selectedFile);
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMsg(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const { headers, rows } = parseCsv(text);

        if (rows.length === 0) {
          setErrorMsg('The uploaded CSV file contains no data rows.');
          setParsedHeaders([]);
          setPreviewRows([]);
          return;
        }

        setParsedHeaders(headers);
        setPreviewRows(rows);
      } catch (err: any) {
        setErrorMsg('Failed to parse CSV file: ' + (err.message || 'Unknown error.'));
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (previewRows.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await onImport(previewRows);
      const count = res && typeof res === 'object' ? (res.createdCount ?? res.updatedCount ?? previewRows.length) : previewRows.length;
      setImportResult({
        successCount: count,
        errors: (res && typeof res === 'object' && res.errors) || []
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during bulk import.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedHeaders([]);
    setPreviewRows([]);
    setErrorMsg(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">{title}</h3>
              <p className="text-slate-400 text-xs">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Template Download Prompt */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl gap-3">
            <div className="text-xs text-indigo-900">
              <span className="font-bold block">Need a starting template?</span>
              Download our pre-formatted CSV template with standard columns and examples.
            </div>
            <button
              onClick={handleDownloadTemplate}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex-shrink-0 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Upload Area */}
          {!importResult && (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-slate-800">
                {file ? file.name : 'Click to select or drag and drop a .csv file'}
              </div>
              <p className="text-[11px] text-slate-400">
                Compatible with Microsoft Excel, Google Sheets, and standard CSV format.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Import Result Summary */}
          {importResult && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Bulk Import Finished</h4>
                  <p className="text-xs mt-0.5">
                    Successfully processed <strong>{importResult.successCount}</strong> {entityName}.
                  </p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h5 className="font-bold text-xs text-amber-900 mb-2">
                    {importResult.errors.length} Skipped / Error Rows:
                  </h5>
                  <ul className="text-[11px] text-amber-800 space-y-1 max-h-36 overflow-y-auto">
                    {importResult.errors.map((e, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="font-mono bg-amber-100 px-1 rounded">Row {e.row || '?'}</span>
                        <span>{e.username || e.identifier ? `@${e.username || e.identifier}: ` : ''}{e.error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Live Preview Table */}
          {previewRows.length > 0 && !importResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>CSV Preview ({previewRows.length} rows detected):</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-slate-400 hover:text-slate-600 text-[11px]"
                >
                  Clear File
                </button>
              </div>

              <div className="max-h-48 overflow-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-[11px] text-slate-600">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] sticky top-0">
                    <tr>
                      {parsedHeaders.map((h, i) => (
                        <th key={i} className="py-2 px-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {previewRows.slice(0, 10).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        {parsedHeaders.map((h, cIdx) => (
                          <td key={cIdx} className="py-2 px-3 truncate max-w-[120px]">
                            {row[h] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewRows.length > 10 && (
                <p className="text-[10px] text-slate-400 text-right">
                  Showing first 10 of {previewRows.length} rows
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {importResult ? 'Done' : 'Cancel'}
            </button>

            {!importResult && (
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={previewRows.length === 0 || isProcessing}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Confirm & Import ({previewRows.length} records)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
