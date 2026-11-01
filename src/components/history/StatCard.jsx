import PropTypes from 'prop-types';

const VALUE_TONES = {
  up: 'text-up',
  down: 'text-down',
  accent: 'text-ma',
  neutral: 'text-ink',
};

/** Cartão de indicador do resumo do período. */
export default function StatCard({ label, value, detail, tone = 'neutral' }) {
  return (
    <div className="flex min-h-32 flex-col rounded-xl bg-panel p-4">
      <dt className="text-sm font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className={`mt-2 text-xl font-semibold tabular ${VALUE_TONES[tone]}`}>{value}</dd>
      {detail ? <dd className="mt-1 font-mono text-xs text-muted">{detail}</dd> : null}
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  detail: PropTypes.node,
  tone: PropTypes.oneOf(['up', 'down', 'accent', 'neutral']),
};
