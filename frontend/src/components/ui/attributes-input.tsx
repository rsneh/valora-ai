"use client";

import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { X, Plus } from "lucide-react";
import { useI18nContext } from "@/components/locale-context";

interface AttributesInputProps {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  placeholder?: {
    key?: string;
    value?: string;
  };
}

const AttributesInput = ({ value = {}, onChange, placeholder }: AttributesInputProps) => {
  const { t } = useI18nContext();
  const [newKey, setNewKey] = useState<string>("");
  const [newValue, setNewValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Convert object to array for easier rendering
  const attributeEntries = Object.entries(value);

  const handleAddAttribute = () => {
    if (!newKey.trim()) {
      setError(t("adForm.attributeKeyRequired") || "Attribute name is required");
      return;
    }

    if (!newValue.trim()) {
      setError(t("adForm.attributeValueRequired") || "Attribute value is required");
      return;
    }

    if (value[newKey]) {
      setError(t("adForm.attributeKeyExists") || "Attribute already exists");
      return;
    }

    // Add new attribute
    const updatedAttributes = { ...value, [newKey]: newValue };
    onChange(updatedAttributes);

    // Reset inputs and error
    setNewKey("");
    setNewValue("");
    setError("");
  };

  const handleRemoveAttribute = (key: string) => {
    const updatedAttributes = { ...value };
    delete updatedAttributes[key];
    onChange(updatedAttributes);
  };

  const handleUpdateValue = (key: string, newValue: string) => {
    const updatedAttributes = { ...value, [key]: newValue };
    onChange(updatedAttributes);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {attributeEntries.length > 0 ? (
          attributeEntries.map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <div className="flex-1 bg-gray-50 px-3 py-2 rounded-md">
                <span className="font-medium text-gray-800">{key}</span>
              </div>
              <div className="flex-1">
                <Input
                  value={value}
                  onChange={(e) => handleUpdateValue(key, e.target.value)}
                  className="w-full"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveAttribute(key)}
                className="h-10 w-10 text-gray-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">{t("adForm.removeAttribute")}</span>
              </Button>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground italic">
            {t("adForm.noAttributes") || "No attributes added yet"}
          </div>
        )}
      </div>

      <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mt-2">
        <Input
          value={newKey}
          onChange={(e) => {
            setNewKey(e.target.value);
            setError("");
          }}
          placeholder={placeholder?.key || t("adForm.attributeKeyPlaceholder") || "Attribute name"}
          className="w-full"
        />
        <Input
          value={newValue}
          onChange={(e) => {
            setNewValue(e.target.value);
            setError("");
          }}
          placeholder={placeholder?.value || t("adForm.attributeValuePlaceholder") || "Attribute value"}
          className="w-full"
        />
        <Button
          type="button"
          onClick={handleAddAttribute}
          size="icon"
          className="h-10 w-10"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">{t("adForm.addAttribute")}</span>
        </Button>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
};

export default AttributesInput;
