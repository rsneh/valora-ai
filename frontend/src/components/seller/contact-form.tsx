"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMemo } from "react";
import { useI18nContext } from "../locale-context";
import { ContactFormData, Product } from "@/types/product";
import Message from "../ui/message";
import { ProductCard } from "../product/product-card";
import AutoCompleteLocation from "../ui/autocomplete-location";
import { Separator } from "../ui/separator";

const contactFormSchema = z.object({
  product_id: z.number(),
  location_text: z.string().min(1, { message: "Location is required." }),
  seller_phone: z.string({ required_error: "Phone number is required." }),
  seller_name: z.string({ required_error: "Name is required." }).min(1, { message: "Name must be at least 1 character long." }),
  seller_allowed_to_contact: z.boolean().optional(),
});

interface SellerAdContactFormProps {
  product?: Product;
  defaultValues: ContactFormData;
  loading?: boolean;
  onSubmit: (data: ContactFormData) => void;
}

export function SellerAdContactForm({ defaultValues, product, loading = false, onSubmit }: SellerAdContactFormProps) {
  const { t } = useI18nContext();

  const form = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      seller_name: defaultValues.seller_name || "",
      seller_phone: defaultValues.seller_phone || "",
      location_text: defaultValues.location_text || "",
      product_id: defaultValues.product_id,
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

  const handleFormSubmit = (data: ContactFormData) => onSubmit(data);

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
            <h3 className="text-xl mb-2">{t("postWizard.sellerContactFormDescription")}</h3>
            <FormField
              control={form.control}
              name="location_text"
              render={({ field }) => (
                <FormItem>
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
                </FormItem>
              )}
            />

            <Separator className="my-10" />

            <h3 className="text-xl mb-4">{t("contactForm.contactDetails")}</h3>
            <div className="space-y-6">
              <FormItem>
                <FormLabel>{t("contactForm.emailLabel")}</FormLabel>
                <FormControl>
                  <Input
                    defaultValue={defaultValues?.email || ""}
                    disabled
                  />
                </FormControl>
                <p className="text-xs text-gray-600">{t("contactForm.emailHintText")}</p>
                <FormMessage />
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

            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="p-4 space-y-6">
              {product && (
                <ProductCard product={product} showFavorite={false} />
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button type="submit" size="lg" className="font-bold" disabled={loading}>{loading ? t("adForm.publishingButton") : t("adForm.publishButton")}</Button>
        </div>
      </form>
    </Form >
  );
}