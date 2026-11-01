import PropTypes from 'prop-types';
import { AlertIcon, CloseIcon } from './Icons';

export function Skeleton({ className = '' }) {
  return <span className={`skeleton block ${className}`} aria-hidden="true" />;
}

Skeleton.propTypes = { className: PropTypes.string };

export function Spinner({ size = 16, className = '' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

Spinner.propTypes = { size: PropTypes.number, className: PropTypes.string };

/** Mensagem de erro/aviso inline com ação opcional de nova tentativa. */
export function InlineMessage({ tone = 'error', children, onRetry, className = '' }) {
  const toneClass = tone === 'error' ? 'border-down/40 bg-down-soft text-red-200' : 'border-line bg-panel text-muted';
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${toneClass} ${className}`}>
      <AlertIcon size={16} className="mt-0.5 shrink-0" />
      <p className="flex-1">{children}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded px-2 py-0.5 font-medium underline underline-offset-2 hover:text-white"
        >
          Tentar novamente
        </button>
      ) : null}
    </div>
  );
}

InlineMessage.propTypes = {
  tone: PropTypes.oneOf(['error', 'info']),
  children: PropTypes.node.isRequired,
  onRetry: PropTypes.func,
  className: PropTypes.string,
};

/** Estado central para áreas grandes (gráfico, tabela). */
export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <p className="font-medium text-ink">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted">{description}</p> : null}
      {action}
    </div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  action: PropTypes.node,
};

/** Notificação flutuante (sucesso/erro da exportação). */
export function Toast({ toast, onDismiss }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-6">
      {toast ? (
        <div
          key={toast.id}
          role={toast.tone === 'error' ? 'alert' : 'status'}
          className={`pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-2xl shadow-black/40 ${
            toast.tone === 'error' ? 'border-down/50 bg-[#2a1519] text-red-100' : 'border-up/40 bg-[#0f2a24] text-emerald-100'
          }`}
        >
          <span>{toast.message}</span>
          <button type="button" onClick={onDismiss} className="rounded p-1 text-current/70 hover:text-white" aria-label="Fechar aviso">
            <CloseIcon size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

Toast.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    tone: PropTypes.oneOf(['success', 'error']).isRequired,
  }),
  onDismiss: PropTypes.func.isRequired,
};
