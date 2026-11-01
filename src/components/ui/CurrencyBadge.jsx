import PropTypes from 'prop-types';
import { getCurrencySymbol } from '../../utils/formatters';

/**
 * Ícone da moeda. O protótipo usa um marcador genérico de bandeira; emojis de
 * bandeira não renderizam no Windows, então usamos o símbolo monetário.
 */
export default function CurrencyBadge({ code, className = '' }) {
  const symbol = getCurrencySymbol(code);
  const label = symbol.length > 3 ? code.slice(0, 2) : symbol;
  return (
    <span
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border border-line bg-field font-mono text-[11px] font-semibold text-muted ${className}`}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}

CurrencyBadge.propTypes = {
  code: PropTypes.string.isRequired,
  className: PropTypes.string,
};
