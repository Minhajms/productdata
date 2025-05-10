import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  SparkleIcon,
  BarChart3,
  Info,
  ArrowRight,
  RotateCcw,
  Search
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AnalysisProps {
  products: any[];
  onAnalysisComplete: () => void;
}

export function Analysis({ products, onAnalysisComplete }: AnalysisProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [analysisSummary, setAnalysisSummary] = useState<any>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Simulate analysis process
  useEffect(() => {
    if (!products || products.length === 0) {
      toast({
        title: "No products found",
        description: "Please upload a CSV file with product data.",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }

    // Simulate progress
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min(Math.floor((elapsed / 3000) * 100), 99);
      
      setProgress(calculatedProgress);
      
      if (calculatedProgress >= 99) {
        clearInterval(interval);
        
        // Generate analysis summary
        setTimeout(() => {
          const summary = generateAnalysisSummary(products);
          setAnalysisSummary(summary);
          setProgress(100);
          setAnalyzing(false);
        }, 500);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [products, toast, setLocation]);

  // Function to generate analysis summary
  const generateAnalysisSummary = (products: any[]) => {
    const totalProducts = products.length;
    const productsWithMissingFields = products.map(product => {
      const missingFields = [];
      
      if (!product.title || product.title.length < 10) missingFields.push('title');
      if (!product.description || product.description.length < 20) missingFields.push('description');
      if (!product.brand) missingFields.push('brand');
      if (!product.category) missingFields.push('category');
      if (!product.price) missingFields.push('price');
      if (!product.bullet_points || product.bullet_points.length === 0) missingFields.push('bullet_points');
      if (!product.images || product.images.length === 0) missingFields.push('images');
      
      return {
        ...product,
        missingFields,
        completeness: 100 - ((missingFields.length / 7) * 100),
        enhancementPotential: missingFields.length > 0 ? 'high' : 'low'
      };
    });
    
    const categoryCounts: Record<string, number> = {};
    const completeProducts = productsWithMissingFields.filter(p => p.missingFields.length === 0).length;
    const productsNeedingEnhancement = totalProducts - completeProducts;
    
    productsWithMissingFields.forEach(product => {
      const category = product.category || 'Uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    const missingFieldCounts: Record<string, number> = {
      title: 0,
      description: 0,
      brand: 0,
      category: 0,
      price: 0,
      bullet_points: 0,
      images: 0
    };
    
    productsWithMissingFields.forEach(product => {
      product.missingFields.forEach((field: string) => {
        missingFieldCounts[field] = (missingFieldCounts[field] || 0) + 1;
      });
    });
    
    return {
      totalProducts,
      completeProducts,
      productsNeedingEnhancement,
      enhancementPercentage: (productsNeedingEnhancement / totalProducts) * 100,
      topCategories: Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
      commonMissingFields: Object.entries(missingFieldCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
      products: productsWithMissingFields
    };
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId === selectedProductId ? null : productId);
  };

  const handleContinue = () => {
    onAnalysisComplete();
  };

  // Show product details panel
  const renderProductDetails = () => {
    if (!selectedProductId || !analysisSummary) return null;
    
    const product = analysisSummary.products.find((p: any) => p.product_id === selectedProductId);
    if (!product) return null;
    
    return (
      <Card className="mt-6 border-blue-100">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2 text-blue-600" />
            Product Analysis Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Product Information</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex">
                  <dt className="w-24 font-medium text-gray-500">ID:</dt>
                  <dd>{product.product_id}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 font-medium text-gray-500">Title:</dt>
                  <dd className={!product.title ? "text-red-500 italic" : ""}>
                    {product.title || "Missing"}
                  </dd>
                </div>
                <div className="flex">
                  <dt className="w-24 font-medium text-gray-500">Brand:</dt>
                  <dd className={!product.brand ? "text-red-500 italic" : ""}>
                    {product.brand || "Missing"}
                  </dd>
                </div>
                <div className="flex">
                  <dt className="w-24 font-medium text-gray-500">Price:</dt>
                  <dd className={!product.price ? "text-red-500 italic" : ""}>
                    {product.price ? `$${product.price}` : "Missing"}
                  </dd>
                </div>
                <div className="flex">
                  <dt className="w-24 font-medium text-gray-500">Category:</dt>
                  <dd className={!product.category ? "text-red-500 italic" : ""}>
                    {product.category || "Missing"}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Enhancement Potential</h4>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="text-gray-600 font-medium">Listing Completeness</span>
                  <span className="text-gray-600">{Math.round(product.completeness)}%</span>
                </div>
                <Progress 
                  value={product.completeness} 
                  className="h-2" 
                  indicatorClassName={
                    product.completeness < 50 ? "bg-red-500" : 
                    product.completeness < 80 ? "bg-amber-500" : 
                    "bg-green-500"
                  }
                />
              </div>
              
              {product.missingFields.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-gray-600 mb-1">Missing Fields:</h5>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.missingFields.map((field: string) => (
                      <Badge key={field} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-100 text-sm text-blue-800">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                  <p>
                    {product.missingFields.length > 0 
                      ? `This product has ${product.missingFields.length} missing fields that can be enhanced with AI.` 
                      : "This product has all essential fields populated. Minor enhancements still available."}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
            <div className="p-3 bg-gray-50 rounded text-sm text-gray-700 border border-gray-200 mb-4 max-h-32 overflow-y-auto">
              {product.description || (
                <span className="text-red-500 italic">No description available. AI can generate a compelling description.</span>
              )}
            </div>
          </div>
          
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleContinue}
          >
            Enhance This Product <SparkleIcon className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Analysis progress state */}
      {analyzing && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Analyzing Your Products</h2>
            <Badge 
              variant="outline"
              className="bg-blue-100 text-blue-800 border-0 px-3 py-1"
            >
              {progress}% Complete
            </Badge>
          </div>
          
          <Progress 
            value={progress} 
            className="h-2 mb-8" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Product Analysis</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Search className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Identifying product types</span>
                        <span className="text-xs text-gray-500">{progress >= 30 ? 'Complete' : 'In progress'}</span>
                      </div>
                      <Progress 
                        value={progress >= 30 ? 100 : (progress / 30) * 100} 
                        className="h-1" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <AlertCircle className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Detecting missing fields</span>
                        <span className="text-xs text-gray-500">{progress >= 60 ? 'Complete' : 'In progress'}</span>
                      </div>
                      <Progress 
                        value={progress >= 60 ? 100 : progress <= 30 ? 0 : ((progress - 30) / 30) * 100} 
                        className="h-1" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <BarChart3 className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Evaluating enhancement potential</span>
                        <span className="text-xs text-gray-500">{progress >= 90 ? 'Complete' : 'In progress'}</span>
                      </div>
                      <Progress 
                        value={progress >= 90 ? 100 : progress <= 60 ? 0 : ((progress - 60) / 30) * 100} 
                        className="h-1" 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Preview</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-4 w-full bg-gray-200" />
                      <Skeleton className="h-4 w-3/4 bg-gray-200" />
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-4 w-full bg-gray-200" />
                      <Skeleton className="h-4 w-2/3 bg-gray-200" />
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-4 w-full bg-gray-200" />
                      <Skeleton className="h-4 w-4/5 bg-gray-200" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Alert className="bg-blue-50 border-blue-100 text-blue-800">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle>Analysis in Progress</AlertTitle>
            <AlertDescription>
              We're analyzing your product data to identify opportunities for enhancement. This process usually takes less than a minute.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Analysis results state */}
      {!analyzing && analysisSummary && (
        <div>
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Analysis Complete</h2>
                <p className="text-gray-600 max-w-2xl">
                  We've analyzed your product data and identified opportunities for enhancement. 
                  Select individual products to see detailed analysis.
                </p>
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleContinue}
              >
                Enhance All Products <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card className="bg-gradient-to-br from-blue-50 to-white border">
                <CardContent className="p-5">
                  <h3 className="text-base font-medium text-gray-800 mb-3">Analysis Summary</h3>
                  
                  <dl className="space-y-2">
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-gray-600">Total Products:</dt>
                      <dd className="text-sm font-medium">{analysisSummary.totalProducts}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-gray-600">Complete Products:</dt>
                      <dd className="text-sm font-medium flex items-center">
                        {analysisSummary.completeProducts}
                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100 border-0">
                          {Math.round((analysisSummary.completeProducts / analysisSummary.totalProducts) * 100)}%
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-gray-600">Needs Enhancement:</dt>
                      <dd className="text-sm font-medium flex items-center">
                        {analysisSummary.productsNeedingEnhancement}
                        <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100 border-0">
                          {Math.round(analysisSummary.enhancementPercentage)}%
                        </Badge>
                      </dd>
                    </div>
                  </dl>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-medium uppercase text-gray-500 mb-3">Top Product Categories</h4>
                    <div className="space-y-2">
                      {analysisSummary.topCategories.map((category: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{category.name}</span>
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100 font-normal">
                            {category.count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-50 to-white border col-span-2">
                <CardContent className="p-5">
                  <h3 className="text-base font-medium text-gray-800 mb-3">Missing Information Analysis</h3>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="text-gray-600 font-medium">Overall Data Completeness</span>
                      <span className="text-gray-600">
                        {Math.round(100 - analysisSummary.enhancementPercentage)}%
                      </span>
                    </div>
                    <Progress 
                      value={100 - analysisSummary.enhancementPercentage} 
                      className="h-2"
                      indicatorClassName={
                        analysisSummary.enhancementPercentage > 50 ? "bg-red-500" : 
                        analysisSummary.enhancementPercentage > 20 ? "bg-amber-500" : 
                        "bg-green-500"
                      }
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-medium uppercase text-gray-500 mb-3">Most Common Missing Fields</h4>
                      <div className="space-y-2">
                        {analysisSummary.commonMissingFields.slice(0, 4).map((field: any) => (
                          field.count > 0 ? (
                            <div key={field.name} className="flex items-center justify-between">
                              <span className="text-sm capitalize">{field.name.replace('_', ' ')}</span>
                              <div className="flex items-center">
                                <span className="text-sm mr-2">{field.count}</span>
                                <Progress 
                                  value={(field.count / analysisSummary.totalProducts) * 100} 
                                  className="h-2 w-20" 
                                  indicatorClassName="bg-red-500"
                                />
                              </div>
                            </div>
                          ) : null
                        ))}
                        
                        {analysisSummary.commonMissingFields.every((field: any) => field.count === 0) && (
                          <div className="text-sm text-gray-600 italic">
                            No missing fields detected
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium uppercase text-gray-500 mb-3">Enhancement Opportunities</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {analysisSummary.enhancementPercentage > 0 ? (
                          <>
                            {analysisSummary.commonMissingFields.some((f: any) => f.name === 'description' && f.count > 0) && (
                              <li className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                <span>Add compelling product descriptions</span>
                              </li>
                            )}
                            {analysisSummary.commonMissingFields.some((f: any) => f.name === 'bullet_points' && f.count > 0) && (
                              <li className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                <span>Create persuasive feature bullets</span>
                              </li>
                            )}
                            {analysisSummary.commonMissingFields.some((f: any) => f.name === 'title' && f.count > 0) && (
                              <li className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                <span>Generate SEO-optimized titles</span>
                              </li>
                            )}
                            {analysisSummary.commonMissingFields.some((f: any) => f.name === 'brand' && f.count > 0) && (
                              <li className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                <span>Suggest appropriate brand names</span>
                              </li>
                            )}
                          </>
                        ) : (
                          <li className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                            <span>All products have required fields</span>
                          </li>
                        )}
                        <li className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                          <span>Optimize all content for marketplaces</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Product Details</h3>
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                {analysisSummary.totalProducts} Product{analysisSummary.totalProducts !== 1 && 's'}
              </Badge>
            </div>
            
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Completeness</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysisSummary.products.map((product: any) => (
                    <TableRow 
                      key={product.product_id}
                      className={selectedProductId === product.product_id ? "bg-blue-50" : undefined}
                      onClick={() => handleProductSelect(product.product_id)}
                    >
                      <TableCell className="font-medium">{product.product_id}</TableCell>
                      <TableCell>
                        {product.title || (
                          <span className="text-red-500 italic">Missing</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.category || (
                          <span className="text-red-500 italic">Missing</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.price ? (
                          `$${product.price}`
                        ) : (
                          <span className="text-red-500 italic">Missing</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={product.completeness} 
                            className="h-2 w-24" 
                            indicatorClassName={
                              product.completeness < 50 ? "bg-red-500" : 
                              product.completeness < 80 ? "bg-amber-500" : 
                              "bg-green-500"
                            }
                          />
                          <span className="text-xs text-gray-600">{Math.round(product.completeness)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          className="h-8 px-2 text-blue-700"
                          onClick={() => handleProductSelect(product.product_id)}
                        >
                          Details <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
          
          {renderProductDetails()}
          
          <div className="flex justify-end space-x-4 mt-8">
            <Button 
              variant="outline" 
              className="border-gray-300"
              onClick={() => setLocation("/")}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Upload Different File
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleContinue}
            >
              Continue to Enhancement <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analysis;