import { useEffect, useState } from "react";
import FileUploader from "@/components/ui/file-uploader";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, Award, ArrowRight, FileText, Zap, BarChart3 } from "lucide-react";

interface UploadProps {
  onFileUpload: (file: File) => void;
}

export function Upload({ onFileUpload }: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (selectedFile: File) => {
    setFile(selectedFile);
    
    // Basic validation
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }
    
    // Just check the file extension - more thorough validation happens in the FileUploader component
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'csv') {
      toast({
        title: "Invalid file format",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "File uploaded successfully",
      description: `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)`,
    });
    
    onFileUpload(selectedFile);
  };

  // Before and after example for visual impact
  const beforeAfterExamples = [
    {
      before: "Wireless Headphones",
      after: "Premium Bluetooth 5.2 Headphones with Active Noise Cancellation, 40H Playtime & Hi-Fi Sound - Comfortable Over-Ear Design"
    },
    {
      before: "Coffee maker with timer",
      after: "Programmable 12-Cup Coffee Maker with Auto-Shut Off, Brew Strength Control & Thermal Carafe - Perfect for Home & Office"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero section with visual impact */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 mb-8 text-white shadow-lg">
        <div className="max-w-3xl">
          <Badge variant="outline" className="bg-white/10 text-white border-white/20 mb-4">
            AI-Powered Listing Optimization
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Transform Basic Product Data into 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-yellow-300 ml-2">
              High-Converting Listings
            </span>
          </h1>
          <p className="text-xl opacity-90 mb-6">
            Upload your product CSV and watch our AI transform incomplete listings into marketplace-ready content that sells.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-300" />
              <span className="text-sm">SEO-optimized titles</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-300" />
              <span className="text-sm">Persuasive descriptions</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-300" />
              <span className="text-sm">Compelling bullet points</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* Main upload box with clearer instructions */}
          <Card className="border-2 border-blue-100 shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Upload Your Product Data</h2>
                  <p className="text-gray-500">
                    Your data is secure and private
                  </p>
                </div>
              </div>
              
              <FileUploader onFileUpload={handleFileUpload} />
            </CardContent>
          </Card>

          {/* Before/after examples showing concrete value */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                See the Transformation
              </h3>
              
              <div className="space-y-6">
                {beforeAfterExamples.map((example, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x">
                      <div className="p-4 md:col-span-4 bg-gray-50">
                        <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Basic Data</div>
                        <div className="text-gray-700">{example.before}</div>
                      </div>
                      <div className="p-1 md:col-span-1 flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="p-4 md:col-span-7 bg-blue-50">
                        <div className="text-xs uppercase tracking-wider text-blue-500 mb-1">AI Enhanced</div>
                        <div className="text-gray-800 font-medium">{example.after}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          {/* Benefits section highlighting psychological value */}
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-t-4 border-t-blue-500">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-blue-600" />
                Why Enhance Your Listings?
              </h3>
              
              <ul className="space-y-4">
                <li className="flex">
                  <div className="mr-3 flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Increase Click-Through Rate</h4>
                    <p className="text-sm text-gray-600">Optimized titles attract 2-3x more clicks than basic listings</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="mr-3 flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Boost Conversion Rate</h4>
                    <p className="text-sm text-gray-600">Compelling descriptions can increase sales by up to 30%</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="mr-3 flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Improve Search Ranking</h4>
                    <p className="text-sm text-gray-600">SEO-optimized content ranks higher in marketplace searches</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          {/* Process overview with visual steps */}
          <Card className="border-t-4 border-t-green-500">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                How It Works
              </h3>
              
              <ol className="relative border-l border-gray-200 pl-6 pb-2 space-y-6">
                <li className="mb-6">
                  <div className="absolute -left-3">
                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">1</div>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">Upload Your CSV</h4>
                  <p className="text-sm text-gray-600">We'll analyze your products automatically</p>
                </li>
                <li className="mb-6">
                  <div className="absolute -left-3">
                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">2</div>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">AI Enhancement</h4>
                  <p className="text-sm text-gray-600">Our AI creates optimized titles, descriptions & bullet points</p>
                </li>
                <li className="mb-6">
                  <div className="absolute -left-3">
                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">3</div>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">Review & Edit</h4>
                  <p className="text-sm text-gray-600">Make any adjustments to the generated content</p>
                </li>
                <li>
                  <div className="absolute -left-3">
                    <div className="h-6 w-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-medium">4</div>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">Export & Publish</h4>
                  <p className="text-sm text-gray-600">Download your enhanced listings ready for marketplaces</p>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Upload;
