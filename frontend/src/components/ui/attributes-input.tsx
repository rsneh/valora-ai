"use client";

import { useI18nContext } from "@/components/locale-context";
import AttributeField from "../seller/attribute-field";
import { ProductAttribute } from "@/types/product";

interface AttributesInputProps {
  schema: ProductAttribute[];
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

const AttributesInput = ({ schema, value = {}, onChange }: AttributesInputProps) => {
  const { t } = useI18nContext();

  const handleUpdateValue = (key: string, newValue: string) => {
    const updatedAttributes = { ...value, [key]: newValue };
    onChange(updatedAttributes);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 md:w-2/3">
        {schema.map((attribute) => (
          <div key={attribute.name} className="flex gap-2">
            <div className="w-32 md:w-40 flex-none bg-gray-50 px-3 py-2 rounded-md">
              <span className="font-medium text-gray-800">{t(`attributeInput.${attribute.name.toLowerCase()}`)}</span>
            </div>
            <div className="flex-1">
              <AttributeField
                key={attribute.name}
                attribute={attribute}
                value={value[attribute.name] ?? ""}
                onChange={(e) => handleUpdateValue(attribute.name, e.target.value)}
                t={t}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttributesInput;
