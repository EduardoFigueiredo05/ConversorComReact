import { CURRENCY_GROUPS, CURRENCY_PRIORITY } from '../constants';
import { formatNumber, normalizeText } from './formatters';

export const SORT_FIELDS = {
  code: { label: 'Código', compare: (a, b) => a.code.localeCompare(b.code) },
  name: { label: 'Nome', compare: (a, b) => a.name.localeCompare(b.name, 'pt-BR') },
  rateInLocal: { label: 'Taxa em BRL', compare: (a, b) => (a.rateInLocal ?? -Infinity) - (b.rateInLocal ?? -Infinity) },
  rateInGlobal: { label: 'Taxa em USD', compare: (a, b) => (a.rateInGlobal ?? -Infinity) - (b.rateInGlobal ?? -Infinity) },
};

const priorityIndex = (code) => {
  const index = CURRENCY_PRIORITY.indexOf(code);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

/** Ordem padrão (relevância), usada quando nenhuma coluna está ordenada. */
const compareByRelevance = (a, b) => priorityIndex(a.code) - priorityIndex(b.code) || a.code.localeCompare(b.code);

export function filterRows(rows, { query, groupId }) {
  const group = CURRENCY_GROUPS.find((item) => item.id === groupId);
  const allowed = group?.codes ? new Set(group.codes) : null;
  const term = normalizeText(query);

  return rows.filter((row) => {
    if (allowed && !allowed.has(row.code)) return false;
    if (!term) return true;
    return normalizeText(row.code).includes(term) || normalizeText(row.name).includes(term);
  });
}

/** Retorna um novo array (não muta `rows`). sort = { field, direction: 'asc' | 'desc' } | null */
export function sortRows(rows, sort) {
  const sorted = [...rows];
  if (!sort || !SORT_FIELDS[sort.field]) return sorted.sort(compareByRelevance);
  const { compare } = SORT_FIELDS[sort.field];
  const factor = sort.direction === 'desc' ? -1 : 1;
  return sorted.sort((a, b) => compare(a, b) * factor || a.code.localeCompare(b.code));
}

export function paginate(rows, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  return {
    pageRows: rows.slice(startIndex, startIndex + pageSize),
    page: safePage,
    totalPages,
    firstItem: rows.length ? startIndex + 1 : 0,
    lastItem: Math.min(startIndex + pageSize, rows.length),
  };
}

/** Ciclo de ordenação ao clicar no cabeçalho: crescente → decrescente → padrão. */
export function nextSort(currentSort, field) {
  if (currentSort?.field !== field) return { field, direction: 'asc' };
  if (currentSort.direction === 'asc') return { field, direction: 'desc' };
  return null;
}

/**
 * Linhas do CSV: conversão do valor do conversor (moeda base) para cada moeda listada.
 * Como as taxas estão em BRL, 1 base = rateInLocal(base) / rateInLocal(destino).
 */
export function buildCsvExport({ rows, allRows, baseCode, amount }) {
  const baseRow = allRows.find((row) => row.code === baseCode);
  const baseInLocal = baseRow?.rateInLocal ?? null;

  const csvRows = rows.map((row) => {
    const rate = baseInLocal && row.rateInLocal ? baseInLocal / row.rateInLocal : null;
    return { ...row, baseCode, rate, convertedAmount: rate !== null ? amount * rate : null };
  });

  const numberCell = (value, digits) => (Number.isFinite(value) ? formatNumber(value, digits).replace(/\./g, '') : '');

  const columns = [
    { header: 'Data da cotação', value: (row) => row.date },
    { header: 'Moeda base', value: (row) => row.baseCode },
    { header: 'Moeda de destino', value: (row) => row.code },
    { header: 'Nome da moeda', value: (row) => row.name },
    { header: 'Taxa (1 base = X destino)', value: (row) => numberCell(row.rate, 6) },
    { header: `Valor base (${baseCode})`, value: () => numberCell(amount, 2) },
    { header: 'Valor convertido', value: (row) => numberCell(row.convertedAmount, 2) },
    { header: 'Taxa em BRL', value: (row) => numberCell(row.rateInLocal, 6) },
    { header: 'Taxa em USD', value: (row) => numberCell(row.rateInGlobal, 6) },
    { header: 'Variação 24h (%)', value: (row) => numberCell(row.change24h, 2) },
  ];

  return { columns, rows: csvRows };
}
