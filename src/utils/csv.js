/**
 * Utilitário genérico de CSV, sem dependências externas.
 * Usa ';' como separador e BOM UTF-8 para abrir corretamente no Excel em pt-BR
 * (onde a vírgula é separador decimal).
 */

const DEFAULT_DELIMITER = ';';

function escapeCell(value, delimiter) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  const needsQuotes = text.includes(delimiter) || text.includes('"') || /[\r\n]/.test(text);
  return needsQuotes ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * @param {Array<{ header: string, value: (row) => unknown }>} columns
 * @param {Array<object>} rows
 */
export function toCsv(columns, rows, delimiter = DEFAULT_DELIMITER) {
  const headerLine = columns.map((column) => escapeCell(column.header, delimiter)).join(delimiter);
  const bodyLines = rows.map((row) => columns.map((column) => escapeCell(column.value(row), delimiter)).join(delimiter));
  return [headerLine, ...bodyLines].join('\r\n');
}

/** Dispara o download no navegador. Lança erro se o ambiente não suportar. */
export function downloadCsv(filename, csvContent) {
  if (typeof Blob === 'undefined' || typeof URL?.createObjectURL !== 'function') {
    throw new Error('Seu navegador não suporta download de arquivos.');
  }

  const blob = new Blob(['﻿', csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Libera a URL depois que o navegador iniciou o download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Atalho: gera e baixa em uma chamada. Retorna o número de linhas exportadas. */
export function exportToCsv({ filename, columns, rows }) {
  if (!rows?.length) throw new Error('Não há dados para exportar.');
  downloadCsv(filename, toCsv(columns, rows));
  return rows.length;
}
