import PropTypes from 'prop-types';
import { SortAscIcon, SortDescIcon, SortIcon } from '../ui/Icons';

const ARIA_SORT = { asc: 'ascending', desc: 'descending' };

export default function SortableHeader({ field, label, sort, onSort, align = 'left' }) {
  const isActive = sort?.field === field;
  const direction = isActive ? sort.direction : null;
  const IconComponent = direction === 'asc' ? SortAscIcon : direction === 'desc' ? SortDescIcon : SortIcon;

  return (
    <th scope="col" aria-sort={direction ? ARIA_SORT[direction] : 'none'} className={`whitespace-nowrap px-5 py-4 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 rounded uppercase tracking-wide transition-colors hover:text-ink ${
          isActive ? 'text-ink' : ''
        }`}
      >
        {label}
        <IconComponent size={14} />
        <span className="sr-only">, ordenar</span>
      </button>
    </th>
  );
}

SortableHeader.propTypes = {
  field: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  sort: PropTypes.shape({ field: PropTypes.string, direction: PropTypes.oneOf(['asc', 'desc']) }),
  onSort: PropTypes.func.isRequired,
  align: PropTypes.oneOf(['left', 'right']),
};
