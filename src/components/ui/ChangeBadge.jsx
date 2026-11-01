import PropTypes from 'prop-types';
import { formatPercent, getTrendDirection } from '../../utils/formatters';

const TONES = {
  up: 'bg-up-soft text-up',
  down: 'bg-down-soft text-down',
  flat: 'bg-panel text-muted',
};

const ARROWS = { up: '▲', down: '▼', flat: '•' };
const SPOKEN = { up: 'alta de', down: 'queda de', flat: 'estável,' };

/** Selo de variação percentual: ▲ +0,35% (verde) / ▼ -0,12% (vermelho). */
export default function ChangeBadge({ value, variant = 'pill', suffix = '', className = '' }) {
  const direction = getTrendDirection(value, 0.0049);
  const text = `${formatPercent(value)}${suffix}`;
  const base =
    variant === 'pill'
      ? `inline-flex items-center gap-1.5 rounded px-2 py-0.5 ${TONES[direction]}`
      : `inline-flex items-center gap-1.5 ${direction === 'down' ? 'text-down' : direction === 'up' ? 'text-up' : 'text-muted'}`;

  if (value === null || value === undefined) {
    return <span className={`font-mono text-xs text-faint ${className}`}>—</span>;
  }

  return (
    <span className={`font-mono text-xs tabular ${base} ${className}`}>
      <span aria-hidden="true" className="text-[0.65em]">
        {ARROWS[direction]}
      </span>
      <span className="sr-only">{SPOKEN[direction]} </span>
      {text}
    </span>
  );
}

ChangeBadge.propTypes = {
  value: PropTypes.number,
  variant: PropTypes.oneOf(['pill', 'inline']),
  suffix: PropTypes.string,
  className: PropTypes.string,
};
