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
                  <Select defaultValue={parentCategory?.category_key} onValueChange={handleParentCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {topCategories.map((category, i) => (
                        <SelectItem key={i} value={category.category_key}>{category.name}</SelectItem>
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
                          <Select value={field.value.toString()} onValueChange={field.onChange}>
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
                <h3 className="text-lg font-semibold mb-3">Feature Image</h3>
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
                <h3 className="text-lg font-semibold mb-3">Image Gallery</h3>
                <div
                  className="border-2 border-dashed border-gray-400 rounded-md p-6 text-center cursor-pointer"
                >
                  <label htmlFor="imageUpload" className="block text-gray-600 text-sm">
                    Drag & Drop files here or <span className="text-blue-500 hover:underline">Click to Upload</span>
                  </label>
                  <input
                    type="file"
                    id="imageUpload"
                    className="hidden"
                    multiple
                    accept="image/*"
                  />
                  {[1].length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[0, 0, 0, 0, 5].map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={`https://flowbite.s3.amazonaws.com/docs/gallery/square/image-${index + 1}.jpg`}
                            alt={`Product Image ${index + 1}`}
                            className="w-full h-20 object-cover rounded-md"
                          />
                          <button
                            className="absolute top-0 right-0 bg-gray-200 hover:bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-gray-700 text-xs"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                      {[].length < 5 && (
                        <div className="border-2 border-gray-300 border-dashed rounded-md h-20 flex items-center justify-center text-gray-400">
                          {/* Placeholder for adding more images */}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-gray-500 text-xs mt-2">Recommended size: 1000x1000px, Max 5MB, JPG, PNG</p>
                </div>
              </FormItem>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button type="reset" size="lg" className="font-bold me-2" variant="secondary">Cancel</Button>
          <Button type="submit" size="lg" className="font-bold" disabled={loading}>{loading ? t("adForm.submittingButton") : t("adForm.submitButton")}</Button>
        </div>
      </form>
    </Form >
  );
}