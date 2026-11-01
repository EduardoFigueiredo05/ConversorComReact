import PropTypes from 'prop-types';
import { formatRelativeDay } from '../../utils/dates';
import { formatRate } from '../../utils/formatters';
import ChangeBadge from '../ui/ChangeBadge';
import { Skeleton } from '../ui/Feedback';
import { ClockIcon } from '../ui/Icons';

/** Faixa com os principais pares e o estado da última requisição à API. */
export default function MarketTicker({ items, referenceDate, meta, status }) {
  const isLoading = status === 'loading' && items.length === 0;
  const responseOk = meta && status !== 'error';

  return (
    <section aria-label="Principais cotações" className="border-y border-line/60 bg-page">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 overflow-x-auto px-4 py-3 sm:px-8">
        <ul className="flex shrink-0 items-center gap-3">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <li key={index}>
                  <Skeleton className="h-9 w-56" />
                </li>
              ))
            : items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-md border border-line/70 bg-card px-3 py-2 font-mono text-sm"
                >
                  <span className="font-sans font-semibold text-muted">{item.id}</span>
                  <span className="tabular">{formatRate(item.rate)}</span>
                  <ChangeBadge value={item.changePct} />
                </li>
              ))}
        </ul>

        <div className="ml-auto flex shrink-0 items-center gap-3 font-mono text-xs text-muted">
          <span className="flex items-center gap-2">
            <ClockIcon size={14} className="text-up" />
            {referenceDate ? `Sincronização BCE: ${formatRelativeDay(referenceDate)} às 16:00 CET` : 'Sincronizando com o BCE…'}
          </span>
          {meta ? (
            <span className={`rounded px-2 py-1 ${responseOk ? 'bg-up-soft text-up' : 'bg-down-soft text-down'}`}>
              {responseOk ? `${meta.status} OK · ${meta.latencyMs}ms` : 'Falha na última requisição'}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

MarketTicker.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      rate: PropTypes.number,
      changePct: PropTypes.number,
    }),
  ).isRequired,
  referenceDate: PropTypes.string,
  meta: PropTypes.shape({ status: PropTypes.number, latencyMs: PropTypes.number }),
  status: PropTypes.oneOf(['idle', 'loading', 'success', 'error']).isRequired,
};
