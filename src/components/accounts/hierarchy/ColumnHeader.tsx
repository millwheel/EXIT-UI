interface ColumnHeaderProps {
  title: string;
  width?: string;
  isLast?: boolean;
}

export default function ColumnHeader({ title, width = 'w-48', isLast = false }: ColumnHeaderProps) {
  return (
    <div
      className={`${width} py-3 px-4 text-sm font-medium text-center bg-gray-50 text-gray-500 ${
        isLast ? '' : 'border-r border-gray-200'
      }`}
    >
      {title}
    </div>
  );
}
