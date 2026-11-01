import PropTypes from 'prop-types';
import { formatAmountInput, parseAmountInput } from '../../utils/amountInput';
import { getCurrencySymbol } from '../../utils/formatters';
import { BackspaceIcon } from '../ui/Icons';

export default function AmountField({ id, label, amount, currencyCode, onAmountChange, inputRef, hasError, errorId }) {
  const handleChange = (event) => onAmountChange(parseAmountInput(event.target.value));

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>
      <div
        className={`flex items-center gap-3 rounded-lg border bg-field px-4 py-3 transition-colors focus-within:border-up ${
          hasError ? 'border-down/70' : 'border-transparent'
        }`}
      >
        <span className="font-mono text-2xl font-semibold text-up sm:text-3xl" aria-hidden="true">
          {getCurrencySymbol(currencyCode)}
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={formatAmountInput(amount)}
          onChange={handleChange}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          className="min-w-0 flex-1 bg-transparent font-mono text-2xl font-medium text-ink tabular outline-none sm:text-3xl"
        />
        <button
          type="button"
          onClick={() => onAmountChange(0)}
          className="rounded p-1 text-muted transition-colors hover:text-ink"
          aria-label="Limpar valor"
        >
          <BackspaceIcon size={20} />
        </button>
      </div>
    </div>
  );
}

AmountField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  currencyCode: PropTypes.string.isRequired,
  onAmountChange: PropTypes.func.isRequired,
  inputRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
  hasError: PropTypes.bool,
  errorId: PropTypes.string,
};
