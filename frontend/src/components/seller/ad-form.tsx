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
import Message from "../ui/message";
import AutoCompleteLocation from "../ui/autocomplete-location";
import { Separator } from "../ui/separator";

const productFormSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  price: z.number({ required_error: "Price is required." }).positive({ message: "Price must be a positive number." }),
  min_acceptable_price: z.number({ required_error: "Minimum acceptable price is required." }).positive({ message: "Minimum acceptable price must be a positive number." }),
  condition: z.enum(productConditionEnum).optional(),
  category_id: z.number({ required_error: "Category is required." }),
  currency: z.string(),
  location_text: z.string().optional(),
  seller_phone: z.string({ required_error: "Phone number is required." }).optional(),
  seller_name: z.string({ required_error: "Name is required." }).min(1, { message: "Name must be at least 1 character long." }).optional(),
  seller_allowed_to_contact: z.boolean().optional(),
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
  editMode?: boolean;
  onSubmit: (data: ProductFormData) => void;
}

export function SellerAdForm({
  defaultValues,
  topCategories,
  loading = false,
  editMode = false,
  onSubmit,
}: SellerAdFormProps) {
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
    const selectedCategory = topCategories.find((category) => category.id.toString() === value) || null;
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
  }, [defaultValues?.category_id, locale]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        {Object.keys(errors).length > 0 && (
          <div className="mb-4">
            <Message
              type="error"
              message={`${t("form.errorMessage")} ${errorFieldNames}`}
              title={t("form.errorTitle")}
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
                  <Select value={parentCategory?.id.toString() ?? ""} onValueChange={handleParentCategoryChange} dir={locale === "he" ? "rtl" : "ltr"}>
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
                          <Select value={field.value.toString()} onValueChange={(value) => field.onChange(parseInt(value))} dir={locale === "he" ? "rtl" : "ltr"}>
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
                  <FormLabel>{t("adForm.minPriceLabel")}</FormLabel>
                  <div className="relative">
                    <FormField
                      control={form.control}
                      name="min_acceptable_price"
                      render={({ field }) => (
                        <>
                          <FormControl>
                            <PriceInput
                              {...field}
                              setValue={handleSetCurrency}
                              placeholder={t("adForm.minPricePlaceholder")}
                              selectedCurrencyCode={selectedCurrencyCode}
                            />
                          </FormControl>
                          <FormMessage />
                          {/* <p className="text-xs text-gray-600 mt-1">{t("adForm.minPriceHintText")}</p> */}
                        </>
                      )}
                    />
                  </div>
                </FormItem>
              </div>

              <FormItem>
                <FormLabel>{t("adForm.conditionLabel")}</FormLabel>
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormControl>
                      <Select value={(field.value as unknown as string)} onValueChange={field.onChange} dir={locale === "he" ? "rtl" : "ltr"}>
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

              {editMode && (
                <>
                  <Separator className="my-6" />
                  <FormItem>
                    <FormLabel>{t("adForm.locationLabel")}</FormLabel>
                    <FormField
                      control={form.control}
                      name="location_text"
                      render={({ field }) => (
                        <>
                          <FormControl>
                            <AutoCompleteLocation
                              placeholder={t("adForm.locationPlaceholder")}
                              initialValue={defaultValues?.location_text || ""}
                              onLocationSelect={(location) => {
                                field.onChange(location?.name || "");
                              }}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-600">{t("contactForm.locationHintText")}</p>
                          <FormMessage />
                        </>
                      )}
                    />
                  </FormItem>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="seller_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contactForm.nameLabel")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seller_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contactForm.phoneLabel")}</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="seller_allowed_to_contact"
                    render={({ field }) => (
                      <div>
                        <div className="flex items-center mb-2">
                          <FormControl className="me-2">
                            <input
                              {...field}
                              id="allowToShowContact"
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              checked={!!field.value}
                              value={field.value ? "true" : "false"}
                            />
                          </FormControl>
                          <FormLabel htmlFor="allowToShowContact">{t("contactForm.allowToShowContactLabel")}</FormLabel>
                        </div>
                        <FormMessage />
                        <p className="text-xs text-gray-600">{t("contactForm.allowToShowContactHint")}</p>
                      </div>
                    )}
                  />
                </>
              )}
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