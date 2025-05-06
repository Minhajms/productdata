import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Marketplace, Product } from "@/types";
import { Clock, AlertTriangle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";

interface AnalysisProps {
  file: File | null;
  marketplace: Marketplace | null;
  onComplete: (enhancedProducts: Product[]) => void;
  onBack: () => void;
  productData: Product[];
  setProductData: (data: Product[]) => void;
}

export function Analysis({ file, marketplace, onComplete, onBack, productData, setProductData }: AnalysisProps) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<{ message: string; type: "info" | "success" | "warning" | "error" }[]>([]);
  const [processing, setProcessing] = useState(true);
  const { toast } = useToast();
  
  // Upload file for processing
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiRequest("POST", "/api/upload", formData);
      return res.json();
    },
    onSuccess: (data) => {
      if (data && data.products) {
        setProductData(data.products);
        
        // Add log message
        addLog(`Starting data analysis for ${data.products.length} products`, "info");
        analyzeData(data.products);
      }
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Could not upload CSV file. Please try again.",
        variant: "destructive",
      });
      setProcessing(false);
    }
  });
  
  const enhanceMutation = useMutation({
    mutationFn: async (payload: { products: Product[], marketplace: string }) => {
      const res = await apiRequest("POST", "/api/enhance", payload);
      return res.json();
    },
    onSuccess: (data) => {
      setProgress(100);
      addLog("All products processed successfully", "success");
      
      setTimeout(() => {
        setProcessing(false);
        onComplete(data.enhancedProducts);
      }, 1000);
    },
    onError: (error) => {
      console.error("Enhancement error:", error);
      toast({
        title: "Enhancement failed",
        description: "Could not complete the enhancement process. Please try again.",
        variant: "destructive",
      });
      setProcessing(false);
    }
  });
  
  const addLog = (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message: `${timestamp} - ${message}`, type }]);
  };
  
  const analyzeData = (products: Product[]) => {
    if (!marketplace) return;
    
    // Identify missing fields
    let missingFieldsCount = 0;
    const requiredFields = marketplace.requirements.filter(r => r.required).map(r => r.name.toLowerCase());
    
    products.forEach((product, index) => {
      const productMissingFields = requiredFields.filter(field => {
        const normalizedField = field.toLowerCase().replace(/\s+/g, '_');
        return !product[normalizedField as keyof Product];
      });
      
      if (productMissingFields.length > 0) {
        missingFieldsCount++;
        addLog(`Identified ${productMissingFields.length} missing fields for Product ID: ${product.product_id}`, "warning");
      }
      
      // Update progress
      const newProgress = Math.min(50, Math.round(((index + 1) / products.length) * 50));
      setProgress(newProgress);
    });
    
    addLog(`Analysis complete. Found ${missingFieldsCount} products with missing required fields`, "info");
    
    // Start enhancement
    enhanceProducts(products);
  };
  
  const enhanceProducts = (products: Product[]) => {
    if (!marketplace) return;
    
    addLog("Starting content generation with Gemini API", "info");
    
    // Call the backend to enhance products
    enhanceMutation.mutate({ 
      products,
      marketplace: marketplace.name
    });
    
    // Simulate progress for better UX
    const simulateProgress = () => {
      setProgress(prev => {
        if (prev >= 99) return prev;
        const increment = Math.random() * 3 + 1; // 1-4% increment
        return Math.min(99, prev + increment);
      });
    };
    
    const progressInterval = setInterval(simulateProgress, 300);
    
    // Clear interval when mutation completes
    return () => clearInterval(progressInterval);
  };
  
  useEffect(() => {
    if (file && marketplace) {
      // Upload the file for processing
      const formData = new FormData();
      formData.append("file", file);
      formData.append("marketplace", marketplace.name);
      
      addLog(`Starting upload of ${file.name}`, "info");
      uploadMutation.mutate(formData);
    }
  }, [file, marketplace]);
  
  const handleCancel = () => {
    setProcessing(false);
    onBack();
  };

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Data</h2>
      <p className="text-gray-600 mb-6">
        We're identifying missing fields and optimizing your product listings for {marketplace?.name}.
      </p>
      
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Processing Status</h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-4 w-4 mr-1" />
            {processing ? "In Progress" : "Complete"}
          </span>
        </div>
        
        <Progress value={progress} className="h-4 mb-2" />
        <p className="text-gray-500 text-sm">
          Processing {progress}% complete
          {productData.length > 0 && ` (${Math.round(productData.length * progress / 100)} of ${productData.length} products)`}
        </p>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-gray-700 font-medium">Missing Fields</h4>
              <span className="text-yellow-600 font-semibold">
                {productData.length > 0 ? Math.round(productData.length * 0.4) : "-"}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Fields that need completion</p>
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-gray-700 font-medium">Complete Fields</h4>
              <span className="text-green-600 font-semibold">
                {productData.length > 0 ? Math.round(productData.length * 0.6) : "-"}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Fields ready for submission</p>
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-gray-700 font-medium">Gemini API Calls</h4>
              <span className="text-blue-600 font-semibold">
                {productData.length > 0 ? Math.min(Math.round(progress / 5), productData.length) : "-"}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Content generation requests</p>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Log</h3>
        <div className="bg-gray-50 rounded-lg p-4 h-48 overflow-y-auto text-sm font-mono">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div 
                key={index} 
                className={cn(
                  log.type === "info" && "text-gray-500",
                  log.type === "success" && "text-green-600",
                  log.type === "warning" && "text-yellow-600",
                  log.type === "error" && "text-red-600",
                )}
              >
                {log.message}
              </div>
            ))
          ) : (
            <div className="text-gray-500">Waiting to start processing...</div>
          )}
        </div>
      </div>
      
      <Alert className="bg-yellow-50 border border-yellow-100 rounded-lg mb-8">
        <Clock className="h-4 w-4 text-yellow-500" />
        <AlertTitle className="text-yellow-800 font-medium text-sm">
          Processing time estimate
        </AlertTitle>
        <AlertDescription className="text-yellow-700 text-sm mt-1">
          Estimated time remaining: approximately {Math.max(2, 5 - Math.round(progress / 20))} minutes. 
          You can continue working in other tabs, we'll notify you when the process is complete.
        </AlertDescription>
      </Alert>
      
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          disabled={processing}
          onClick={() => onComplete(productData)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

export default Analysis;
