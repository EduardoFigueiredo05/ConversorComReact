import PropTypes from 'prop-types';
import { API_DOCS_URL } from '../../constants';
import { formatUtcTime } from '../../utils/dates';
import { Spinner } from '../ui/Feedback';
import { RefreshIcon, TerminalIcon } from '../ui/Icons';

// Imagem salva em public/logo.png
const LOGO_URL = '/logo.png';

export default function Header({ lastUpdatedAt, isOnline, isRefreshing, onRefresh }) {
  const statusText = lastUpdatedAt
    ? `Dados atualizados hoje, ${formatUtcTime(lastUpdatedAt)} UTC · ${isOnline ? 'Online' : 'Offline'}`
    : isOnline
      ? 'Conectando à API…'
      : 'API indisponível · Offline';

  return (
    <header className="bg-bar">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-contain"
          />
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Conversor de Moeda</h1>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3 sm:gap-6">
          <p
            className="hidden items-center gap-2 rounded-full bg-card px-4 py-2 font-mono text-xs text-muted md:flex"
            role="status"
          >
            <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-up' : 'bg-down'}`} aria-hidden="true" />
            {statusText}
          </p>

          <a
            href={API_DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-md px-2 py-1 font-mono text-xs text-muted transition-colors hover:text-ink"
          >
            <TerminalIcon size={16} />
            Docs API
            <span className="sr-only">(abre em nova aba)</span>
          </a>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-lg bg-up-strong px-4 py-2.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-70"
          >
            {isRefreshing ? <Spinner size={16} /> : <RefreshIcon size={16} />}
            {isRefreshing ? 'Atualizando…' : 'Atualizar taxas'}
          </button>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  lastUpdatedAt: PropTypes.instanceOf(Date),
  isOnline: PropTypes.bool.isRequired,
  isRefreshing: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
};
