import PropTypes from 'prop-types';
import { formatDayMonthYear } from '../../utils/dates';
import { formatNumber, formatRate } from '../../utils/formatters';
import { InlineMessage, Skeleton } from '../ui/Feedback';
import { BadgeCheckIcon } from '../ui/Icons';

export default function ConversionResult({ result, status, error, notice, onRetry }) {
  const renderBody = () => {
    if (notice) {
      return <InlineMessage tone="info">{notice}</InlineMessage>;
    }

    if (status === 'error' && !result) {
      return (
        <InlineMessage onRetry={onRetry}>{error?.message ?? 'Não foi possível obter a cotação agora.'}</InlineMessage>
      );
    }

    if (!result) {
      return (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      );
    }

    const { amount, from, to, convertedAmount, rate, date } = result;

    return (
      <>
        <p className="font-mono text-sm text-faint line-through decoration-faint">
          {formatNumber(amount)} {from} =
        </p>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-2 break-all">
          <span className="text-4xl font-bold tracking-tight text-up tabular sm:text-5xl">
            {formatNumber(convertedAmount)}
          </span>
          <span className="text-2xl font-semibold text-ink">{to}</span>
        </p>

        <dl className="mt-6 space-y-1.5 font-mono text-sm">
          <div className="flex justify-between gap-4">
            <dt className="whitespace-nowrap text-muted">Paridade Atual:</dt>
            <dd className="text-right tabular">
              1 {from} = {formatRate(rate, 5)} {to}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Inverso:</dt>
            <dd className="text-right tabular">
              1 {to} = {formatRate(1 / rate)} {from}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted">Ref: {formatDayMonthYear(date)} (BCE)</span>
          <span className="flex items-center gap-1.5 font-mono text-up">
            <BadgeCheckIcon size={15} />
            Fonte BCE
          </span>
        </div>
        {status === 'error' ? (
          <InlineMessage className="mt-4" onRetry={onRetry}>
            Falha ao atualizar. Exibindo a última cotação obtida.
          </InlineMessage>
        ) : null}
      </>
    );
  };

  return (
    <section aria-live="polite" aria-busy={status === 'loading'} className="rounded-xl bg-field p-5 sm:p-6">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Resultado calculado</h3>
      {renderBody()}
    </section>
  );
}

ConversionResult.propTypes = {
  result: PropTypes.shape({
    amount: PropTypes.number.isRequired,
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    convertedAmount: PropTypes.number.isRequired,
    rate: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
  }),
  status: PropTypes.oneOf(['idle', 'loading', 'success', 'error']).isRequired,
  error: PropTypes.instanceOf(Error),
  notice: PropTypes.string,
  onRetry: PropTypes.func.isRequired,
};
