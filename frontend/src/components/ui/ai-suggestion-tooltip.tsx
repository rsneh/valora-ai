import { Sparkles } from "lucide-react";
import { useI18nContext } from "../locale-context";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export const AiSuggestionTooltip = ({ size = 20 }: { size: number | string }) => {
  const { t } = useI18nContext();

  return (
    <>
      <Tooltip>
        <TooltipTrigger className="absolute -top-2 -start-6">
          <Sparkles className="text-primary-500" size={size} strokeWidth={1} />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm font-semibold text-gray-500">{t("aiSuggestionTooltip")}</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
}   