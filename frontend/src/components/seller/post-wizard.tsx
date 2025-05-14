"use client"

import { useState } from 'react'
import Image from 'next/image'
import { PhotoUploader } from "@/components/ui/photo-uploader"
import StepContent from '../ui/step-content'
import { ProductFormData } from '@/types/product'
import { SellerAdForm } from './ad-form'
import { Card, CardContent } from '../ui/card'
import { cn } from '@/lib/utils'

export default function SellerPostWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [productFormData, setProductFormData] = useState<ProductFormData>();
  const [suggestedCategory, setSuggestedCategory] = useState<string>();
  const totalSteps = 4;

  // Function to go to the next step
  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle finish logic, e.g., submit data, redirect, etc.
      alert('Wizard Finished!'); // Using alert as a placeholder
      // Optionally reset to the first step
      // setCurrentStep(0);
    }
  };

  // Function to go to the previous step
  // const prevStep = () => {
  //   if (currentStep > 0) {
  //     setCurrentStep(currentStep - 1);
  //   }
  // };

  // Determine button texts
  // const isLastStep = currentStep === totalSteps - 1;
  // const nextButtonText = isLastStep ? 'Finish' : 'Next';

  // // Calculate progress percentage
  // const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  function handleUploadComplete(imageData: Error | any): void {
    setSuggestedCategory(imageData.suggested_category);
    setProductFormData({
      ...productFormData,
      title: imageData.suggested_title,
      image_url: imageData.image_url,
      category: imageData.suggested_category,
      description: imageData.suggested_description,
    });
    nextStep();
  }

  return (
    <>
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
            <StepContent className="mt-16 md:mt-20">
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
                            objectFit="fill"
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
                    onSubmit={(data) => {
                      setProductFormData({
                        ...productFormData,
                        ...data,
                      });
                      console.log('Form Data:', data);
                    }}
                  />
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

        {/* Navigation Buttons
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg shadow hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
          >
            Previous
          </button>
          <button
            onClick={nextStep}
            className={`px-6 py-3 rounded-lg shadow text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-opacity-75 ${isLastStep
              ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-600'
              }`}
          >
            {nextButtonText}
          </button>
        </div> */}
      </div>
      <p className="text-center text-sm text-white mt-8">
        A Basic React Wizard (Inline Steps).
      </p>
    </>
  );
}
