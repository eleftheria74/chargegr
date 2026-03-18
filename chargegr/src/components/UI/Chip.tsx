interface Props {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export default function Chip({ label, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors min-h-[36px]
        ${selected
          ? 'bg-[#1B7B4E] text-white border-[#1B7B4E]'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400'
        }`}
    >
      {label}
    </button>
  );
}
