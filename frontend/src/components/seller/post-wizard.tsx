"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { PhotoUploader } from "@/components/ui/photo-uploader"
import StepContent from '../ui/step-content'
import { Category, ProductFormData } from '@/types/product'
import { SellerAdForm } from './ad-form'
import { Card, CardContent } from '../ui/card'
import { cn, getCategoryByValue } from '@/lib/utils'
import { useAuth } from '@/components/auth/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/services/api/products'
import { Image as ImageData } from '@/types/image'
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog'


export default function SellerPostWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [productFormData, setProductFormData] = useState<ProductFormData>();
  const [suggestedCategory, setSuggestedCategory] = useState<Category>();

  const {
    currentUser,
    firebaseIdToken,
    setShowRegisterDialog,
    setRegisterDialogDetails,
  } = useAuth();
  const totalSteps = 4;

  useEffect(() => {
    if (!currentUser) {
      console.log("User is not logged in");

      setRegisterDialogDetails({
        title: "Unlock Smart Selling!",
        description: "Create a free account in seconds to post your ad and let AI assist you.",
        onSuccess: () => {
          setShowRegisterDialog(false);
          toast({ title: "🥳 Awesome!", description: "You're all set. Time to hit 'Submit' to publish your ad.", variant: "primary", });
        }
      });
    }
  }, [currentUser]);

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

  function handleUploadComplete(imageData: ImageData): void {
    console.log("Image upload complete:", imageData);
    if (imageData.suggested_category) {
      const category = getCategoryByValue(imageData.suggested_category);
      if (category) {
        setSuggestedCategory(category);
      }
    }
    setProductFormData({
      ...productFormData,
      title: imageData.suggested_title,
      image_url: imageData.image_url,
      image_key: imageData.image_key,
      category: imageData.suggested_category,
      description: imageData.suggested_description,
    });
    nextStep();
  }

  async function handleCreateProduct(formData: ProductFormData): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const newProduct = await createProduct(formData, firebaseIdToken!);
      console.log({ newProduct });
      toast({
        title: "Product Created!",
        description: "Your product has been successfully created.",
        variant: "success",
      });
      router.push("/");
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
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
      <div key={currentStep} className="animate-fadeInSlideUp">
        {currentStep === 0 && (
          <StepContent className="mt-20 md:mt-32">
            <h1 className="max-w-2xl mx-auto text-center font-bold text-4xl text-gray-900 mb-5 md:text-5xl">
              Turn Your Photo into a Perfect Offer,
              <span className="text-indigo-600">{` Instantly`}</span>.
            </h1>
            <p className="max-w-sm mx-auto text-center font-normal mt-4 text-lg text-gray-500 md:text-xl md:leading-8 md:max-w-2xl">
              Upload your item&apos;s photo, and our intelligent AI will help you create an optimized listing designed to sell quickly and effortlessly.
            </p>
            <div className="flex flex-col align-center justify-center max-w-lg mx-auto py-6 w-full">
              <div className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 rounded-4lg">
                <PhotoUploader onUploadComplete={handleUploadComplete} />
              </div>
            </div>
            {/* <div className="flex-1 mx-auto max-w-xs text-center mt-48">
            <p className="max-w-sm text-sm text-gray-500 tracking-0 font-extralight">AI can make mistakes, so double-check that the results are accurate and fits your needs.</p>
          </div> */}
          </StepContent>
        )}
        {currentStep === 1 && (
          <StepContent className="m-16 md:mt-20">
            <h3 className="max-w-2xl mx-auto text-center font-bold text-2xl text-gray-900 mb-5 md:text-4xl">
              Your AI Suggestions Are Ready! Please Verify & Submit
            </h3>
            <div className="w-full container bg-white p-8 rounded-xl shadow-2xl lg:max-w-3xl">
              {productFormData?.category && (
                <div className="flex justify-center my-4">
                  <Card
                    className={cn(
                      "flex flex-col shadow-sm rounded-xl",
                      "ring-1 ring-primary-100",
                    )}
                  >
                    <CardContent className="p-0">
                      <div className="relative h-48 w-96">
                        <Image
                          src={productFormData.image_url!}
                          alt="Logo"
                          layout="fill"
                          objectFit="contain"
                          className="rounded-lg aspect-square object-cover"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              <div className="text-card-foreground">
                <SellerAdForm
                  defaultValues={productFormData}
                  suggestedCategory={suggestedCategory}
                  loading={loading}
                  onSubmit={(data) => {
                    if (!currentUser) {
                      setShowRegisterDialog(true);
                      return;
                    }
                    const newData = {
                      ...productFormData,
                      ...data,
                    };
                    setProductFormData(newData);
                    handleCreateProduct(newData);
                  }}
                />
                <Dialog open={!!error} onOpenChange={() => setError(null)}>
                  <DialogContent>
                    <DialogTitle className="text-red-600">
                      Unable to create your ad.
                    </DialogTitle>
                    {error && (
                      <span>{error.name}</span>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </StepContent>
        )}
        {currentStep === 2 && (
          <StepContent>
            Step 3: Summary
          </StepContent>
        )}
        {currentStep === 3 && (
          <StepContent>
            Step 4: Completion
          </StepContent>
        )}
      </div>
    </div>
  );
}
