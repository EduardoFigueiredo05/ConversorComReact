import PropTypes from 'prop-types';
import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MOVING_AVERAGE_WINDOW } from '../../constants';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { formatDayMonth, formatDayMonthYear, todayIso } from '../../utils/dates';
import { formatPercent, formatRate } from '../../utils/formatters';
import { percentChange } from '../../utils/rates';

const COLORS = {
  line: '#34d399',
  movingAverage: '#a5b4fc',
  grid: '#243049',
  axis: '#9aa6bd',
  peak: '#34d399',
};


/** Datas exibidas no eixo X: distribuídas uniformemente, garantindo o pico e o último ponto. */
function pickTickDates(points, peakDate, maxTicks) {
  if (points.length <= maxTicks) return points.map((point) => point.date);
  const step = (points.length - 1) / (maxTicks - 1);
  const ticks = Array.from({ length: maxTicks }, (_, index) => points[Math.round(index * step)].date);
  if (peakDate && !ticks.includes(peakDate)) {
    const peakIndex = points.findIndex((point) => point.date === peakDate);
    const closest = ticks
      .slice(0, -1) // nunca substitui o último ponto
      .map((date, tickIndex) => ({ tickIndex, distance: Math.abs(points.findIndex((p) => p.date === date) - peakIndex) }))
      .sort((a, b) => a.distance - b.distance)[0];
    if (closest) ticks[closest.tickIndex] = peakDate;
  }
  return ticks;
}

function axisDecimals(min, max) {
  const range = Math.max(max - min, Math.abs(max) * 0.0001);
  return Math.min(6, Math.max(2, Math.ceil(-Math.log10(range / 4))));
}

function XTick({ x, y, payload, peakDate, lastDate, compact = false }) {
  const date = payload.value;
  const isPeak = date === peakDate;
  const isLast = date === lastDate;
  const suffix = compact ? '' : isPeak ? ' (Pico)' : isLast ? (date === todayIso() ? ' (Hoje)' : ' (Último)') : '';
  return (
    <text
      x={x}
      y={y + 16}
      textAnchor={isLast ? 'end' : 'middle'}
      dx={isLast ? 8 : 0}
      fontFamily="JetBrains Mono, monospace"
      fontSize={12}
      fill={isPeak ? COLORS.peak : COLORS.axis}
    >
      {formatDayMonth(date)}
      {suffix}
    </text>
  );
}

XTick.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  payload: PropTypes.shape({ value: PropTypes.string }),
  peakDate: PropTypes.string,
  lastDate: PropTypes.string,
  compact: PropTypes.bool,
};

function ChartTooltip({ active, payload, quoteCode, firstRate, peakDate }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const change = percentChange(firstRate, point.rate);
  return (
    <div className="rounded-lg border border-line bg-panel px-3 py-2 text-center font-mono text-xs shadow-xl shadow-black/40">
      <p className="text-ink">
        {formatDayMonthYear(point.date)}
        {point.date === peakDate ? ' · Ponto Mais Alto' : ''}
      </p>
      <p className="mt-0.5 text-up">
        {formatRate(point.rate)} {quoteCode} ({formatPercent(change)})
      </p>
      <p className="mt-0.5 text-ma">
        MA-{MOVING_AVERAGE_WINDOW}: {formatRate(point.movingAverage)}
      </p>
    </div>
  );
}

ChartTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  quoteCode: PropTypes.string.isRequired,
  firstRate: PropTypes.number,
  peakDate: PropTypes.string,
};

export default function HistoryChart({ points, summary, baseCode, quoteCode }) {
  // Em telas estreitas, menos rótulos no eixo X e sem sufixos (Pico/Hoje) para não sobrepor.
  const isNarrow = useMediaQuery('(max-width: 640px)');
  const chartModel = useMemo(() => {
    const values = points.flatMap((point) => [point.rate, point.movingAverage]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.15 || max * 0.01;
    return {
      domain: [min - padding, max + padding],
      decimals: axisDecimals(min, max),
      ticks: pickTickDates(points, summary.max.date, isNarrow ? 3 : 6),
    };
  }, [points, summary, isNarrow]);

  const peak = summary.max;
  const peakChange = percentChange(points[0].rate, peak.rate);
  const lastDate = points.at(-1).date;

  return (
    <div className="rounded-xl bg-field p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1" aria-label="Legenda do gráfico">
          <li className="flex items-center gap-2 text-up">
            <span className="h-2.5 w-2.5 rounded-full bg-up" aria-hidden="true" />
            {baseCode} / {quoteCode} Paridade Diária
          </li>
          <li className="flex items-center gap-2 text-ma">
            <span className="h-0 w-4 border-t-2 border-dashed border-ma" aria-hidden="true" />
            Média Móvel (MA-{MOVING_AVERAGE_WINDOW})
          </li>
        </ul>
        <p className="rounded bg-panel px-3 py-1.5 text-muted">
          {formatDayMonthYear(peak.date)}:{' '}
          <span className="text-up">
            {formatRate(peak.rate)} {quoteCode} ({formatPercent(peakChange)})
          </span>
        </p>
      </div>

      <div
        className="h-72 sm:h-80"
        role="img"
        aria-label={`Gráfico de linha da taxa ${baseCode} para ${quoteCode} com ${points.length} observações. Pico de ${formatRate(peak.rate)} em ${formatDayMonthYear(peak.date)}; última taxa ${formatRate(summary.current.rate)} em ${formatDayMonthYear(lastDate)}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 16, right: isNarrow ? 16 : 44, bottom: 8, left: 0 }}>
            <CartesianGrid stroke={COLORS.grid} strokeDasharray="4 6" vertical={false} />
            <XAxis
              dataKey="date"
              ticks={chartModel.ticks}
              interval={0}
              tick={<XTick peakDate={peak.date} lastDate={lastDate} compact={isNarrow} />}
              tickLine={false}
              axisLine={false}
              height={36}
            />
            <YAxis
              domain={chartModel.domain}
              tickFormatter={(value) => formatRate(value, chartModel.decimals)}
              tick={{ fill: COLORS.axis, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}
              tickLine={false}
              axisLine={false}
              width={isNarrow ? 56 : 72}
              tickCount={5}
            />
            <Tooltip
              cursor={{ stroke: COLORS.line, strokeDasharray: '4 4', strokeOpacity: 0.6 }}
              content={<ChartTooltip quoteCode={quoteCode} firstRate={points[0].rate} peakDate={peak.date} />}
            />
            <ReferenceLine x={peak.date} stroke={COLORS.peak} strokeDasharray="4 4" strokeOpacity={0.6} />
            <Line
              type="monotone"
              dataKey="movingAverage"
              name={`Média móvel (MA-${MOVING_AVERAGE_WINDOW})`}
              stroke={COLORS.movingAverage}
              strokeWidth={2}
              strokeDasharray="6 5"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="rate"
              name="Paridade diária"
              stroke={COLORS.line}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: COLORS.line, stroke: '#0b1322', strokeWidth: 2 }}
              animationDuration={500}
            />
            <ReferenceDot x={lastDate} y={points.at(-1).rate} r={5} fill={COLORS.line} stroke="none" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const pointShape = PropTypes.shape({
  date: PropTypes.string.isRequired,
  rate: PropTypes.number.isRequired,
  movingAverage: PropTypes.number,
});

HistoryChart.propTypes = {
  points: PropTypes.arrayOf(pointShape).isRequired,
  summary: PropTypes.shape({
    current: pointShape.isRequired,
    max: pointShape.isRequired,
  }).isRequired,
  baseCode: PropTypes.string.isRequired,
  quoteCode: PropTypes.string.isRequired,
};
