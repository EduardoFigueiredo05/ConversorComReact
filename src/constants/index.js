export const APP_VERSION = 'v1.0.0';

export const API_BASE_URL = 'https://api.frankfurter.dev/v1';
export const API_DOCS_URL = 'https://frankfurter.dev/v1/';

export const DEFAULT_FROM = 'BRL';
export const DEFAULT_TO = 'USD';
export const DEFAULT_AMOUNT = 1250;
export const MAX_AMOUNT = 1_000_000_000_000;

export const QUICK_AMOUNTS = [100, 500, 1000, 5000, 10000];

export const PERIODS = [
  { id: '7D', label: '7D', days: 7, description: '7 dias' },
  { id: '30D', label: '30D', days: 30, description: '30 dias' },
  { id: '90D', label: '90D', days: 90, description: '90 dias' },
  { id: '1A', label: '1A', days: 365, description: '1 ano' },
];
export const DEFAULT_PERIOD_ID = '30D';

export const MOVING_AVERAGE_WINDOW = 7;

/** Pares fixos exibidos na faixa de cotações abaixo do cabeçalho. */
export const TICKER_PAIRS = [
  ['USD', 'BRL'],
  ['EUR', 'USD'],
  ['GBP', 'BRL'],
  ['EUR', 'BRL'],
];

/** Janela (em dias corridos) usada para variação 24h e tendência 7D da tabela. */
export const MARKET_LOOKBACK_DAYS = 14;
export const TREND_POINTS = 7;

/** Moedas usadas como referência nas colunas da tabela. */
export const TABLE_QUOTE_CURRENCIES = { local: 'BRL', global: 'USD' };

export const TABLE_PAGE_SIZE = 7;

/**
 * Ordem de relevância padrão da tabela (como no protótipo).
 * Moedas fora da lista aparecem depois, em ordem alfabética.
 */
export const CURRENCY_PRIORITY = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'CHF', 'AUD', 'CNY', 'BRL', 'MXN'];

/** Agrupamentos dos filtros da tabela. A API não fornece regiões; o mapeamento é local. */
export const CURRENCY_GROUPS = [
  { id: 'all', label: 'Todas', codes: null },
  { id: 'g10', label: 'G10 / Principais', codes: ['USD', 'EUR', 'JPY', 'GBP', 'CHF', 'CAD', 'AUD', 'NZD', 'SEK', 'NOK'] },
  { id: 'americas', label: 'Américas', codes: ['USD', 'CAD', 'BRL', 'MXN'] },
  {
    id: 'europe',
    label: 'Europa',
    codes: ['EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'ISK', 'TRY'],
  },
  {
    id: 'asia-pacific',
    label: 'Ásia & Pacífico',
    codes: ['JPY', 'CNY', 'HKD', 'SGD', 'KRW', 'INR', 'IDR', 'MYR', 'PHP', 'THB', 'AUD', 'NZD'],
  },
];
