"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { categories } from "@/lib/utils";
import { DollarSign } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { CategoryGrid } from "../ui/category-grid";
import { Textarea } from "../ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { Category } from "@/types/product";
import { useI18nContext } from "../locale-context";

// Define Zod schema for form validation
const productFormSchema = z.object({
  title: z.string(),
  description: z.string().min(1, { message: "adForm.descriptionRequired" }),
  price: z.coerce.number().positive({ message: "adForm.pricePositive" }),
  category: z.string().min(1, { message: "adForm.categoryRequired" }),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface SellerAdFormProps {
  defaultValues?: Partial<ProductFormData>;
  suggestedCategory?: Category;
  loading?: boolean;
  onSubmit: (data: ProductFormData) => void;
}

export function SellerAdForm({ defaultValues, suggestedCategory, loading = false, onSubmit }: SellerAdFormProps) {
  const { t } = useI18nContext();
  const [category, setCategory] = useState<string>();
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues,
  });
  const handleFormSubmit = (data: ProductFormData) => onSubmit(data);
  useEffect(() => {
    if (suggestedCategory) {
      setCategory(suggestedCategory.value);
    }
  }, [suggestedCategory]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="p-4 space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("adForm.titleLabel")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("adForm.titlePlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage /> {/* Displays validation errors */}
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("adForm.descriptionLabel")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("adForm.descriptionPlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price Field */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("adForm.priceLabel")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    className="pl-9"
                    placeholder={t("adForm.pricePlaceholder")}
                    step="0.01"
                    min="0.01"
                    // react-hook-form manages value as number, input expects string
                    value={field.value === undefined ? '' : String(field.value)}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numberValue = parseFloat(value);
                      field.onChange(isNaN(numberValue) ? undefined : numberValue);
                    }}
                    onBlur={field.onBlur} // Important for validation
                    name={field.name} // Important for react-hook-form
                    ref={field.ref} // Important for react-hook-form
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Field */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("adForm.categoryLabel")}</FormLabel>
              <FormControl>
                <CategoryGrid
                  size="sm"
                  categories={categories}
                  suggestedCategory={category}
                  selectedCategory={field.value} // Pass field value
                  onCategorySelect={field.onChange} // Pass field onChange
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>{loading ? t("adForm.submittingButton") : t("adForm.submitButton")}</Button>
      </form>
    </Form>
  );
}