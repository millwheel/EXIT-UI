interface ItemContentProps {
  title: string;
  subtitle?: string;
  isSelected?: boolean;
  hideSubtitle?: boolean;
}

export default function ItemContent({ title, subtitle, isSelected = false, hideSubtitle = false }: ItemContentProps) {
  return (
    <>
      <div className={`text-sm ${isSelected ? 'font-medium' : ''}`}>{title}</div>
      {hideSubtitle ? (
        <div className="text-xs mt-0.5 invisible">-</div>
      ) : subtitle ? (
        <div className="text-xs text-gray-400 mt-0.5 font-normal">{subtitle}</div>
      ) : null}
    </>
  );
}
