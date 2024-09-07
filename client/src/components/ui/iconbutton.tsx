import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  label?: string;
}
export const IconButton = ({
  children,
  onClick,
  className,
  label,
  disabled,
}: IconButtonProps) => {
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger>
        <button
          className={`${className} flex items-center justify-center w-10 h-10 rounded-md bg-neutral-600 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-500 ${
            disabled ? "cursor-not-allowed" : ""
          }`}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
};
