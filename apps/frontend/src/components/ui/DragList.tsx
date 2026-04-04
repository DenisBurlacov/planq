import { useState, useRef, type ReactNode } from 'react';
import { GripVertical } from 'lucide-react';

interface DragListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
  onReorder: (items: T[]) => void;
  'data-testid'?: string;
}

export function DragList<T>({
  items,
  keyExtractor,
  renderItem,
  onReorder,
  'data-testid': testId,
}: DragListProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragNode = useRef<HTMLDivElement | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    dragNode.current = e.currentTarget as HTMLDivElement;
    e.dataTransfer.effectAllowed = 'move';
    // Make the drag image transparent after a frame
    requestAnimationFrame(() => {
      if (dragNode.current) {
        dragNode.current.style.opacity = '0.4';
      }
    });
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragIndex === null || dragIndex === index) return;
    setOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const newItems = [...items];
    const [removed] = newItems.splice(dragIndex, 1);
    newItems.splice(index, 0, removed);
    onReorder(newItems);
  };

  const handleDragEnd = () => {
    if (dragNode.current) {
      dragNode.current.style.opacity = '1';
    }
    setDragIndex(null);
    setOverIndex(null);
    dragNode.current = null;
  };

  return (
    <div data-testid={testId ?? 'drag-list'} className="space-y-2">
      {items.map((item, index) => (
        <div
          key={keyExtractor(item)}
          data-testid={`drag-item-${index}`}
          draggable
          onDragStart={e => handleDragStart(e, index)}
          onDragOver={e => handleDragOver(e, index)}
          onDrop={e => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-2 transition-all ${
            overIndex === index && dragIndex !== null ? 'border-t-2 border-accent' : ''
          }`}
        >
          <div
            data-testid={`drag-handle-${index}`}
            className="cursor-grab active:cursor-grabbing p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="flex-1">{renderItem(item, index)}</div>
        </div>
      ))}
    </div>
  );
}
