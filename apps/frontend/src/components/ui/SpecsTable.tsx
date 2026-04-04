import { useTranslation } from 'react-i18next';
import { Button } from './Button';

interface SpecRow {
  label: string;
  value: string;
}

interface SpecsTableProps {
  rows: SpecRow[];
  onSizeGuide?: () => void;
}

export function SpecsTable({ rows, onSizeGuide }: SpecsTableProps) {
  const { t } = useTranslation('catalog');

  return (
    <div
      data-testid="specs-table"
      className="rounded-xl border border-[var(--border)] overflow-hidden"
    >
      <table className="w-full" aria-label="Product specifications">
        <thead>
          <tr>
            <th
              colSpan={2}
              className="bg-[var(--table-header-bg)] px-4 py-3 text-left font-semibold text-sm text-[var(--text-primary)]"
            >
              {t('product.specifications', { defaultValue: 'Specifications' })}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.label}
              data-testid={`specs-row-${index}`}
              className={index % 2 === 0 ? 'bg-[var(--bg-card)]' : 'bg-[var(--table-stripe)]'}
            >
              <th
                scope="row"
                className="px-4 py-3 font-medium text-sm text-[var(--text-secondary)] text-left w-[160px] sm:w-[160px]"
              >
                {row.label}
              </th>
              <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {onSizeGuide && (
        <div className="px-4 py-3 flex justify-end border-t border-[var(--border)] bg-[var(--bg-card)]">
          <Button
            data-testid="size-guide-button"
            variant="secondary"
            size="sm"
            onClick={onSizeGuide}
          >
            {t('product.sizeGuide', { defaultValue: 'Size Guide' })}
          </Button>
        </div>
      )}
    </div>
  );
}
