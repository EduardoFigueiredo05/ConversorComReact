import PropTypes from 'prop-types';

const MAX_VISIBLE_PAGES = 5;

function visiblePages(page, totalPages) {
  const half = Math.floor(MAX_VISIBLE_PAGES / 2);
  const start = Math.max(1, Math.min(page - half, totalPages - MAX_VISIBLE_PAGES + 1));
  const end = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const navButton =
    'rounded-md px-3 py-2 text-sm transition-colors enabled:hover:bg-panel enabled:hover:text-ink disabled:cursor-not-allowed disabled:text-faint';

  return (
    <nav aria-label="Paginação da tabela de moedas" className="flex flex-wrap items-center justify-center gap-1.5">
      <button type="button" className={`${navButton} text-muted`} onClick={() => onPageChange(page - 1)} disabled={page === 1}>
        Anterior
      </button>
      {visiblePages(page, totalPages).map((pageNumber) => {
        const isCurrent = pageNumber === page;
        return (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={`Página ${pageNumber}`}
            className={`grid h-10 w-10 place-items-center rounded-md text-sm font-semibold transition-colors ${
              isCurrent ? 'bg-up-strong text-emerald-950' : 'bg-panel text-ink hover:bg-[#243049]'
            }`}
          >
            {pageNumber}
          </button>
        );
      })}
      <button
        type="button"
        className={`${navButton} text-ink`}
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Próximo
      </button>
    </nav>
  );
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};
