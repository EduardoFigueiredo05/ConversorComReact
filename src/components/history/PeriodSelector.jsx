import PropTypes from 'prop-types';

/** Seletor segmentado de período (7D / 30D / 90D / 1A). */
export default function PeriodSelector({ periods, selectedId, onChange, disabled = false }) {
  return (
    <div role="group" aria-label="Período da série histórica" className="flex rounded-lg bg-panel p-1">
      {periods.map((period) => {
        const isActive = period.id === selectedId;
        return (
          <button
            key={period.id}
            type="button"
            aria-pressed={isActive}
            aria-label={`Período de ${period.description}`}
            onClick={() => onChange(period.id)}
            disabled={disabled && !isActive}
            className={`min-w-12 rounded-md px-3 py-1.5 font-mono text-sm transition-colors disabled:opacity-50 ${
              isActive ? 'bg-accent text-white' : 'text-muted hover:text-ink'
            }`}
          >
            {period.label}
          </button>
        );
      })}
    </div>
  );
}

PeriodSelector.propTypes = {
  periods: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }),
  ).isRequired,
  selectedId: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
