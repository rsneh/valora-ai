import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { Input } from './input';
import { currencyOptions, getCurrencySymbol } from '@/lib/currency';

interface PriceInputProps {
  value?: number;
  placeholder?: string;
  selectedCurrencyCode: string;
  onChange: (value?: number) => void;
  setValue: (key: string, value: string) => void;
}

function PriceInput({ selectedCurrencyCode, setValue, onChange, value, ...props }: PriceInputProps) {
  const selectedCurrencySign = getCurrencySymbol(selectedCurrencyCode);
  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger className="absolute start-3 top-2 px-1">
          <span className="h-4 w-4">{selectedCurrencySign}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {currencyOptions.map((option) => (
            <DropdownMenuItem
              key={option.code}
              onSelect={() => setValue("currency", option.code)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            >
              <span className="h-4 w-4 me-2">{getCurrencySymbol(option.code)}</span>
              {option.name} ({option.code})
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {/* <Separator orientation="vertical" className="block h-8" /> */}
      <Input
        {...props}
        type="number"
        className="ps-9 border-e border-gray-300"
        step="0.01"
        min="0.01"
        value={value === undefined ? '' : String(value)}
        onChange={(e) => {
          const value = e.target.value;
          const numberValue = parseFloat(value);
          onChange(isNaN(numberValue) ? undefined : numberValue);
        }}
      />
    </div>
  );
}

export default PriceInput;