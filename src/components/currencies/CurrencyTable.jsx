import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { CURRENCY_GROUPS, TABLE_PAGE_SIZE } from '../../constants';
import { useDebounce } from '../../hooks/useDebounce';
import { buildCsvExport, filterRows, nextSort, paginate, sortRows } from '../../utils/currencyTable';
import { exportToCsv } from '../../utils/csv';
import { formatRate } from '../../utils/formatters';
import ChangeBadge from '../ui/ChangeBadge';
import CurrencyBadge from '../ui/CurrencyBadge';
import { EmptyState, InlineMessage, Skeleton } from '../ui/Feedback';
import { DownloadIcon, SearchIcon } from '../ui/Icons';
import Pagination from './Pagination';
import SortableHeader from './SortableHeader';
import Sparkline from './Sparkline';

const COLUMN_COUNT = 7;

function LoadingRows() {
  return Array.from({ length: TABLE_PAGE_SIZE }, (_, index) => (
    <tr key={index} className="border-t border-line/60">
      <td colSpan={COLUMN_COUNT} className="px-5 py-4">
        <Skeleton className="h-7 w-full" />
      </td>
    </tr>
  ));
}

export default function CurrencyTable({ rows, status, error, selectedCode, converterBase, converterAmount, onSelectCurrency, onRetry, onNotify }) {
  const [query, setQuery] = useState('');
  const [groupId, setGroupId] = useState('all');
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebounce(query, 250);

  // Filtrar → ordenar → paginar: funções puras em utils, memorizadas aqui.
  const visibleRows = useMemo(
    () => sortRows(filterRows(rows, { query: debouncedQuery, groupId }), sort),
    [rows, debouncedQuery, groupId, sort],
  );
  const pagination = paginate(visibleRows, page, TABLE_PAGE_SIZE);

  const resetPage = () => setPage(1);

  const handleSearchChange = (event) => {
    setQuery(event.target.value);
    resetPage();
  };

  const handleGroupChange = (nextGroupId) => {
    setGroupId(nextGroupId);
    resetPage();
  };

  const handleSort = (field) => {
    setSort((current) => nextSort(current, field));
    resetPage();
  };

  const handleExport = () => {
    try {
      const { columns, rows: csvRows } = buildCsvExport({
        rows: visibleRows,
        allRows: rows,
        baseCode: converterBase,
        amount: converterAmount,
      });
      const date = visibleRows[0]?.date ?? 'cotacoes';
      const total = exportToCsv({ filename: `cotacoes-${converterBase}-${date}.csv`, columns, rows: csvRows });
      onNotify(`CSV exportado com ${total} ${total === 1 ? 'moeda' : 'moedas'}.`, 'success');
    } catch (exportError) {
      onNotify(exportError.message || 'Não foi possível exportar o CSV.', 'error');
    }
  };

  const isInitialLoading = status === 'loading' && rows.length === 0;
  const canExport = visibleRows.length > 0;

  const renderBody = () => {
    if (isInitialLoading) return <LoadingRows />;

    if (status === 'error' && rows.length === 0) {
      return (
        <tr>
          <td colSpan={COLUMN_COUNT} className="p-5">
            <InlineMessage onRetry={onRetry}>{error?.message ?? 'Não foi possível carregar as moedas.'}</InlineMessage>
          </td>
        </tr>
      );
    }

    if (pagination.pageRows.length === 0) {
      return (
        <tr>
          <td colSpan={COLUMN_COUNT}>
            <EmptyState
              title="Nenhuma moeda encontrada"
              description={
                debouncedQuery
                  ? `Nenhum resultado para “${debouncedQuery}”. Tente o código (ex: EUR) ou parte do nome.`
                  : 'Não há moedas neste filtro.'
              }
              action={
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setGroupId('all');
                    resetPage();
                  }}
                  className="mt-2 rounded-md bg-panel px-4 py-2 text-sm text-up hover:bg-[#243049]"
                >
                  Limpar filtros
                </button>
              }
            />
          </td>
        </tr>
      );
    }

    return pagination.pageRows.map((row) => {
      const isSelected = row.code === selectedCode;
      return (
        <tr
          key={row.code}
          className={`border-t border-line/60 transition-colors hover:bg-panel/60 ${isSelected ? 'bg-up-soft/40' : ''}`}
        >
          <th scope="row" className="px-5 py-4 text-left">
            <span className="flex items-center gap-3 text-lg font-semibold">
              <CurrencyBadge code={row.code} />
              {row.code}
            </span>
          </th>
          <td className="whitespace-nowrap px-5 py-4 text-lg text-ink/90">{row.name}</td>
          <td className="px-5 py-4 text-right font-mono text-lg tabular">R$ {formatRate(row.rateInLocal)}</td>
          <td className="px-5 py-4 text-right font-mono text-lg tabular">$ {formatRate(row.rateInGlobal)}</td>
          <td className="px-5 py-4 text-center">
            <ChangeBadge value={row.change24h} />
          </td>
          <td className="px-5 py-4">
            <div className="flex justify-center">
              <Sparkline values={row.trend} label={`Tendência de ${row.code} nos últimos ${row.trend.length} pregões`} />
            </div>
          </td>
          <td className="px-5 py-4 text-center">
            <button
              type="button"
              onClick={() => onSelectCurrency(row.code)}
              aria-label={`Usar ${row.code} (${row.name}) no conversor`}
              className="rounded-md bg-panel px-3 py-1.5 font-mono text-sm text-up transition-colors hover:bg-up-soft"
            >
              Converter
            </button>
          </td>
        </tr>
      );
    });
  };

  return (
    <section aria-labelledby="currencies-title" className="rounded-2xl bg-card p-5 sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 id="currencies-title" className="flex flex-wrap items-center gap-3 text-2xl font-semibold sm:text-3xl">
            Moedas Disponíveis
            <span className="rounded-full bg-up-soft px-3 py-1 font-mono text-xs font-medium text-up">
              {rows.length} Suportadas
            </span>
          </h2>
          <p className="mt-1 text-muted">Consulta direta de paridades e oscilações do mercado referenciadas pelo BCE</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative sm:w-96">
            <label htmlFor="currency-search" className="sr-only">
              Buscar moeda por código ou nome
            </label>
            <SearchIcon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="currency-search"
              type="search"
              value={query}
              onChange={handleSearchChange}
              placeholder="Buscar por código ou nome (ex: EUR, Libra)..."
              autoComplete="off"
              className="w-full rounded-lg border border-transparent bg-panel py-3 pl-11 pr-4 text-sm text-ink placeholder:text-faint focus:border-up focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={!canExport}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#26324a] px-5 py-3 font-semibold transition-colors hover:bg-[#2d3a55] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <DownloadIcon size={18} />
            Exportar CSV
          </button>
        </div>
      </div>

      <div role="group" aria-label="Filtrar por região" className="mt-6 flex flex-wrap gap-2">
        {CURRENCY_GROUPS.map((group) => {
          const isActive = group.id === groupId;
          return (
            <button
              key={group.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleGroupChange(group.id)}
              className={`rounded-full px-4 py-1.5 font-mono text-sm transition-colors ${
                isActive ? 'bg-accent text-white' : 'bg-panel text-ink/90 hover:bg-[#243049]'
              }`}
            >
              {group.label}
              {group.id === 'all' ? ` (${rows.length})` : ''}
            </button>
          );
        })}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl bg-field">
        <table className="w-full min-w-[960px] border-collapse">
          <caption className="sr-only">
            Moedas suportadas pelo BCE com taxa em BRL, taxa em USD, variação do último pregão e tendência recente
          </caption>
          <thead className="bg-panel text-sm font-semibold text-muted">
            <tr>
              <SortableHeader field="code" label="Código / Moeda" sort={sort} onSort={handleSort} />
              <SortableHeader field="name" label="Nome oficial" sort={sort} onSort={handleSort} />
              <SortableHeader field="rateInLocal" label="Taxa em BRL" sort={sort} onSort={handleSort} align="right" />
              <SortableHeader field="rateInGlobal" label="Taxa em USD" sort={sort} onSort={handleSort} align="right" />
              <th scope="col" className="px-5 py-4 text-center uppercase tracking-wide">
                Variação 24h
              </th>
              <th scope="col" className="px-5 py-4 text-center uppercase tracking-wide">
                Tendência (7D)
              </th>
              <th scope="col" className="px-5 py-4 text-center uppercase tracking-wide">
                Ação
              </th>
            </tr>
          </thead>
          <tbody aria-busy={isInitialLoading}>{renderBody()}</tbody>
        </table>
      </div>

      {status === 'error' && rows.length > 0 ? (
        <InlineMessage className="mt-4" onRetry={onRetry}>
          Falha ao atualizar as cotações. Exibindo os últimos dados carregados.
        </InlineMessage>
      ) : null}

      <div className="mt-6 flex flex-col items-center justify-between gap-4 lg:flex-row">
        <p className="text-sm text-muted" aria-live="polite">
          Exibindo{' '}
          <strong className="text-ink">
            {pagination.firstItem}–{pagination.lastItem}
          </strong>{' '}
          de <strong className="text-ink">{visibleRows.length}</strong> moedas
          {visibleRows.length === rows.length ? ' suportadas pelo BCE' : ' filtradas'}
        </p>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
      </div>
    </section>
  );
}

CurrencyTable.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      rateInLocal: PropTypes.number,
      rateInGlobal: PropTypes.number,
      change24h: PropTypes.number,
      trend: PropTypes.arrayOf(PropTypes.number).isRequired,
      date: PropTypes.string.isRequired,
    }),
  ).isRequired,
  status: PropTypes.oneOf(['idle', 'loading', 'success', 'error']).isRequired,
  error: PropTypes.instanceOf(Error),
  selectedCode: PropTypes.string,
  converterBase: PropTypes.string.isRequired,
  converterAmount: PropTypes.number.isRequired,
  onSelectCurrency: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired,
  onNotify: PropTypes.func.isRequired,
};
