import PropTypes from 'prop-types';

/** Mini gráfico de tendência em SVG puro (sem biblioteca). */
export default function Sparkline({ values, width = 104, height = 28, label }) {
  if (values.length < 2) {
    return <span className="font-mono text-xs text-faint">—</span>;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = 3;
  const stepX = (width - padding * 2) / (values.length - 1);

  const points = values
    .map((value, index) => {
      const x = padding + index * stepX;
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const isUp = values.at(-1) >= values[0];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? '#34d399' : '#fca5a5'}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

Sparkline.propTypes = {
  values: PropTypes.arrayOf(PropTypes.number).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  label: PropTypes.string.isRequired,
};
