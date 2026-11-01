import PropTypes from 'prop-types';
import { API_DOCS_URL, APP_VERSION } from '../../constants';
import { ExternalLinkIcon } from '../ui/Icons';

export default function Footer({ isHealthy }) {
  return (
    <footer className="mx-auto mt-16 flex max-w-[1600px] flex-col gap-4 px-4 pb-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1">
        <p className="text-sm text-muted">
          Dados cambiais fornecidos publicamente pela API Frankfurter (BCE/ECB). As taxas podem apresentar defasagem de
          mercado financeiro.
        </p>
        <p className="font-mono text-xs text-faint">
          Taxas de referência diárias do Banco Central Europeu para fins analíticos e informativos.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <a href={API_DOCS_URL} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-up hover:underline">
          <ExternalLinkIcon size={15} />
          Frankfurter API Docs
          <span className="sr-only">(abre em nova aba)</span>
        </a>
        <span className="h-4 w-px bg-line" aria-hidden="true" />
        <span className="font-mono text-xs text-muted">{APP_VERSION}</span>
        <span className="h-4 w-px bg-line" aria-hidden="true" />
        <span
          className={`rounded px-2 py-1 font-mono text-xs ${isHealthy ? 'bg-up-soft text-up' : 'bg-down-soft text-down'}`}
        >
          Status: {isHealthy ? 'Normal' : 'Instável'}
        </span>
      </div>
    </footer>
  );
}

Footer.propTypes = { isHealthy: PropTypes.bool.isRequired };
