import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Product } from "@/types";
import { Download, Info, Eye } from "lucide-react";
import ProductPreviewModal from "@/components/product-preview-modal";
import { generateFileName } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ExportProps {
  enhancedData: Product[];
  marketplace: string;
  onBack: () => void;
}

export function Export({ enhancedData, marketplace, onBack }: ExportProps) {
  const [exportFormat, setExportFormat] = useState("standard_csv");
  const [productFilter, setProductFilter] = useState("all");
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [encodeUtf8, setEncodeUtf8] = useState(true);
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  
  // Calculate stats
  const totalProducts = enhancedData.length;
  const completeProducts = enhancedData.filter(p => 
    p.title && p.description && p.brand && p.category
  ).length;
  const warningProducts = enhancedData.filter(p => 
    (p.title && p.description) && (!p.brand || !p.category)
  ).length;
  const errorProducts = totalProducts - completeProducts - warningProducts;
  
  // Estimate file size based on the products data
  const estimateFileSize = () => {
    let totalSize = 0;
    
    // Headers size
    if (includeHeaders) {
      const headerFields = [
        "product_id", "title", "description", "price", "brand", "category", 
        "bullet_points", "images", "asin"
      ];
      totalSize += headerFields.join(",").length;
    }
    
    // Product data size (rough estimation)
    enhancedData.forEach(product => {
      let productSize = 0;
      productSize += (product.product_id || "").length;
      productSize += (product.title || "").length;
      productSize += (product.description || "").length;
      productSize += (product.price?.toString() || "").length;
      productSize += (product.brand || "").length;
      productSize += (product.category || "").length;
      productSize += (product.bullet_points?.join(";") || "").length;
      productSize += (product.images?.join(";") || "").length;
      productSize += (product.asin || "").length;
      
      // Add commas and newline
      productSize += 10; // approximately for separators
      
      totalSize += productSize;
    });
    
    // Convert to KB with 1 decimal point
    return (totalSize / 1024).toFixed(1) + " KB";
  };
  
  // This is the filter logic that would be applied during export
  const getFilteredProducts = () => {
    switch (productFilter) {
      case "complete_only":
        return enhancedData.filter(p => 
          p.title && p.description && p.brand && p.category
        );
      case "selected":
        // In a real implementation, this would use the selected products state
        return [];
      default:
        return enhancedData;
    }
  };
  
  const exportMutation = useMutation({
    mutationFn: async (data: {
      products: Product[];
      format: string;
      includeHeaders: boolean;
      encodeUtf8: boolean;
      marketplace: string;
    }) => {
      const res = await apiRequest("POST", "/api/export", data);
      return res.blob();
    },
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Generate filename
      const prefix = marketplace.toLowerCase().replace(/\s+/g, '_');
      a.download = generateFileName(prefix, "csv");
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export successful",
        description: `Your ${marketplace} product data has been exported`,
      });
    },
    onError: () => {
      toast({
        title: "Export failed",
        description: "Could not export product data. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleExport = () => {
    const products = getFilteredProducts();
    
    exportMutation.mutate({
      products,
      format: exportFormat,
      includeHeaders,
      encodeUtf8,
      marketplace
    });
  };
  
  const handlePreview = () => {
    // Show the preview modal with the first product
    if (enhancedData.length > 0) {
      setCurrentProduct(enhancedData[0]);
      setPreviewModalOpen(true);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Export Enhanced Data</h2>
      <p className="text-gray-600 mb-6">
        Your product data has been enhanced and is ready to export to {marketplace} format.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
            
            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700 mb-2">Export Format</Label>
              <Select
                value={exportFormat}
                onValueChange={setExportFormat}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard_csv">Standard CSV</SelectItem>
                  {marketplace === "Amazon" && (
                    <>
                      <SelectItem value="amazon_seller">Amazon Seller Central CSV</SelectItem>
                      <SelectItem value="amazon_vendor">Amazon Vendor Central CSV</SelectItem>
                      <SelectItem value="amazon_flat">Amazon Flat File</SelectItem>
                    </>
                  )}
                  {marketplace === "eBay" && (
                    <SelectItem value="ebay_format">eBay Format CSV</SelectItem>
                  )}
                  {marketplace === "Shopify" && (
                    <SelectItem value="shopify_format">Shopify Import CSV</SelectItem>
                  )}
                  {marketplace === "Walmart" && (
                    <SelectItem value="walmart_format">Walmart Marketplace CSV</SelectItem>
                  )}
                  {marketplace === "Etsy" && (
                    <SelectItem value="etsy_format">Etsy Listing CSV</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700 mb-2">Include Products</Label>
              <RadioGroup
                value={productFilter}
                onValueChange={setProductFilter}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all-products" />
                  <Label htmlFor="all-products">All Products ({totalProducts})</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="complete_only" id="complete-only" />
                  <Label htmlFor="complete-only">Complete Products Only ({completeProducts})</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="selected" id="selected-only" disabled />
                  <Label htmlFor="selected-only" className="text-gray-500">Selected Products (0)</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700 mb-2">Advanced Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-headers"
                    checked={includeHeaders}
                    onCheckedChange={(checked) => setIncludeHeaders(!!checked)}
                  />
                  <Label htmlFor="include-headers">Include Column Headers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="encode-utf8"
                    checked={encodeUtf8}
                    onCheckedChange={(checked) => setEncodeUtf8(!!checked)}
                  />
                  <Label htmlFor="encode-utf8">UTF-8 Encoding</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="save-template"
                    checked={saveTemplate}
                    onCheckedChange={(checked) => setSaveTemplate(!!checked)}
                  />
                  <Label htmlFor="save-template">Save Export Settings as Template</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Export Summary</h3>
            
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Total Products</dt>
                <dd className="text-sm font-semibold text-gray-900">{totalProducts}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Complete Products</dt>
                <dd className="text-sm font-semibold text-gray-900">{completeProducts}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Products with Warnings</dt>
                <dd className="text-sm font-semibold text-yellow-600">{warningProducts}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Products with Errors</dt>
                <dd className="text-sm font-semibold text-red-600">{errorProducts}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Marketplace</dt>
                <dd className="text-sm font-semibold text-gray-900">{marketplace}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Export Format</dt>
                <dd className="text-sm font-semibold text-gray-900">
                  {exportFormat === "standard_csv" ? "Standard CSV" :
                   exportFormat === "amazon_seller" ? "Amazon Seller Central CSV" :
                   exportFormat === "amazon_vendor" ? "Amazon Vendor Central CSV" :
                   exportFormat === "amazon_flat" ? "Amazon Flat File" :
                   exportFormat === "ebay_format" ? "eBay Format CSV" :
                   exportFormat === "shopify_format" ? "Shopify Import CSV" :
                   exportFormat === "walmart_format" ? "Walmart Marketplace CSV" :
                   exportFormat === "etsy_format" ? "Etsy Listing CSV" :
                   "Custom Format"
                  }
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">File Size (Estimated)</dt>
                <dd className="text-sm font-semibold text-gray-900">{estimateFileSize()}</dd>
              </div>
            </dl>
            
            <Alert className="mt-6 bg-gray-50 border border-gray-200">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm text-gray-700">
                {marketplace === "Amazon" ? 
                  "Amazon recommends reviewing all product listings in Seller Central after upload." :
                 marketplace === "eBay" ?
                  "eBay requires verification of listings before they go live." :
                 marketplace === "Shopify" ?
                  "Shopify allows bulk import of products through the admin interface." :
                 marketplace === "Walmart" ?
                  "Walmart Marketplace has a review process for new product listings." :
                 marketplace === "Etsy" ?
                  "Etsy requires manual review of listings after upload." :
                  "Review your product listings before making them public."
                }
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          variant="outline"
          onClick={handlePreview}
        >
          Preview Export
        </Button>
        <Button
          onClick={handleExport}
          disabled={exportMutation.isPending}
        >
          <Download className="h-4 w-4 mr-2" />
          {exportMutation.isPending ? "Exporting..." : "Export CSV"}
        </Button>
      </div>
      
      <ProductPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        product={currentProduct}
        marketplace={marketplace}
      />
    </div>
  );
}

export default Export;
