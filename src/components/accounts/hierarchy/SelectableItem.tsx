import { ReactNode } from 'react';

interface SelectableItemProps {
  isSelected: boolean;
  onClick: () => void;
  children: ReactNode;
  actions?: ReactNode;
}

export default function SelectableItem({ isSelected, onClick, children, actions }: SelectableItemProps) {
  const baseClass = 'w-full px-3 py-3 text-left transition-colors cursor-pointer';
  const selectedClass = 'text-[var(--primary)] border-b-2 border-[var(--primary)]';
  const unselectedClass = 'text-gray-600 hover:bg-gray-50 border-b border-gray-100';

  if (actions) {
    return (
      <div
        className={`flex items-center justify-between px-3 py-3 transition-colors ${
          isSelected ? selectedClass : unselectedClass
        }`}
      >
        <button onClick={onClick} className="flex-1 text-left cursor-pointer">
          {children}
        </button>
        {actions}
      </div>
    );
  }

  return (
    <button onClick={onClick} className={`${baseClass} ${isSelected ? selectedClass : unselectedClass}`}>
      {children}
    </button>
  );
}
