/**
 * Utility for RFC 4180 CSV export and parsing with UTF-8 BOM support for Microsoft Excel
 */

/**
 * Exports data to a CSV file and triggers a browser download.
 * Includes UTF-8 Byte Order Mark (\uFEFF) so Excel opens UTF-8 characters without corruption.
 */
export function exportToCsv(
  dataOrFilename: string | Record<string, any>[],
  headersOrFilename?: string | string[],
  maybeRows?: (string | number | boolean | null | undefined)[][]
): void {
  let filename = 'export.csv';
  let headers: string[] = [];
  let rows: (string | number | boolean | null | undefined)[][] = [];

  if (Array.isArray(dataOrFilename)) {
    filename = typeof headersOrFilename === 'string' ? headersOrFilename : 'export.csv';
    if (dataOrFilename.length > 0) {
      headers = Object.keys(dataOrFilename[0]);
      rows = dataOrFilename.map((item) => headers.map((h) => item[h]));
    }
  } else {
    filename = dataOrFilename;
    headers = Array.isArray(headersOrFilename) ? headersOrFilename : [];
    rows = maybeRows || [];
  }

  const escapeCell = (cell: string | number | boolean | null | undefined): string => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const headerLine = headers.map(escapeCell).join(',');
  const rowLines = rows.map((row) => row.map(escapeCell).join(','));
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses a standard CSV string into headers and records.
 * Supports quoted cells, commas within quotes, CRLF, and LF line breaks.
 */
export function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  // Strip BOM if present
  let cleanText = text.replace(/^\uFEFF/, '').trim();
  if (!cleanText) {
    return { headers: [], rows: [] };
  }

  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        if (char === '\r') i++; // skip \n
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  // Push last remaining cell
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const rawHeaders = lines[0].map((h) => h.replace(/^["']|["']$/g, '').trim());
  const rows: Record<string, string>[] = [];

  for (let r = 1; r < lines.length; r++) {
    const rowObj: Record<string, string> = {};
    const rowCells = lines[r];
    rawHeaders.forEach((header, idx) => {
      rowObj[header] = rowCells[idx] !== undefined ? rowCells[idx].replace(/^["']|["']$/g, '') : '';
    });
    rows.push(rowObj);
  }

  return { headers: rawHeaders, rows };
}
