"use client"

import { useEffect, useState } from 'react'
import { PhotoUploader } from "@/components/ui/photo-uploader"
import StepContent from '../ui/step-content'
import { ProductFormData } from '@/types/product'
import { SellerAdForm } from './ad-form'
import { useAuth } from '@/components/auth/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/services/api/products'
import { Image as ImageData } from '@/types/image'
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog'
import { useLocation } from '../location-context'
import { useI18nContext } from '../locale-context'
import { useCategories } from '../categories-context'
import { uploadProductImages } from '@/services/api/images'


export default function SellerPostWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const { location } = useLocation();
  const { categories } = useCategories();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [productFormData, setProductFormData] = useState({} as ProductFormData);
  const { t } = useI18nContext();

  const {
    currentUser,
    firebaseIdToken,
    setShowRegisterDialog,
    setRegisterDialogDetails,
  } = useAuth();
  const totalSteps = 4;

  useEffect(() => {
    if (!currentUser) {
      setRegisterDialogDetails({
        title: t("postWizard.unlockSellingTitle"),
        description: t("postWizard.unlockSellingDescription"),
        onSuccess: () => {
          setShowRegisterDialog(false);
          toast({
            title: t("postWizard.registrationSuccessTitle"),
            description: t("postWizard.registrationSuccessDescription"),
            variant: "primary",
          });
        }
      });
    }
  }, [currentUser, setShowRegisterDialog, setRegisterDialogDetails, toast, t]);

  // Function to go to the next step
  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Function to go to the previous step
  // const prevStep = () => {
  //   if (currentStep > 0) {
  //     setCurrentStep(currentStep - 1);
  //   }
  // };

  // // Calculate progress percentage
  // const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  async function handleUploadComplete(imageData: ImageData): Promise<void> {
    setProductFormData({
      ...productFormData,
      ...location,
      image_url: imageData.image_url,
      image_key: imageData.image_key,
      title: imageData.suggested_title,
      category_id: imageData.suggested_category_id,
      condition: imageData.suggested_condition,
      attributes: imageData.suggested_attributes,
      description: imageData.suggested_description,
    });
    nextStep();
  }

  async function handleCreateProduct(formData: ProductFormData): Promise<void> {
    if (!currentUser) {
      return;
    }

    const newData = {
      ...productFormData,
      ...formData,
    };

    setProductFormData(newData);

    setLoading(true);
    setError(null);

    try {
      const newProduct = await createProduct(newData, firebaseIdToken!);
      // Update progress bar or any other UI elements if needed
      if (newData.images && newData.images.length > 0) {
        await uploadProductImages(newProduct.id, newData.images || [], firebaseIdToken!);
      }
      toast({
        title: t("postWizard.productCreatedTitle"),
        description: t("postWizard.productCreatedDescription"),
        variant: "success",
      });
      router.push("/my/ads/");
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      {/* {true && (
      )} */}
      {/* Progress Bar
        <div className="mb-8">
          <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-indigo-700">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-indigo-700">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div> */}

      {/* Step Content - Defined inline using conditional rendering */}
      <div key={currentStep} className="animate-fadeInSlideUp w-full flex-1 lg:max-w-6xl xl:max-w-7xl">
        {currentStep === 0 && (
          <StepContent className="mt-20 md:mt-24">
            <h1 className="max-w-2xl mx-auto text-center font-bold text-4xl text-gray-900 mb-5 md:text-5xl">
              {t("postWizard.photoToOfferTitle")}
              <span className="text-indigo-600">{t("postWizard.photoToOfferTitleHighlight")}</span>.
            </h1>
            <p className="max-w-sm mx-auto text-center font-normal mt-4 text-lg text-gray-500 md:text-xl md:leading-8 md:max-w-2xl">
              {t("postWizard.photoToOfferDescription")}
            </p>
            <div className="flex flex-col align-center justify-center max-w-lg mx-auto py-6 w-full">
              <div className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 rounded-4lg">
                <PhotoUploader
                  onUploadComplete={handleUploadComplete}
                />
              </div>
            </div>
            {/* <div className="flex-1 mx-auto max-w-xs text-center mt-48">
            <p className="max-w-sm text-sm text-gray-500 tracking-0 font-extralight">AI can make mistakes, so double-check that the results are accurate and fits your needs.</p>
          </div> */}
          </StepContent>
        )}
        {currentStep === 1 && (
          <StepContent className="md:mt-10">
            <h3 className="w-full text-center font-bold text-2xl text-gray-900 mb-5 md:text-4xl">
              {t("postWizard.aiSuggestionsReadyTitle")}
            </h3>
            <div className="bg-white p-6 rounded-md shadow-md">
              <SellerAdForm
                defaultValues={productFormData}
                topCategories={categories}
                loading={loading}
                onSubmit={handleCreateProduct}
              />
              <Dialog open={!!error} onOpenChange={() => setError(null)}>
                <DialogContent>
                  <DialogTitle className="text-red-600">
                    {t("postWizard.errorCreateAdTitle")}
                  </DialogTitle>
                  {error && (
                    <span>{error.name}</span>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </StepContent>
        )}
        {/* {currentStep === 3 && (
          <StepContent>
            Step 4: Completion
          </StepContent>
        )} */}
      </div>
    </div>
  );
}
