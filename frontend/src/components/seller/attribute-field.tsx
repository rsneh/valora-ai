// src/components/FormField.js
import { ProductAttribute } from '@/types/product';
import React from 'react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

// A utility function to create a more readable label from a camelCase or snake_case name
const formatLabel = (name: string) => {
  const result = name.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

interface AttribteFieldProps {
  attribute: ProductAttribute;
  value?: string | number | string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  t: (key: string) => string;
}

const AttribteField = ({ attribute, value = "", onChange, t }: AttribteFieldProps) => {
  const label = formatLabel(attribute.name);
  const inputId = `field-${attribute.name}`;

  const renderField = () => {
    switch (attribute.type) {
      case 'number':
        return (
          <div className="relative">
            <Input
              type="number"
              id={inputId}
              name={attribute.name}
              value={value ?? ""}
              onChange={onChange}
              required={attribute.required}
              className={cn("w-full", { "pe-9": !!attribute.unit })}
            />
            {attribute.unit && (
              <span className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-500">
                {t(`attributeInput.unitOptions.${attribute.unit}`)}
              </span>
            )}
          </div>
        );
      case 'select':
        return (
          <select
            id={inputId}
            name={attribute.name}
            value={value}
            onChange={onChange}
            required={attribute.required}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t("attributeInput.select")} {t(`attributeInput.${label.trim().toLocaleLowerCase()}`)}</option>
            {attribute?.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'boolean':
        return (
          <div className="flex items-center">
            <Input
              type="checkbox"
              id={inputId}
              name={attribute.name}
              checked={!!value} // Ensure value is a boolean
              onChange={onChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={inputId} className="ml-2 block text-sm text-gray-900">
              Is this correct?
            </label>
          </div>
        );
      // Default to a text input for any other type
      case 'text':
      default:
        return (
          <Input
            type="text"
            id={inputId}
            name={attribute.name}
            value={value}
            onChange={onChange}
            required={attribute.required}
            className="w-full"
          />
        );
    }
  };

  return (
    <div>
      {renderField()}
    </div>
  );
};

export default AttribteField;