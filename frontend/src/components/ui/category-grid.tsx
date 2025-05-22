import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import { Card, CardContent } from "@/components/ui/card"
import { cn } from '@/lib/utils';
import { TooltipProvider } from './tooltip';
import { Category } from '@/types/product';
import { useI18nContext } from '../locale-context';
import { AiSuggestionTooltip } from './ai-suggestion-tooltip';

type CategoryGridSize = 'sm' | 'md' | 'lg';

interface CategoryGridProps {
  categories: Category[];
  size?: CategoryGridSize;
  selectedCategory?: string;
  suggestedCategory?: string;
  onCategorySelect: (category: string) => void;
}

export function CategoryGrid({ selectedCategory, categories, suggestedCategory, size = 'md', onCategorySelect }: CategoryGridProps) {
  const { t } = useI18nContext();
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-4 gap-4 mx-auto`}
    >
      {categories.map((category, i) => (
        <CategoryCard
          key={i}
          size={size}
          icon={category.icon}
          title={t(`categories.${category.value}.title`)}
          value={category.value}
          description={category.description || ''}
          isSelected={selectedCategory === category.value}
          isSuggested={suggestedCategory === category.value}
          onClick={() => onCategorySelect(category.value)}
        />
      ))}
    </div>
  );
};

interface CategoryCardProps {
  icon?: string;
  title: string;
  value: string;
  size: CategoryGridSize;
  description: string;
  isSelected: boolean;
  isSuggested: boolean;
  onClick?: () => void;
}

const CategoryCard = ({ icon, title, value, description, isSelected, isSuggested, size, onClick }: CategoryCardProps) => {
  const iconSize = size === 'sm' ? 40 : size === 'md' ? 52 : 60;
  const sparkleSize = size === 'sm' ? 24 : size === 'md' ? 32 : 42;
  const isOther = value === "other";
  return (
    <TooltipProvider>
      <Card
        className={cn(
          "flex flex-col relative group transition-all duration-300 ease-in-out shadow-sm rounded-lg",
          "hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:cursor-pointer",
          isSelected ? "bg-primary-50 border-primary-200 ring-2 ring-primary-800" : "bg-white border-gray-200",
          isOther && "col-span-2",
        )}
        onClick={onClick}
      >
        <CardContent
          className={cn(
            "flex-1 flex flex-col items-center text-center",
            isOther ? "p-2" : "p-4 md:p-6"
          )}
        >
          {!isOther && (
            <div className="relative mb-3 md:mb-4 text-gray-600">
              {isSuggested && (
                <AiSuggestionTooltip size={sparkleSize} />
              )}
              {icon && (
                <DynamicIcon name={icon as IconName} size={iconSize} strokeWidth={1} className="group-hover:text-primary-800 transition-colors duration-300" />
              )}
            </div>
          )}
          <h3 className={cn(
            "font-semibold text-gray-800 mb-1",
            isOther ? "text-sm md:text-base md:mb-0" : "text-lg md:text-xl",
          )}>{title}</h3>
          <p className="text-xs md:text-sm text-gray-500 leading-tight px-1">{description}</p>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};