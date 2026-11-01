import { useMemo, useRef, useState } from 'react';
import CurrencyTable from './components/currencies/CurrencyTable';
import CurrencyConverter from './components/converter/CurrencyConverter';
import HistoricalAnalysis from './components/history/HistoricalAnalysis';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import MarketTicker from './components/layout/MarketTicker';
import { Toast } from './components/ui/Feedback';
import {
  DEFAULT_AMOUNT,
  DEFAULT_FROM,
  DEFAULT_PERIOD_ID,
  DEFAULT_TO,
  PERIODS,
  TABLE_QUOTE_CURRENCIES,
  TICKER_PAIRS,
  TREND_POINTS,
} from './constants';
import { useCurrencies } from './hooks/useCurrencies';
import { useExchangeRate } from './hooks/useExchangeRate';
import { useHistoricalRates } from './hooks/useHistoricalRates';
import { useMarketSnapshot } from './hooks/useMarketSnapshot';
import { useToast } from './hooks/useToast';
import { validateConversion } from './utils/amountInput';
import { buildMarketRows, buildTickerItems } from './utils/rates';

/**
 * Componente raiz. Concentra o estado compartilhado entre conversor, gráfico
 * histórico e tabela (Lifting State Up): moedas selecionadas, valor, período
 * e a "chave de atualização" que força novo carregamento de todos os dados.
 */
export default function App() {
  const [from, setFrom] = useState(DEFAULT_FROM);
  const [to, setTo] = useState(DEFAULT_TO);
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [committedAmount, setCommittedAmount] = useState(DEFAULT_AMOUNT);
  const [validationError, setValidationError] = useState(null);
  const [periodId, setPeriodId] = useState(DEFAULT_PERIOD_ID);
  const [refreshKey, setRefreshKey] = useState(0);
  const [conversionRequest, setConversionRequest] = useState(0);
  const amountInputRef = useRef(null);
  const { toast, showToast, dismissToast } = useToast();

  const selectedPeriod = PERIODS.find((period) => period.id === periodId) ?? PERIODS[0];

  // --- Dados (custom hooks com useEffect + AbortController) ---
  const currenciesState = useCurrencies(refreshKey);
  const market = useMarketSnapshot(refreshKey);
  const exchange = useExchangeRate(from, to, `${refreshKey}:${conversionRequest}`);
  const history = useHistoricalRates(from, to, selectedPeriod.days, refreshKey);

  // --- Dados derivados (sem estado duplicado) ---
  const marketRows = useMemo(
    () =>
      buildMarketRows({
        currencies: currenciesState.currencies,
        series: market.series,
        localCode: TABLE_QUOTE_CURRENCIES.local,
        globalCode: TABLE_QUOTE_CURRENCIES.global,
        trendPoints: TREND_POINTS,
      }),
    [currenciesState.currencies, market.series],
  );

  const tickerItems = useMemo(() => buildTickerItems(market.series, TICKER_PAIRS), [market.series]);

  const conversionResult =
    exchange.rate && committedAmount > 0
      ? {
          amount: committedAmount,
          from,
          to,
          rate: exchange.rate,
          date: exchange.date,
          convertedAmount: committedAmount * exchange.rate,
        }
      : null;

  const isOnline = market.status !== 'error';
  const tableStatus = [currenciesState.status, market.status].includes('error')
    ? 'error'
    : [currenciesState.status, market.status].includes('loading')
      ? 'loading'
      : 'success';
  const isRefreshing = market.status === 'loading' || currenciesState.status === 'loading';
  const isHealthy = [market.status, currenciesState.status, exchange.status, history.status].every(
    (status) => status !== 'error',
  );

  // --- Handlers (eventos controlados) ---
  const handleAmountChange = (value) => {
    setAmount(value);
    setValidationError(null);
  };

  const handleFromChange = (code) => {
    setFrom(code);
    setValidationError(null);
  };

  const handleToChange = (code) => {
    setTo(code);
    setValidationError(null);
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleConvert = () => {
    const error = validateConversion({ amount, from, to });
    if (error) {
      setValidationError(error);
      amountInputRef.current?.focus();
      return;
    }
    setValidationError(null);
    setCommittedAmount(amount);
    setConversionRequest((count) => count + 1); // busca a taxa mais recente
  };

  const handleRefresh = () => setRefreshKey((key) => key + 1);

  /** Ação "Converter" da tabela: define a moeda como destino e leva o foco ao conversor. */
  const handleSelectCurrency = (code) => {
    if (code === from) setFrom(to);
    setTo(code);
    setValidationError(null);
    document.getElementById('conversor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    amountInputRef.current?.focus({ preventScroll: true });
  };

  return (
    <>
      <a
        href="#conversor"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-up focus:px-4 focus:py-2 focus:text-emerald-950"
      >
        Pular para o conversor
      </a>

      <Header
        lastUpdatedAt={market.meta?.receivedAt ?? null}
        isOnline={isOnline}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />
      <MarketTicker items={tickerItems} referenceDate={market.latestDate} meta={market.meta} status={market.status} />

      <main className="mx-auto max-w-[1600px] space-y-10 px-4 pt-10 sm:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(340px,1fr)_minmax(0,2.1fr)]">
          <CurrencyConverter
            currencyOptions={currenciesState.currencies}
            currenciesLoading={currenciesState.status === 'loading'}
            from={from}
            to={to}
            amount={amount}
            amountInputRef={amountInputRef}
            validationError={validationError}
            rateStatus={exchange.status}
            rateError={exchange.error}
            result={conversionResult}
            isOnline={isOnline}
            onAmountChange={handleAmountChange}
            onFromChange={handleFromChange}
            onToChange={handleToChange}
            onSwap={handleSwap}
            onConvert={handleConvert}
          />

          <HistoricalAnalysis
            from={from}
            to={to}
            periodId={periodId}
            onPeriodChange={setPeriodId}
            history={history}
            onRetry={handleRefresh}
          />
        </div>

        <CurrencyTable
          rows={marketRows}
          status={tableStatus}
          error={currenciesState.error ?? market.error}
          selectedCode={to}
          converterBase={from}
          converterAmount={amount}
          onSelectCurrency={handleSelectCurrency}
          onRetry={handleRefresh}
          onNotify={showToast}
        />
      </main>

      <Footer isHealthy={isHealthy} />
      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
