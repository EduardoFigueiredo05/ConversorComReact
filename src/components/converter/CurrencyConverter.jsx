import PropTypes from 'prop-types';
import { QUICK_AMOUNTS } from '../../constants';
import { InlineMessage, Spinner } from '../ui/Feedback';
import { BoltIcon, ConvertIcon, SwapVerticalIcon } from '../ui/Icons';
import AmountField from './AmountField';
import ConversionResult from './ConversionResult';
import CurrencySelect from './CurrencySelect';
import QuickAmounts from './QuickAmounts';

const ERROR_ID = 'converter-error';

/**
 * Painel do conversor. Componente de apresentação: todo o estado compartilhado
 * (moedas, valor, resultado) vive no App e chega por props (Lifting State Up).
 */
export default function CurrencyConverter({
  currencyOptions,
  currenciesLoading,
  from,
  to,
  amount,
  amountInputRef,
  validationError,
  rateStatus,
  rateError,
  result,
  isOnline,
  onAmountChange,
  onFromChange,
  onToChange,
  onSwap,
  onConvert,
}) {
  const isConverting = rateStatus === 'loading';
  const isSamePair = from === to;

  const handleSubmit = (event) => {
    event.preventDefault();
    onConvert();
  };

  return (
    <section
      id="conversor"
      aria-labelledby="converter-title"
      className="relative overflow-hidden rounded-2xl bg-card p-5 sm:p-8"
    >
      <span
        className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-up via-emerald-500 to-accent"
        aria-hidden="true"
      />

      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 id="converter-title" className="flex items-center gap-3 text-2xl font-semibold">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-panel text-up">
            <ConvertIcon size={22} />
          </span>
          Conversor
        </h2>
        <span
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-mono text-xs ${
            isOnline ? 'bg-up-soft text-up' : 'bg-down-soft text-down'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-up' : 'bg-down'}`} aria-hidden="true" />
          {isOnline ? 'Online BCE' : 'Offline'}
        </span>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <AmountField
          id="amount"
          label="Valor para conversão"
          amount={amount}
          currencyCode={from}
          onAmountChange={onAmountChange}
          inputRef={amountInputRef}
          hasError={Boolean(validationError) && !isSamePair}
          errorId={ERROR_ID}
        />

        <div>
          <CurrencySelect
            id="from-currency"
            label="De: moeda base"
            value={from}
            options={currencyOptions}
            onChange={onFromChange}
            disabled={currenciesLoading && currencyOptions.length === 0}
          />

          <div className="relative z-10 -mt-3 mb-1 flex justify-center">
            <button
              type="button"
              onClick={onSwap}
              className="grid h-11 w-11 place-items-center rounded-full border-4 border-card bg-[#26324a] text-up transition-transform hover:rotate-180 hover:bg-[#2d3a55]"
              aria-label={`Inverter moedas: ${to} para ${from}`}
            >
              <SwapVerticalIcon size={18} />
            </button>
          </div>

          <CurrencySelect
            id="to-currency"
            label="Para: moeda de cotação"
            value={to}
            options={currencyOptions}
            onChange={onToChange}
            disabled={currenciesLoading && currencyOptions.length === 0}
          />
        </div>

        <QuickAmounts values={QUICK_AMOUNTS} currentAmount={amount} currencyCode={from} onSelect={onAmountChange} />

        {validationError ? (
          <div id={ERROR_ID}>
            <InlineMessage>{validationError}</InlineMessage>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isConverting || isSamePair}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-up-strong px-6 py-4 text-lg font-semibold text-emerald-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isConverting ? <Spinner size={18} /> : <BoltIcon size={20} />}
          {isConverting ? 'Consultando taxa…' : 'Converter Agora'}
        </button>
      </form>

      <div className="mt-6">
        <ConversionResult
          result={result}
          status={rateStatus}
          error={rateError}
          notice={isSamePair ? 'Selecione moedas diferentes para ver o resultado.' : null}
          onRetry={onConvert}
        />
      </div>
    </section>
  );
}

CurrencyConverter.propTypes = {
  currencyOptions: PropTypes.arrayOf(
    PropTypes.shape({ code: PropTypes.string.isRequired, name: PropTypes.string.isRequired }),
  ).isRequired,
  currenciesLoading: PropTypes.bool.isRequired,
  from: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  amountInputRef: PropTypes.shape({ current: PropTypes.any }),
  validationError: PropTypes.string,
  rateStatus: PropTypes.oneOf(['idle', 'loading', 'success', 'error']).isRequired,
  rateError: PropTypes.instanceOf(Error),
  result: ConversionResult.propTypes.result,
  isOnline: PropTypes.bool.isRequired,
  onAmountChange: PropTypes.func.isRequired,
  onFromChange: PropTypes.func.isRequired,
  onToChange: PropTypes.func.isRequired,
  onSwap: PropTypes.func.isRequired,
  onConvert: PropTypes.func.isRequired,
};
