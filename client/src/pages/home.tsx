import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Upload from "@/pages/upload";
import MarketplaceSelection from "@/pages/marketplace-selection";
import Analysis from "@/pages/analysis";
import Review from "@/pages/review";
import Export from "@/pages/export";
import ProcessStepper, { Step } from "@/components/ui/process-stepper";
import { Marketplace, Product, ProcessStep } from "@/types";
import { useStore } from "@/store/enhancer-store";

export function Home() {
  const [currentStep, setCurrentStep] = useState<ProcessStep>("upload");
  
  const { 
    uploadedFile, 
    setUploadedFile,
    selectedMarketplace,
    setSelectedMarketplace,
    productData,
    setProductData,
    enhancedData,
    setEnhancedData
  } = useStore();
  
  const steps: Step[] = [
    { 
      id: 1, 
      name: "Upload CSV", 
      status: currentStep === "upload" ? "active" : 
        (uploadedFile ? "completed" : "pending") 
    },
    { 
      id: 2, 
      name: "Select Marketplace", 
      status: currentStep === "marketplace" ? "active" : 
        (selectedMarketplace ? "completed" : 
          (uploadedFile ? "pending" : "pending")) 
    },
    { 
      id: 3, 
      name: "Analyze & Complete", 
      status: currentStep === "analyze" ? "active" : 
        (enhancedData.length > 0 ? "completed" : "pending") 
    },
    { 
      id: 4, 
      name: "Review", 
      status: currentStep === "review" ? "active" : 
        (currentStep === "export" ? "completed" : "pending") 
    },
    { 
      id: 5, 
      name: "Export", 
      status: currentStep === "export" ? "active" : "pending" 
    }
  ];
  
  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setCurrentStep("marketplace");
  };
  
  const handleMarketplaceSelect = (marketplace: Marketplace) => {
    setSelectedMarketplace(marketplace);
    setCurrentStep("analyze");
  };
  
  const handleAnalysisComplete = (enhancedProducts: Product[]) => {
    setEnhancedData(enhancedProducts);
    setCurrentStep("review");
  };
  
  const handleReviewComplete = () => {
    setCurrentStep("export");
  };
  
  const handleBack = () => {
    switch (currentStep) {
      case "marketplace":
        setCurrentStep("upload");
        break;
      case "analyze":
        setCurrentStep("marketplace");
        break;
      case "review":
        setCurrentStep("analyze");
        break;
      case "export":
        setCurrentStep("review");
        break;
      default:
        break;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProcessStepper steps={steps} />
          
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {currentStep === "upload" && (
              <Upload onFileUpload={handleFileUpload} />
            )}
            
            {currentStep === "marketplace" && (
              <MarketplaceSelection 
                onMarketplaceSelect={handleMarketplaceSelect}
                onBack={handleBack}
              />
            )}
            
            {currentStep === "analyze" && (
              <Analysis 
                file={uploadedFile}
                marketplace={selectedMarketplace}
                onComplete={handleAnalysisComplete}
                onBack={handleBack}
                productData={productData}
                setProductData={setProductData}
              />
            )}
            
            {currentStep === "review" && (
              <Review 
                enhancedData={enhancedData}
                marketplace={selectedMarketplace?.name || ""}
                onContinue={handleReviewComplete}
                onBack={handleBack}
                onUpdateProduct={(updatedProduct) => {
                  const updated = enhancedData.map(p => 
                    p.product_id === updatedProduct.product_id ? updatedProduct : p
                  );
                  setEnhancedData(updated);
                }}
              />
            )}
            
            {currentStep === "export" && (
              <Export 
                enhancedData={enhancedData}
                marketplace={selectedMarketplace?.name || ""}
                onBack={handleBack}
              />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default Home;
