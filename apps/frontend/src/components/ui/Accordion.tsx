import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: number;
}

export function Accordion({ items, defaultOpen = 0 }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);

  return (
    <div
      data-testid="accordion"
      className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden"
    >
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} data-testid={`accordion-item-${i}`}>
            <button
              data-testid={`accordion-trigger-${i}`}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors"
              aria-expanded={isOpen}
            >
              {item.title}
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-[var(--text-secondary)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <div
                data-testid={`accordion-content-${i}`}
                className="px-5 pb-4 text-sm text-[var(--text-secondary)] bg-[var(--bg-card)]"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
