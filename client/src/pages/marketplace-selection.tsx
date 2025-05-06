import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CustomMarketplaceModal from "@/components/custom-marketplace-modal";
import { Info, PlusCircle, ShoppingCart, ShoppingBag, Package, Gift, CircleCheck } from "lucide-react";
import { Marketplace } from "@/types";
import { cn } from "@/lib/utils";
import { SiAmazon, SiEbay, SiShopify, SiWalmart, SiEtsy } from "react-icons/si";

interface MarketplaceSelectionProps {
  onMarketplaceSelect: (marketplace: Marketplace) => void;
  onBack: () => void;
}

export function MarketplaceSelection({ onMarketplaceSelect, onBack }: MarketplaceSelectionProps) {
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>("amazon");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const marketplaces: Marketplace[] = [
    {
      id: "amazon",
      name: "Amazon",
      description: "Global e-commerce",
      icon: SiAmazon,
      requirements: [
        { name: "ASIN", required: true },
        { name: "Title", required: true },
        { name: "Bullet Points", required: true },
        { name: "Description", required: true },
        { name: "Brand", required: true },
        { name: "Category", required: true },
        { name: "Price", required: true },
        { name: "Images", required: true }
      ]
    },
    {
      id: "ebay",
      name: "eBay",
      description: "Auction & fixed price",
      icon: SiEbay,
      requirements: [
        { name: "Item ID", required: true },
        { name: "Title", required: true },
        { name: "Condition", required: true },
        { name: "Description", required: true },
        { name: "Price", required: true },
        { name: "Category", required: true },
        { name: "Images", required: true }
      ]
    },
    {
      id: "shopify",
      name: "Shopify",
      description: "Custom store",
      icon: SiShopify,
      requirements: [
        { name: "Product ID", required: true },
        { name: "Title", required: true },
        { name: "Body HTML", required: true },
        { name: "Vendor", required: true },
        { name: "Product Type", required: true },
        { name: "Price", required: true }
      ]
    },
    {
      id: "walmart",
      name: "Walmart",
      description: "Mass market retail",
      icon: SiWalmart,
      requirements: [
        { name: "SKU", required: true },
        { name: "Product Name", required: true },
        { name: "Short Description", required: true },
        { name: "Long Description", required: true },
        { name: "Brand", required: true },
        { name: "Category", required: true },
        { name: "Price", required: true },
        { name: "Images", required: true }
      ]
    },
    {
      id: "etsy",
      name: "Etsy",
      description: "Handmade & vintage",
      icon: SiEtsy,
      requirements: [
        { name: "Listing ID", required: true },
        { name: "Title", required: true },
        { name: "Description", required: true },
        { name: "Materials", required: true },
        { name: "Price", required: true },
        { name: "Category", required: true },
        { name: "Tags", required: true },
        { name: "Images", required: true }
      ]
    }
  ];
  
  const handleMarketplaceClick = (id: string) => {
    setSelectedMarketplace(id);
  };
  
  const handleContinue = () => {
    if (!selectedMarketplace) return;
    
    const marketplace = marketplaces.find(m => m.id === selectedMarketplace);
    if (marketplace) {
      onMarketplaceSelect(marketplace);
    }
  };
  
  const handleCustomMarketplace = () => {
    setIsModalOpen(true);
  };
  
  const handleSaveCustomMarketplace = (customMarketplace: {
    name: string; 
    description: string; 
    requirements: { name: string; required: boolean }[]
  }) => {
    const newMarketplace: Marketplace = {
      id: `custom-${Date.now()}`,
      ...customMarketplace,
      icon: Package
    };
    
    // Add to marketplaces
    marketplaces.push(newMarketplace);
    
    // Select it
    setSelectedMarketplace(newMarketplace.id);
    
    // Close modal
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Target Marketplace</h2>
      <p className="text-gray-600 mb-6">
        Choose the marketplace where you want to list your products. We'll optimize your data based on their specific requirements.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {marketplaces.map((marketplace) => (
          <div
            key={marketplace.id}
            className={cn(
              "marketplace-card border rounded-lg p-5 cursor-pointer",
              selectedMarketplace === marketplace.id && "selected"
            )}
            onClick={() => handleMarketplaceClick(marketplace.id)}
          >
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                <marketplace.icon className="w-6 h-6" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-gray-900 font-medium">{marketplace.name}</h3>
                <p className="text-gray-500 text-sm">{marketplace.description}</p>
              </div>
              {selectedMarketplace === marketplace.id && (
                <CircleCheck className="text-primary h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Required Fields</p>
              <div className="flex flex-wrap gap-1.5">
                {marketplace.requirements.slice(0, 4).map((req, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {req.name}
                  </span>
                ))}
                {marketplace.requirements.length > 4 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    +{marketplace.requirements.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <div
          className="marketplace-card border border-dashed rounded-lg p-5 cursor-pointer flex flex-col items-center justify-center"
          onClick={handleCustomMarketplace}
        >
          <PlusCircle className="text-gray-400 h-8 w-8 mb-2" />
          <h3 className="text-gray-700 font-medium">Custom Marketplace</h3>
          <p className="text-gray-500 text-sm text-center mt-1">
            Define your own field requirements
          </p>
        </div>
      </div>
      
      {selectedMarketplace && (
        <Alert className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-800 font-medium text-sm">
            About {marketplaces.find(m => m.id === selectedMarketplace)?.name} Requirements
          </AlertTitle>
          <AlertDescription className="text-blue-700 text-sm mt-1">
            {selectedMarketplace === "amazon" && 
              "Amazon requires specific product data including ASIN, bullet points, product descriptions with specific character limits, and multiple high-quality images. Our tool will help you meet these requirements."}
            {selectedMarketplace === "ebay" && 
              "eBay requires clear item identification, accurate condition descriptions, and detailed product information. Our tool will optimize your listings for eBay's search algorithm."}
            {selectedMarketplace === "shopify" && 
              "Shopify stores need well-formatted product descriptions with HTML formatting, vendor information, and product categorization for effective navigation and search."}
            {selectedMarketplace === "walmart" && 
              "Walmart Marketplace has strict data quality requirements including detailed specifications, UPC codes, and rich content guidelines for product listings."}
            {selectedMarketplace === "etsy" && 
              "Etsy specializes in handmade and vintage items, requiring detailed materials descriptions, production methods, and relevant tags for discoverability."}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedMarketplace}
        >
          Continue
        </Button>
      </div>
      
      <CustomMarketplaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomMarketplace}
      />
    </div>
  );
}

export default MarketplaceSelection;
