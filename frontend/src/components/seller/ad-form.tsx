"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useEffect, useState } from "react";
import { useI18nContext } from "../locale-context";
import { Category } from "@/types/category";
import { getCategories, getCategoryBreadcrumbs } from "@/services/api/categories";
import { productConditionEnum, ProductFormData } from "@/types/product";
import PriceInput from "../ui/price-input";
import { getLocalCurrency } from "@/lib/utils";
import Image from "next/image";
import ImageGalleryUpload from "../ui/image-gallery-upload";

// Define the Zod schema for ProductFormData
const productFormSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  price: z.number({ required_error: "Price is required." }).positive({ message: "Price must be a positive number." }),
  condition: z.enum(productConditionEnum).optional(),
  category: z.number({ required_error: "Category is required." }),
  currency: z.string(),
  attributes: z.object({}).optional(),
  images: z.array(z.object({
    src: z.string(),
    file: z.instanceof(File),
  })).optional(),
});

interface SellerAdFormProps {
  defaultValues?: Partial<ProductFormData>;
  topCategories: Category[];
  categoryBreadcrumbs?: Category[];
  loading?: boolean;
  onSubmit: (data: ProductFormData) => void;
}

export function SellerAdForm({ defaultValues, topCategories, loading = false, onSubmit }: SellerAdFormProps) {
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [parentCategory, setParentCategory] = useState<Category>();
  const { t, locale } = useI18nContext();

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      ...defaultValues,
      currency: getLocalCurrency(locale),
      images: [],
    }
  });

  const selectedCurrencyCode = form.watch('currency');

  const handleSetCurrency = (key: string, value: string) => {
    if (key === 'currency') {
      form.setValue(key as any, value);
    }
  };

  async function fetchSubCategories(categoryKey: string) {
    const subCategoriesResponse = await getCategories(locale, categoryKey);
    if (subCategoriesResponse) {
      setSubCategories(subCategoriesResponse);
    }
  }

  const handleFormSubmit = (data: ProductFormData) => onSubmit(data);

  const handleParentCategoryChange = (value: string) => {
    const selectedCategory = topCategories.find((category) => category.category_key === value) || null;
    if (selectedCategory) {
      setParentCategory(selectedCategory);
      fetchSubCategories(selectedCategory.category_key);
    }
  };

  useEffect(() => {
    const fetchBreadcrumbs = async () => {
      if (defaultValues?.category) {
        const categoryBreadcrumbs = await getCategoryBreadcrumbs(locale, defaultValues.category.toString());
        if (categoryBreadcrumbs) {
          const [initParentCategory,] = categoryBreadcrumbs;

          if (initParentCategory) {
            setParentCategory(initParentCategory);
            fetchSubCategories(initParentCategory.category_key);
          }
        }
      }
    };
    fetchBreadcrumbs();
  }, [defaultValues?.category, locale]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="p-4 space-y-6">
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>{t("adForm.categoryLabel")}</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={parentCategory?.id.toString() ?? ""} onValueChange={handleParentCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {topCategories.map((category, i) => (
                        <SelectItem key={i} value={category.id.toString()}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Sub-Category Field */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <>
                        <FormControl>
                          <Select value={field.value?.toString() ?? ""} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {subCategories.map((category, i) => (
                                <SelectItem key={i} value={category.id.toString()}>{category.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </>
                    )}
                  />
                </div>
              </FormItem>

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

              <div className="grid grid-cols-2 gap-2">
                <FormItem>
                  <FormLabel>{t("adForm.priceLabel")}</FormLabel>
                  <div className="relative">
                    <FormField
                      control={form.control}
                      name="price"
                      rules={{
                        required: 'Price is required', // Validation rule: price is mandatory
                        pattern: {
                          value: /^\d+(\.\d{1,2})?$/, // Validation rule: allows integers or decimals with up to 2 decimal places
                          message: 'Invalid price format. e.g., 123 or 123.45', // Error message for invalid format
                        },
                      }}
                      render={({ field }) => (
                        <>
                          <FormControl>
                            <PriceInput
                              {...field}
                              setValue={handleSetCurrency}
                              placeholder={t("adForm.pricePlaceholder")}
                              selectedCurrencyCode={selectedCurrencyCode}
                            />
                          </FormControl>
                          <FormMessage />
                        </>
                      )}
                    />
                  </div>
                </FormItem>

                <FormItem>
                  <FormLabel>{t("adForm.conditionLabel")}</FormLabel>
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormControl>
                        <Select value={(field.value as unknown as string)} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Condition" />
                          </SelectTrigger>
                          <SelectContent>
                            {productConditionEnum.map((cond, i) => (
                              <SelectItem key={i} value={cond}>{t(`condition.${cond.toLowerCase()}`)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    )}
                  />
                </FormItem>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="p-4 space-y-6">
              <FormItem>
                <h3 className="text-lg font-semibold mb-3">{t("adForm.featureImage")}</h3>
                {defaultValues?.image_url && (
                  <div className="relative">
                    <Image
                      src={defaultValues.image_url}
                      alt="Product Image"
                      sizes="100vw"
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                      width={500}
                      height={300}

                      className="h-auto w-full rounded-lg"
                    />
                  </div>
                )}
              </FormItem>
              <FormItem>
                <h3 className="text-lg font-semibold mb-3">{t("adForm.imageGalleryTitle")}</h3>
                <ImageGalleryUpload
                  control={form.control}
                />
              </FormItem>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button type="reset" size="lg" className="font-bold me-2" variant="secondary">{t("cancel")}</Button>
          <Button type="submit" size="lg" className="font-bold" disabled={loading}>{loading ? t("adForm.submittingButton") : t("adForm.submitButton")}</Button>
        </div>
      </form>
    </Form >
  );
}