import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import { Card, CardContent } from "@/components/ui/card"
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

type CategoryGridSize = 'sm' | 'md' | 'lg';

interface CategoryGridProps {
  categories: {
    icon: string;
    label: string;
    description: string;
  }[];
  size?: CategoryGridSize;
  selectedCategory?: string;
  suggestedCategory?: string;
  onCategorySelect: (category: string) => void;
}

export function CategoryGrid({ selectedCategory, categories, suggestedCategory, size = 'md', onCategorySelect }: CategoryGridProps) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mx-auto`}
    >
      {categories.map((category, i) => (
        <CategoryCard
          key={i}
          size={size}
          icon={category.icon}
          title={category.label}
          description={category.description}
          isSelected={selectedCategory === category.label}
          isSuggested={suggestedCategory === category.label}
          onClick={() => onCategorySelect(category.label)}
        />
      ))}
    </div>
  );
};

interface CategoryCardProps {
  icon: string;
  title: string;
  size: CategoryGridSize;
  description: string;
  isSelected: boolean;
  isSuggested: boolean;
  onClick?: () => void;
}

const CategoryCard = ({ icon, title, description, isSelected, isSuggested, size, onClick }: CategoryCardProps) => {
  const iconSize = size === 'sm' ? 40 : size === 'md' ? 52 : 60;
  const sparkleSize = size === 'sm' ? 24 : size === 'md' ? 32 : 42;
  return (
    <TooltipProvider>
      <Card
        className={cn(
          "flex flex-col relative group transition-all duration-300 ease-in-out shadow-sm rounded-lg",
          "hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:cursor-pointer",
          isSelected ? "bg-primary-50 border-primary-200 ring-2 ring-primary-800" : "bg-white border-gray-200"
        )}
        onClick={onClick}
      >
        <CardContent className="flex-1 flex flex-col items-center justify-start text-center p-4 md:p-6">
          <div className="relative mb-3 md:mb-4 text-gray-600">
            {isSuggested && (
              <>
                <Tooltip>
                  <TooltipTrigger>
                    <Sparkles className="absolute top-0 -start-full text-primary-500" size={sparkleSize} strokeWidth={1} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs text-gray-500">Suggested for you by our AI.</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            <DynamicIcon name={icon as IconName} size={iconSize} strokeWidth={1} className="group-hover:text-primary-800 transition-colors duration-300" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1 md:mb-2">{title}</h3>
          <p className="text-xs md:text-sm text-gray-500 leading-tight px-1">{description}</p>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};