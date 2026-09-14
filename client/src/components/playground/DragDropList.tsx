import React, { useState } from 'react';
import { GripVertical, RotateCcw } from 'lucide-react';

interface DraggableItem {
  id: string;
  title: string;
  author: string;
}

const INITIAL_LIST: DraggableItem[] = [
  { id: 'item-1', title: 'Clean Code', author: 'Robert C. Martin' },
  { id: 'item-2', title: 'Refactoring', author: 'Martin Fowler' },
  { id: 'item-3', title: 'Dune Deluxe Edition', author: 'Frank Herbert' },
  { id: 'item-4', title: 'Atomic Habits', author: 'James Clear' },
  { id: 'item-5', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann' }
];

export const DragDropList: React.FC = () => {
  const [items, setItems] = useState<DraggableItem[]>(INITIAL_LIST);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIdx(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;

    const updated = [...items];
    const item = updated.splice(draggedIdx, 1)[0];
    updated.splice(index, 0, item);
    setDraggedIdx(index);
    setItems(updated);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 shadow-sm" data-testid="drag-drop-container">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">HTML5 Drag & Drop Reorder List</h4>
          <p className="text-xs text-slate-500">Drag items to rearrange reading priority queue</p>
        </div>
        <button
          onClick={() => setItems(INITIAL_LIST)}
          data-testid="drag-drop-reset-btn"
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Order</span>
        </button>
      </div>

      <div className="space-y-2" data-testid="draggable-items-wrapper">
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            data-testid={`draggable-item-${item.id}`}
            data-order={index + 1}
            className={`flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-grab active:cursor-grabbing hover:border-brand-400 transition-all ${
              draggedIdx === index ? 'opacity-40 border-dashed border-brand-500 bg-brand-50' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                data-testid={`order-badge-${item.id}`}
                className="w-6 h-6 rounded-full bg-white text-slate-700 border border-slate-300 flex items-center justify-center font-bold text-xs"
              >
                {index + 1}
              </span>
              <div>
                <h5 className="font-semibold text-slate-900 text-xs">{item.title}</h5>
                <span className="text-[11px] text-slate-500">{item.author}</span>
              </div>
            </div>
            <GripVertical className="w-4 h-4 text-slate-400" />
          </div>
        ))}
      </div>
    </div>
  );
};
