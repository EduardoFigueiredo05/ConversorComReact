import PropTypes from 'prop-types';
import { getCurrencyName } from '../../utils/formatters';
import CurrencyBadge from '../ui/CurrencyBadge';
import { ChevronDownIcon } from '../ui/Icons';

/**
 * Select nativo (acessível e com teclado/leitor de tela nativos) sobreposto
 * de forma transparente ao cartão visual do protótipo (código + nome).
 */
export default function CurrencySelect({ id, label, value, options, onChange, disabled = false }) {
  const selected = options.find((option) => option.code === value);
  const displayName = selected?.name ?? getCurrencyName(value);
  const safeOptions = selected ? options : [{ code: value, name: displayName }, ...options];

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>
      <div className="relative flex items-center gap-3 rounded-lg border border-transparent bg-panel px-4 py-3 transition-colors focus-within:border-up hover:bg-[#202b42]">
        <CurrencyBadge code={value} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">{value}</p>
          <p className="truncate text-sm text-muted">{displayName}</p>
        </div>
        <ChevronDownIcon size={18} className="text-muted" />
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="absolute inset-0 cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
        >
          {safeOptions.map((option) => (
            <option key={option.code} value={option.code}>
              {option.code} — {option.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

CurrencySelect.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({ code: PropTypes.string.isRequired, name: PropTypes.string.isRequired }))
    .isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
