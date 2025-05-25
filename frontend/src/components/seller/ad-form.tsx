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
import { useEffect, useState, useMemo } from "react";
import { useI18nContext } from "../locale-context";
import { Category } from "@/types/category";
import { getCategories, getCategoryBreadcrumbs } from "@/services/api/categories";
import { productConditionEnum, ProductFormData } from "@/types/product";
import PriceInput from "../ui/price-input";
import { getLocalCurrency } from "@/lib/utils";
import Image from "next/image";
import ImageGalleryUpload from "../ui/image-gallery-upload";
import AttributesInput from "../ui/attributes-input";
import Message from "../ui/message";

// Define the Zod schema for ProductFormData
const productFormSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  price: z.number({ required_error: "Price is required." }).positive({ message: "Price must be a positive number." }),
  condition: z.enum(productConditionEnum).optional(),
  category_id: z.number({ required_error: "Category is required." }),
  currency: z.string(),
  attributes: z.record(z.string(), z.string()).optional().default({}),
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

  const initCurrency = defaultValues?.currency || getLocalCurrency(locale);

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      ...defaultValues,
      currency: defaultValues?.currency || initCurrency,
      images: defaultValues?.images || [],
      attributes: defaultValues?.attributes || {},
    }
  });

  const { formState: { errors } } = form;

  const formErrorMessages = useMemo(() => {
    if (!Object.keys(errors).length) return [];

    return Object.entries(errors)
      /* eslint-disable @typescript-eslint/no-unused-vars */
      .filter(([_, error]) => error && error.message)
      .map(([field, error]) => ({
        field: field.charAt(0).toUpperCase() + field.slice(1),
        message: error?.message as string
      }));
  }, [errors]);

  // Extract field names with errors for the summary
  const errorFieldNames = useMemo(() => {
    return Object.keys(errors)
      .map(field => field.charAt(0).toUpperCase() + field.slice(1))
      .join(', ');
  }, [errors]);

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
      if (defaultValues?.category_id) {
        const categoryBreadcrumbs = await getCategoryBreadcrumbs(locale, defaultValues.category_id.toString());
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
  }, [fetchSubCategories, defaultValues?.category_id, locale]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        {Object.keys(errors).length > 0 && (
          <div className="mb-4">
            <Message
              type="error"
              message={`${t("adForm.errorMessage")} ${errorFieldNames}`}
              title={t("adForm.errorTitle")}
            />
            {formErrorMessages.length > 0 && (
              <ul className="mt-2 list-disc list-inside pl-4 text-sm text-red-600">
                {formErrorMessages.map((error, index) => (
                  <li key={index}>
                    <strong>{error.field}:</strong> {error.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="px-4 space-y-6">
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
                    name="category_id"
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

              {/* Attributes Section */}
              <FormItem>
                <FormLabel>{t("adForm.attributesLabel") || "Attributes"}</FormLabel>
                <FormField
                  control={form.control}
                  name="attributes"
                  render={({ field }) => (
                    <FormControl>
                      <AttributesInput
                        value={field.value || {}}
                        onChange={field.onChange}
                        placeholder={{
                          key: t("adForm.attributeKeyPlaceholder") || "Brand, Size, Model...",
                          value: t("adForm.attributeValuePlaceholder") || "Value..."
                        }}
                      />
                    </FormControl>
                  )}
                />
                <FormMessage />
              </FormItem>
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