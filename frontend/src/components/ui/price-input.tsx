import { DollarSign, Euro, PoundSterling } from 'lucide-react';
import ShekelSymbol from "@/assets/icons/shekel-symbol";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { Input } from './input';
import { Separator } from './separator';

// Define a list of common currency options with their codes, names, and corresponding Lucide icons
const currencyOptions = [
  { code: 'USD', name: 'US Dollar', icon: DollarSign },
  { code: 'EUR', name: 'Euro', icon: Euro },
  { code: 'GBP', name: 'British Pound', icon: PoundSterling },
  { code: 'ILS', name: 'Israeli Shekel', icon: ShekelSymbol },
];

interface PriceInputProps {
  value?: number;
  placeholder?: string;
  selectedCurrencyCode: string;
  onChange: (value?: number) => void;
  setValue: Function;
}

function PriceInput({ selectedCurrencyCode, setValue, onChange, value, ...props }: PriceInputProps) {
  const SelectedCurrencyIcon = currencyOptions.find(
    (opt) => opt.code === selectedCurrencyCode
  )?.icon || DollarSign;

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger className="absolute start-3 top-3">
          <SelectedCurrencyIcon className="h-4 w-4" /> {/* Display selected currency icon */}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {currencyOptions.map((option) => (
            <DropdownMenuItem
              key={option.code}
              onSelect={() => setValue("currency", option.code)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            >
              <option.icon className="h-4 w-4 me-2" />
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