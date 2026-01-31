interface ColumnMessageProps {
  message: string;
  className?: string;
}

export default function ColumnMessage({ message, className = '' }: ColumnMessageProps) {
  return (
    <div className={`p-4 text-center text-gray-400 text-sm ${className}`}>
      {message}
    </div>
  );
}
