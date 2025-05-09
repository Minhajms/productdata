import { useState } from "react";
import { useLocation } from "wouter";
import { Upload } from "./upload";
import { Analysis } from "./analysis";
import { Enhancement } from "./enhancement";
import { Export } from "./export";
import { useToast } from "@/hooks/use-toast";
import { Steps, Step } from "@/components/ui/steps";

export function ApplicationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  
  // Mock steps for the workflow
  const steps = [
    { title: "Upload", description: "Upload product data" },
    { title: "Analysis", description: "Analyze product information" },
    { title: "Enhancement", description: "Enhance with AI" },
    { title: "Export", description: "Export enhanced data" },
  ];
  
  // Handle file upload from Upload component
  const handleFileUpload = async (file: File) => {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append("file", file);
      
      // Upload file to server
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
      
      const data = await response.json();
      
      // Debug the response data
      console.log(`Received ${data.products?.length || 0} products from server:`, data.products);
      
      // Set products from response
      setProducts(data.products);
      
      // Move to analysis step
      setCurrentStep(1);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error uploading file",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    }
  };
  
  // Mock file upload for development purposes
  const handleMockFileUpload = (file: File) => {
    // Mock products data
    const mockProducts = [
      {
        product_id: "P001",
        title: "Wireless Headphones",
        description: "Bluetooth headphones with good sound quality",
        price: "59.99",
        category: "Electronics",
        status: "pending"
      },
      {
        product_id: "P002",
        title: "Coffee Maker",
        description: "12-cup programmable coffee maker",
        price: "49.99",
        category: "Kitchen",
        status: "pending"
      },
      {
        product_id: "P003",
        title: "Desk Lamp",
        description: "LED desk lamp with adjustable brightness",
        price: "29.99",
        category: "Home Office",
        status: "pending"
      }
    ];
    
    // Set mock products
    setProducts(mockProducts);
    
    // Move to analysis step
    setCurrentStep(1);
    
    // Show success toast
    toast({
      title: "File uploaded successfully",
      description: `${file.name} processed with ${mockProducts.length} products found`,
    });
  };
  
  // Handle completion of analysis
  const handleAnalysisComplete = () => {
    setCurrentStep(2);
  };
  
  // Handle completion of enhancement
  const handleEnhancementComplete = (enhancedProducts: any[]) => {
    setProducts(enhancedProducts);
    setCurrentStep(3);
  };
  
  // Handle back from enhancement to analysis
  const handleEnhancementBack = () => {
    setCurrentStep(1);
  };
  
  // Handle back from export to enhancement
  const handleExportBack = () => {
    setCurrentStep(2);
  };
  
  // Handle starting a new upload
  const handleNewUpload = () => {
    setProducts([]);
    setCurrentStep(0);
  };
  
  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <Upload onFileUpload={handleFileUpload} />;
      case 1:
        return <Analysis products={products} onAnalysisComplete={handleAnalysisComplete} />;
      case 2:
        return (
          <Enhancement 
            products={products} 
            onEnhancementComplete={handleEnhancementComplete} 
            onBack={handleEnhancementBack}
          />
        );
      case 3:
        return (
          <Export 
            products={products} 
            onBack={handleExportBack} 
            onNew={handleNewUpload}
          />
        );
      default:
        return <Upload onFileUpload={handleFileUpload} />;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header with steps */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">ProductEnhancer</span>
            </div>
            <div className="hidden md:block">
              <Steps current={currentStep} className="w-full max-w-xl">
                {steps.map((step, index) => (
                  <Step 
                    key={index} 
                    title={step.title}
                    status={
                      currentStep > index 
                        ? "complete" 
                        : currentStep === index 
                          ? "current" 
                          : "incomplete"
                    }
                  />
                ))}
              </Steps>
            </div>
            <div></div> {/* Placeholder for right side */}
          </div>
        </div>
      </header>
      
      {/* Mobile steps indicator - visible on small screens */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </span>
          <span className="text-xs text-gray-500">
            {steps[currentStep].description}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div 
            className="bg-blue-600 h-1.5 rounded-full" 
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-1 py-6">
        {renderStepContent()}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} ProductEnhancer. All rights reserved.
            </div>
            <div className="text-sm text-gray-500">
              Powered by AI
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ApplicationPage;