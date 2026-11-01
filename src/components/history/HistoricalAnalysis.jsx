import PropTypes from 'prop-types';
import { PERIODS } from '../../constants';
import { formatDateBR, formatDayMonth } from '../../utils/dates';
import { formatPercent, formatRate, getTrendDirection } from '../../utils/formatters';
import ChangeBadge from '../ui/ChangeBadge';
import { EmptyState, InlineMessage, Skeleton } from '../ui/Feedback';
import { CalendarIcon, ChartBoxIcon, TrendIcon } from '../ui/Icons';
import HistoryChart from './HistoryChart';
import PeriodSelector from './PeriodSelector';
import StatCard from './StatCard';

function StatsGrid({ summary, periodLabel, quoteCode }) {
  const changeDirection = getTrendDirection(summary.changePct, 0.0049);
  const withCode = (value) => `${formatRate(value)} ${quoteCode}`;

  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <StatCard
        label="Taxa atual"
        value={withCode(summary.current.rate)}
        tone="up"
        detail={summary.dailyChangePct !== null ? <ChangeBadge value={summary.dailyChangePct} variant="inline" suffix=" 24h" /> : null}
      />
      <StatCard
        label={`Menor taxa (${periodLabel})`}
        value={withCode(summary.min.rate)}
        detail={`Em ${formatDateBR(summary.min.date)}`}
      />
      <StatCard
        label={`Maior taxa (${periodLabel})`}
        value={withCode(summary.max.rate)}
        detail={`Em ${formatDateBR(summary.max.date)}`}
      />
      <StatCard
        label="Variação total"
        value={formatPercent(summary.changePct)}
        tone={changeDirection === 'flat' ? 'neutral' : changeDirection}
        detail={
          <span className={summary.trend.direction === 'down' ? 'text-down' : summary.trend.direction === 'up' ? 'text-up' : ''}>
            {summary.trend.label}
          </span>
        }
      />
      <StatCard
        label="Média ponderada"
        value={withCode(summary.weightedAverage)}
        tone="accent"
        detail={summary.volatility}
      />
    </dl>
  );
}

StatsGrid.propTypes = {
  summary: PropTypes.object.isRequired,
  periodLabel: PropTypes.string.isRequired,
  quoteCode: PropTypes.string.isRequired,
};

function LoadingState() {
  return (
    <div aria-busy="true" aria-label="Carregando série histórica" className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export default function HistoricalAnalysis({ from, to, periodId, onPeriodChange, history, onRetry }) {
  const { points, summary, range, status, error } = history;
  const period = PERIODS.find((item) => item.id === periodId) ?? PERIODS[0];
  const isSamePair = from === to;
  const hasData = points.length > 0 && summary;

  const renderContent = () => {
    if (isSamePair) {
      return (
        <EmptyState
          title="Selecione moedas diferentes"
          description="A série histórica compara duas moedas distintas. Escolha outra moeda de destino no conversor."
        />
      );
    }
    if (status === 'loading' && !hasData) return <LoadingState />;
    if (status === 'error' && !hasData) {
      return <InlineMessage onRetry={onRetry}>{error?.message ?? 'Não foi possível carregar a série histórica.'}</InlineMessage>;
    }
    if (!hasData) {
      return (
        <EmptyState
          title="Sem cotações no período"
          description={`O BCE não publicou taxas ${from}/${to} entre ${formatDateBR(range.start)} e ${formatDateBR(range.end)}.`}
        />
      );
    }

    return (
      <div className={`space-y-6 transition-opacity ${status === 'loading' ? 'opacity-60' : ''}`}>
        {status === 'error' ? (
          <InlineMessage onRetry={onRetry}>Falha ao atualizar. Exibindo os últimos dados carregados.</InlineMessage>
        ) : null}
        <StatsGrid summary={summary} periodLabel={period.label} quoteCode={to} />
        <HistoryChart points={points} summary={summary} baseCode={from} quoteCode={to} />
        <dl className="grid gap-3 font-mono text-xs text-muted sm:grid-cols-[2fr_1fr_1fr]">
          <div className="flex items-start gap-2">
            <ChartBoxIcon size={16} className="mt-0.5 shrink-0 text-up" />
            <div>
              <dt className="inline">Fonte de dados: </dt>
              <dd className="inline">Frankfurter API (ECB Reference Currency Engine v1)</dd>
            </div>
          </div>
          <div>
            <dt className="inline">Intervalo: </dt>
            <dd className="inline">{summary.observations} observações</dd>
          </div>
          <div title="Média da diferença absoluta entre cotações consecutivas">
            <dt className="inline">Oscilação média diária: </dt>
            <dd className="inline">{formatRate(summary.averageDailyMove)}</dd>
          </div>
        </dl>
      </div>
    );
  };

  return (
    <section aria-labelledby="history-title" aria-busy={status === 'loading'} className="rounded-2xl bg-card p-5 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 id="history-title" className="flex items-center gap-3 text-2xl font-semibold sm:text-3xl">
            <TrendIcon size={26} className="shrink-0 text-up" />
            Série Histórica: {from} para {to}
          </h2>
          <p className="mt-1 max-w-xl text-muted">
            Taxas diárias oficiais consolidadas com índice do Banco Central Europeu
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <PeriodSelector periods={PERIODS} selectedId={periodId} onChange={onPeriodChange} disabled={status === 'loading'} />
          <p className="flex items-center gap-2 rounded-lg bg-panel px-3 py-2 font-mono text-xs text-muted">
            <CalendarIcon size={16} />
            <span>
              <span className="sr-only">Intervalo consultado: </span>
              {formatDateBR(hasData ? points[0].date : range.start)} – {formatDateBR(hasData ? points.at(-1).date : range.end)}
            </span>
          </p>
        </div>
      </div>

      {renderContent()}
      {hasData && status === 'success' ? (
        <p className="sr-only" aria-live="polite">
          Série atualizada: {summary.observations} cotações até {formatDayMonth(points.at(-1).date)}.
        </p>
      ) : null}
    </section>
  );
}

HistoricalAnalysis.propTypes = {
  from: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  periodId: PropTypes.string.isRequired,
  onPeriodChange: PropTypes.func.isRequired,
  history: PropTypes.shape({
    points: PropTypes.array.isRequired,
    summary: PropTypes.object,
    range: PropTypes.shape({ start: PropTypes.string, end: PropTypes.string }).isRequired,
    status: PropTypes.oneOf(['idle', 'loading', 'success', 'error']).isRequired,
    error: PropTypes.instanceOf(Error),
  }).isRequired,
  onRetry: PropTypes.func.isRequired,
};
