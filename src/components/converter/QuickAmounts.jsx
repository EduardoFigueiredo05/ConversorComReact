import PropTypes from 'prop-types';
import { formatNumber, getCurrencySymbol } from '../../utils/formatters';

export default function QuickAmounts({ values, currentAmount, currencyCode, onSelect }) {
  const symbol = getCurrencySymbol(currencyCode);

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Valores rápidos</legend>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => {
          const isActive = value === currentAmount;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(value)}
              className={`rounded px-3 py-1.5 font-mono text-sm transition-colors ${
                isActive ? 'bg-up-soft text-up' : 'bg-panel text-ink hover:bg-[#243049]'
              }`}
            >
              {symbol} {formatNumber(value, 0)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

QuickAmounts.propTypes = {
  values: PropTypes.arrayOf(PropTypes.number).isRequired,
  currentAmount: PropTypes.number.isRequired,
  currencyCode: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};
