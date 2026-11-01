import { API_BASE_URL } from '../constants';

/**
 * Módulo isolado para todas as chamadas à API Frankfurter (v1).
 * Docs: https://frankfurter.dev/v1/
 *
 * Endpoints utilizados:
 *  GET /currencies                         -> { "AUD": "Australian Dollar", ... }
 *  GET /latest?base=BRL&symbols=USD        -> { amount, base, date, rates: { USD: 0.18 } }
 *  GET /{start}..{end}?base=..&symbols=..  -> { amount, base, start_date, end_date, rates: { "2024-10-01": { USD: 0.18 } } }
 *
 * Cada função devolve { ...dados, meta: { status, latencyMs, receivedAt } }.
 */

export class ApiError extends Error {
  constructor(message, { status = null, kind = 'http', cause } = {}) {
    super(message, { cause });
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
  }
}

export const isAbortError = (error) => error?.name === 'AbortError';

const STATUS_MESSAGES = {
  400: 'Parâmetros inválidos enviados à API.',
  404: 'Cotação não encontrada para os parâmetros informados.',
  422: 'A API não reconheceu uma das moedas selecionadas.',
  429: 'Muitas requisições em pouco tempo. Aguarde alguns segundos.',
};

function messageForStatus(status) {
  if (STATUS_MESSAGES[status]) return STATUS_MESSAGES[status];
  if (status >= 500) return 'O serviço de cotações está indisponível no momento.';
  return `A API respondeu com erro (HTTP ${status}).`;
}

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isValidRate = (value) => typeof value === 'number' && Number.isFinite(value) && value > 0;

async function request(path, { signal } = {}) {
  const startedAt = performance.now();
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      signal,
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ApiError('Não foi possível conectar à API. Verifique sua conexão.', { kind: 'network', cause: error });
  }

  const latencyMs = Math.round(performance.now() - startedAt);

  if (!response.ok) {
    throw new ApiError(messageForStatus(response.status), { status: response.status });
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new ApiError('A API retornou uma resposta em formato inesperado.', { kind: 'parse', cause: error });
  }

  return { data, meta: { status: response.status, latencyMs, receivedAt: new Date() } };
}

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(key, Array.isArray(value) ? value.join(',') : String(value));
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

/** Lista de moedas suportadas: { code: englishName }. */
export async function fetchCurrencies({ signal } = {}) {
  const { data, meta } = await request('/currencies', { signal });

  if (!isPlainObject(data)) {
    throw new ApiError('Lista de moedas em formato inesperado.', { kind: 'shape' });
  }

  const currencies = Object.fromEntries(
    Object.entries(data).filter(([code, name]) => /^[A-Z]{3}$/.test(code) && typeof name === 'string'),
  );

  if (Object.keys(currencies).length === 0) {
    throw new ApiError('A API não retornou moedas disponíveis.', { kind: 'empty' });
  }

  return { currencies, meta };
}

/** Taxa mais recente de `from` para `to`. */
export async function fetchLatestRate({ from, to, signal }) {
  const { data, meta } = await request(`/latest${buildQuery({ base: from, symbols: to })}`, { signal });
  const rate = data?.rates?.[to];

  if (!isValidRate(rate) || typeof data?.date !== 'string') {
    throw new ApiError(`A API não retornou a taxa ${from}/${to}.`, { kind: 'shape' });
  }

  return { rate, date: data.date, base: data.base ?? from, quote: to, meta };
}

/**
 * Série temporal entre duas datas (ISO yyyy-mm-dd). `end` opcional = até hoje.
 * Retorna array ordenado: [{ date, rates: { USD: 0.18, ... } }].
 */
export async function fetchTimeSeries({ start, end = '', base, symbols, signal }) {
  const path = `/${start}..${end}${buildQuery({ base, symbols })}`;
  const { data, meta } = await request(path, { signal });

  if (!isPlainObject(data?.rates)) {
    throw new ApiError('Série histórica em formato inesperado.', { kind: 'shape' });
  }

  const series = Object.entries(data.rates)
    .filter(([date, rates]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && isPlainObject(rates))
    .map(([date, rates]) => ({
      date,
      rates: Object.fromEntries(Object.entries(rates).filter(([, value]) => isValidRate(value))),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { series, base: data.base ?? base, meta };
}
