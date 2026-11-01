import PropTypes from 'prop-types';

/** Ícones em SVG inline (traço 2px, estilo do protótipo). Decorativos por padrão. */
function Icon({ children, size = 18, className = '', title }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

Icon.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.number,
  className: PropTypes.string,
  title: PropTypes.string,
};

const iconPropTypes = { size: PropTypes.number, className: PropTypes.string, title: PropTypes.string };

const make = (paths, name) => {
  const Component = (props) => <Icon {...props}>{paths}</Icon>;
  Component.displayName = name;
  Component.propTypes = iconPropTypes;
  return Component;
};

export const RefreshIcon = make(
  <>
    <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
    <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
    <path d="M21 3v5h-5M3 21v-5h5" />
  </>,
  'RefreshIcon',
);

export const TerminalIcon = make(
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="m7 9 3 3-3 3M13 15h4" />
  </>,
  'TerminalIcon',
);

export const ClockIcon = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>,
  'ClockIcon',
);

export const ConvertIcon = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1.1 1.6 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6.5V8M12 16v1.5" />
  </>,
  'ConvertIcon',
);

export const SwapVerticalIcon = make(
  <>
    <path d="M8 4v14M4 8l4-4 4 4" />
    <path d="M16 20V6M20 16l-4 4-4-4" />
  </>,
  'SwapVerticalIcon',
);

export const BoltIcon = make(<path d="M13 2 4 14h7l-1 8 9-12h-7z" />, 'BoltIcon');

export const ChevronDownIcon = make(<path d="m6 9 6 6 6-6" />, 'ChevronDownIcon');

export const BackspaceIcon = make(
  <>
    <path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z" />
    <path d="m12 9 6 6M18 9l-6 6" />
  </>,
  'BackspaceIcon',
);

export const TrendIcon = make(
  <>
    <path d="m3 17 6-6 4 4 8-8" />
    <path d="M14 7h7v7" />
  </>,
  'TrendIcon',
);

export const CalendarIcon = make(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </>,
  'CalendarIcon',
);

export const SearchIcon = make(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>,
  'SearchIcon',
);

export const DownloadIcon = make(
  <>
    <path d="M12 4v11M7 10l5 5 5-5" />
    <path d="M5 20h14" />
  </>,
  'DownloadIcon',
);

export const BadgeCheckIcon = make(
  <>
    <path d="M12 3 14.5 5l3.1-.2.9 3 2.5 1.8-1 3 1 3-2.5 1.8-.9 3-3.1-.2L12 21l-2.5-2-3.1.2-.9-3L3 14.4l1-3-1-3 2.5-1.8.9-3 3.1.2Z" />
    <path d="m9 12 2 2 4-4" />
  </>,
  'BadgeCheckIcon',
);

export const ExternalLinkIcon = make(
  <>
    <path d="M14 4h6v6M20 4l-9 9" />
    <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </>,
  'ExternalLinkIcon',
);

export const ChartBoxIcon = make(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M8 16v-4M12 16V8M16 16v-6" />
  </>,
  'ChartBoxIcon',
);

export const SortIcon = make(<path d="m8 9 4-4 4 4M8 15l4 4 4-4" />, 'SortIcon');
export const SortAscIcon = make(<path d="m8 14 4-4 4 4" />, 'SortAscIcon');
export const SortDescIcon = make(<path d="m8 10 4 4 4-4" />, 'SortDescIcon');

export const AlertIcon = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16.5v.01" />
  </>,
  'AlertIcon',
);

export const CloseIcon = make(<path d="M6 6l12 12M18 6 6 18" />, 'CloseIcon');

/** Logotipo do cabeçalho: setas de câmbio dentro de um quadrado verde. */
export function LogoMark({ className = '' }) {
  return (
    <span className={`grid h-10 w-10 place-items-center rounded-lg bg-emerald-900/70 ${className}`} aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2 18 9h-4v3h-4V9H6z" fill="#34d399" />
        <path d="M12 22 6 15h4v-3h4v3h4z" fill="#a7f3d0" />
      </svg>
    </span>
  );
}

LogoMark.propTypes = { className: PropTypes.string };
