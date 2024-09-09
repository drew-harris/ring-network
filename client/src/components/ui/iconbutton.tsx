import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
          className={cn(
            `flex items-center light:shadow-sm justify-center w-10 h-10 rounded-md bg-neutral-200/40 border-neutral-300 border dark:border-transparent hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-500 ${
              disabled ? "cursor-not-allowed opacity-50" : ""
            }`,
            className,
          )}
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
