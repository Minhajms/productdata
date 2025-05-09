import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Save,
  Undo2,
  ArrowRight,
  ArrowLeft,
  FileText,
  Settings,
  Loader2,
  Play,
  Pause,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TransformationAnimation } from "@/components/ui/transformation-animation";

interface EnhancementProps {
  products: any[];
  onEnhancementComplete: (enhancedProducts: any[]) => void;
  onBack: () => void;
}

export function Enhancement({ products, onEnhancementComplete, onBack }: EnhancementProps) {
  const [, setLocation] = useLocation();
  const [enhancingAll, setEnhancingAll] = useState(false);
  const [enhancementProgress, setEnhancementProgress] = useState(0);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [enhancedProducts, setEnhancedProducts] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState("original");
  const [enhancementOptions, setEnhancementOptions] = useState({
    marketplace: "amazon",
    quality: "balanced", // balanced, creative, professional
    optimizeFor: "conversion", // conversion, seo, information
  });
  const [originalValues, setOriginalValues] = useState<Record<string, any>>({});
  const [editMode, setEditMode] = useState(false);
  const [showTransformationAnimation, setShowTransformationAnimation] = useState(false);
  const [animationPlaying, setAnimationPlaying] = useState(false);
  const [animationFieldToShow, setAnimationFieldToShow] = useState<'all' | 'title' | 'description' | 'bulletPoints'>('all');
  
  // Initialize enhanced products with original data
  useEffect(() => {
    if (products && products.length > 0) {
      setEnhancedProducts([...products]);
      
      // Store original values of the first product
      const firstProduct = products[0];
      setOriginalValues({
        title: firstProduct.title || "",
        description: firstProduct.description || "",
        bullet_points: firstProduct.bullet_points || [],
        price: firstProduct.price || "",
        brand: firstProduct.brand || "",
        category: firstProduct.category || "",
      });
    }
  }, [products]);
  
  const currentProduct = enhancedProducts[currentProductIndex] || {};
  
  // Simulate enhancing a single product
  const enhanceCurrentProduct = () => {
    setEnhancingAll(false);
    setEnhancementProgress(0);
    
    // Store original values before enhancement
    setOriginalValues({
      title: currentProduct.title || "",
      description: currentProduct.description || "",
      bullet_points: currentProduct.bullet_points || [],
      price: currentProduct.price || "",
      brand: currentProduct.brand || "",
      category: currentProduct.category || "",
    });
    
    // Check if user wants to see the animation
    if (showTransformationAnimation) {
      setAnimationPlaying(true);
      
      // Apply enhancement after animation would complete
      setTimeout(() => {
        applyEnhancement(currentProductIndex);
        setSelectedTab("enhanced");
        setEditMode(false);
        setAnimationPlaying(false);
      }, 6000); // Wait for animation to complete
      
      return () => {};
    } else {
      // Traditional progress bar approach
      const interval = setInterval(() => {
        setEnhancementProgress(prev => {
          const newProgress = prev + Math.floor(Math.random() * 10) + 5;
          
          if (newProgress >= 100) {
            clearInterval(interval);
            
            // Apply enhancement after progress complete
            setTimeout(() => {
              applyEnhancement(currentProductIndex);
              setSelectedTab("enhanced");
              setEditMode(false);
            }, 500);
            
            return 100;
          }
          
          return newProgress;
        });
      }, 300);
      
      return () => clearInterval(interval);
    }
  };
  
  // Simulate enhancing all products
  const enhanceAllProducts = () => {
    setEnhancingAll(true);
    setEnhancementProgress(0);
    setCurrentProductIndex(0);
    
    // Store original values of first product
    setOriginalValues({
      title: enhancedProducts[0].title || "",
      description: enhancedProducts[0].description || "",
      bullet_points: enhancedProducts[0].bullet_points || [],
      price: enhancedProducts[0].price || "",
      brand: enhancedProducts[0].brand || "",
      category: enhancedProducts[0].category || "",
    });
    
    // Simulate enhancement progress for all products
    const interval = setInterval(() => {
      setEnhancementProgress(prev => {
        const increment = Math.floor(Math.random() * 5) + 2;
        const newProgress = prev + increment;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Apply enhancements to all products
          setTimeout(() => {
            const newProducts = [...enhancedProducts];
            enhancedProducts.forEach((_, index) => {
              applyEnhancementToProduct(newProducts, index);
            });
            
            setEnhancedProducts(newProducts);
            setEnhancingAll(false);
            setSelectedTab("enhanced");
            setEditMode(false);
          }, 500);
          
          return 100;
        }
        
        return newProgress;
      });
    }, 200);
    
    return () => clearInterval(interval);
  };
  
  // Generate enhanced data for a product
  const generateEnhancedData = (product: any) => {
    const marketplace = enhancementOptions.marketplace;
    
    // Enhanced title based on marketplace and product type
    let enhancedTitle = "";
    let enhancedDescription = "";
    let enhancedBulletPoints: string[] = [];
    let enhancedCategory = "";
    let enhancedBrand = "";
    
    if (product.category?.toLowerCase().includes("electronics") || (!product.category && product.title?.toLowerCase().includes("headphone"))) {
      // Electronics product enhancements
      enhancedTitle = `Premium ${product.brand || "Wireless"} Bluetooth 5.2 Headphones with Active Noise Cancellation, 40H Playtime & Hi-Fi Sound - Comfortable Over-Ear Design`;
      enhancedDescription = `Experience immersive audio like never before with our Premium Bluetooth Headphones. Featuring advanced 5.2 Bluetooth technology for stable connections up to 33ft and Active Noise Cancellation that reduces ambient noise by up to 95%, these headphones create your own peaceful sanctuary anywhere.\n\nWith an industry-leading 40-hour battery life on a single charge and quick-charge technology providing 5 hours of playback from just 10 minutes of charging, these headphones are perfect for long commutes and travel. The ergonomic over-ear design with memory foam ear cushions ensures comfort during extended listening sessions.\n\nOur proprietary 40mm dynamic drivers deliver crisp highs, rich mids, and deep bass for studio-quality sound. Compatible with all Bluetooth-enabled devices and featuring intuitive touch controls for easy operation. Includes carrying case, USB-C charging cable, and 3.5mm audio cable for optional wired listening.`;
      enhancedBulletPoints = [
        "Advanced Active Noise Cancellation reduces ambient noise by up to 95%, creating immersive listening experiences in any environment",
        "Exceptional 40-hour battery life with quick-charge technology providing 5 hours of playback from just 10 minutes of charging",
        "Premium sound quality with 40mm dynamic drivers delivering crisp highs, rich mids, and deep, powerful bass",
        "Ultra-comfortable over-ear design with memory foam ear cushions and adjustable headband for extended listening comfort",
        "Seamless Bluetooth 5.2 connectivity with universal device compatibility and convenient touch controls"
      ];
      enhancedCategory = "Electronics > Audio > Headphones > Over-Ear Headphones";
      enhancedBrand = product.brand || "SoundMaster";
    } else if (product.category?.toLowerCase().includes("kitchen") || (!product.category && product.title?.toLowerCase().includes("coffee"))) {
      // Kitchen product enhancements
      enhancedTitle = `${product.brand || "BrewMaster"} Programmable 12-Cup Coffee Maker with Auto-Shut Off, Brew Strength Control & Thermal Carafe - Perfect for Home & Office`;
      enhancedDescription = `Transform your morning routine with the ${product.brand || "BrewMaster"} Programmable Coffee Maker. This premium coffee maker combines convenience and exceptional brewing technology to deliver barista-quality coffee right in your kitchen or office.\n\nThe intuitive programming system allows you to set brewing times up to 24 hours in advance, so you can wake up to the enticing aroma of freshly brewed coffee. The innovative Brew Strength Control lets you customize your coffee exactly to your taste preference - from a mild, smooth cup to a bold, robust brew.\n\nOur exclusive thermal carafe keeps coffee hot for up to 4 hours without burning or compromising flavor, while the special water filtration system removes impurities for the cleanest tasting coffee. The easy-to-read LCD display provides at-a-glance information on water levels, brew strength, and timer settings.\n\nDesigned with safety and efficiency in mind, the auto-shut off feature activates after 2 hours of inactivity, providing peace of mind and energy savings. The sleek, modern design with stainless steel accents complements any kitchen décor while taking up minimal counter space.`;
      enhancedBulletPoints = [
        "Easy-to-use 24-hour programmable timer allows you to wake up to freshly brewed coffee every morning",
        "Exclusive Brew Strength Control system lets you customize coffee from mild to bold based on your preference",
        "Premium thermal carafe keeps coffee hot and fresh for up to 4 hours without burning",
        "Advanced water filtration removes up to 97% of chlorine and impurities for superior tasting coffee",
        "Automatic 2-hour shut-off feature provides safety and energy efficiency for busy households"
      ];
      enhancedCategory = "Home & Kitchen > Kitchen & Dining > Small Appliances > Coffee Makers";
      enhancedBrand = product.brand || "BrewMaster";
    } else {
      // Generic product enhancements
      enhancedTitle = `${product.brand || "Premium"} ${product.title || "Multi-Purpose Product"} with Advanced Features - Professional Grade Quality for Everyday Use`;
      enhancedDescription = `Introducing our versatile ${product.title || "Multi-Purpose Product"}, designed to elevate your experience with superior performance and reliability. Crafted with premium materials and attention to detail, this product offers exceptional durability and functionality for years of dependable use.\n\nFeaturing an intuitive design that makes operation simple and straightforward, our product integrates seamlessly into your lifestyle. The ergonomic construction ensures comfortable handling while the compact footprint saves valuable space.\n\nEngineered with the latest technology, this product delivers consistent results every time. The versatile functionality makes it perfect for multiple applications, adapting to your changing needs with ease.\n\nBacked by our comprehensive warranty and dedicated customer support, you can purchase with confidence knowing that quality and satisfaction are guaranteed.`;
      enhancedBulletPoints = [
        "Crafted with premium materials for exceptional durability and years of reliable performance",
        "Intuitive design with user-friendly controls makes operation simple and accessible for everyone",
        "Versatile functionality adapts to multiple applications, making this a truly multi-purpose solution",
        "Compact, space-saving footprint fits perfectly in any environment without sacrificing performance",
        "Backed by our comprehensive warranty and responsive customer support for worry-free ownership"
      ];
      enhancedCategory = product.category || "Home & Garden > General Merchandise";
      enhancedBrand = product.brand || "Quality Essentials";
    }
    
    return {
      title: enhancedTitle,
      description: enhancedDescription,
      bullet_points: enhancedBulletPoints,
      category: enhancedCategory,
      brand: enhancedBrand,
      price: product.price || "29.99",
      status: "enhanced"
    };
  };
  
  // Apply enhancement to a specific product
  const applyEnhancement = (index: number) => {
    const newProducts = [...enhancedProducts];
    applyEnhancementToProduct(newProducts, index);
    setEnhancedProducts(newProducts);
  };
  
  // Helper function to apply enhancement to a product in an array
  const applyEnhancementToProduct = (productsArray: any[], index: number) => {
    const product = productsArray[index];
    const enhancedData = generateEnhancedData(product);
    
    productsArray[index] = {
      ...product,
      title: enhancedData.title,
      description: enhancedData.description,
      bullet_points: enhancedData.bullet_points,
      category: enhancedData.category,
      brand: enhancedData.brand,
      price: product.price || enhancedData.price,
      status: "enhanced"
    };
  };
  
  // Updates current product data
  const updateProductData = (field: string, value: any) => {
    const newProducts = [...enhancedProducts];
    newProducts[currentProductIndex] = {
      ...newProducts[currentProductIndex],
      [field]: value
    };
    setEnhancedProducts(newProducts);
  };
  
  // Reset current product to original values
  const resetToOriginal = () => {
    const newProducts = [...enhancedProducts];
    newProducts[currentProductIndex] = {
      ...newProducts[currentProductIndex],
      title: originalValues.title,
      description: originalValues.description,
      bullet_points: originalValues.bullet_points,
      brand: originalValues.brand,
      category: originalValues.category,
    };
    setEnhancedProducts(newProducts);
    setSelectedTab("original");
  };
  
  // Navigate to export view
  const handleComplete = () => {
    onEnhancementComplete(enhancedProducts);
  };
  
  // Navigate to previous or next product
  const goToPreviousProduct = () => {
    if (currentProductIndex > 0) {
      setCurrentProductIndex(currentProductIndex - 1);
      setSelectedTab("original");
      
      // Store original values of the previous product
      const prevProduct = enhancedProducts[currentProductIndex - 1];
      setOriginalValues({
        title: prevProduct.title || "",
        description: prevProduct.description || "",
        bullet_points: prevProduct.bullet_points || [],
        price: prevProduct.price || "",
        brand: prevProduct.brand || "",
        category: prevProduct.category || "",
      });
    }
  };
  
  const goToNextProduct = () => {
    if (currentProductIndex < enhancedProducts.length - 1) {
      setCurrentProductIndex(currentProductIndex + 1);
      setSelectedTab("original");
      
      // Store original values of the next product
      const nextProduct = enhancedProducts[currentProductIndex + 1];
      setOriginalValues({
        title: nextProduct.title || "",
        description: nextProduct.description || "",
        bullet_points: nextProduct.bullet_points || [],
        price: nextProduct.price || "",
        brand: nextProduct.brand || "",
        category: nextProduct.category || "",
      });
    }
  };
  
  const renderBulletPointInputs = () => {
    const bulletPoints = currentProduct.bullet_points || [];
    
    return (
      <div className="space-y-3">
        {bulletPoints.map((point: string, index: number) => (
          <div key={index} className="flex items-start gap-2">
            <span className="font-medium text-gray-700 mt-2">•</span>
            {editMode ? (
              <Textarea 
                value={point}
                onChange={(e) => {
                  const newBulletPoints = [...bulletPoints];
                  newBulletPoints[index] = e.target.value;
                  updateProductData("bullet_points", newBulletPoints);
                }}
                className="flex-1 min-h-[60px]"
              />
            ) : (
              <p className="mt-1">{point}</p>
            )}
          </div>
        ))}
        
        {editMode && bulletPoints.length < 5 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newBulletPoints = [...bulletPoints, ""];
              updateProductData("bullet_points", newBulletPoints);
            }}
            className="mt-2"
          >
            Add Bullet Point
          </Button>
        )}
      </div>
    );
  };

  // Loading state when enhancing
  if ((enhancementProgress > 0 && enhancementProgress < 100) || animationPlaying) {
    // If user chose to show the transformation animation and the animation is playing
    if (showTransformationAnimation && animationPlaying) {
      const originalProductData = {
        title: originalValues.title || "No title provided",
        description: originalValues.description || "No description provided",
        bulletPoints: Array.isArray(originalValues.bullet_points) ? originalValues.bullet_points : [],
      };
      
      const enhancedProductData = generateEnhancedData(currentProduct);
      
      return (
        <div className="max-w-6xl mx-auto py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              {enhancingAll ? 'Enhancing All Products' : 'AI Transformation Process'}
            </h2>
            
            <p className="text-gray-600 mb-2 max-w-xl mx-auto">
              Watch in real-time as our AI transforms your basic product data into compelling, conversion-optimized content.
            </p>
          </div>
          
          <TransformationAnimation
            originalData={originalProductData}
            enhancedData={enhancedProductData}
            isPlaying={true}
            speed="medium"
            fieldToAnimate={animationFieldToShow}
            highlightChanges={true}
          />
          
          <div className="mt-8 flex justify-center">
            <div className="max-w-md w-full">
              <div className="flex flex-col gap-3 text-left text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full mr-3 flex items-center justify-center bg-green-100">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  </div>
                  <span>Optimizing for {enhancementOptions.marketplace} marketplace</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full mr-3 flex items-center justify-center bg-green-100">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  </div>
                  <span>Using {enhancementOptions.quality} content style</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full mr-3 flex items-center justify-center bg-green-100">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  </div>
                  <span>Focusing on {enhancementOptions.optimizeFor} optimization</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Traditional progress bar UI
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
            <Sparkles className="h-8 w-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            {enhancingAll ? 'Enhancing All Products' : 'Enhancing Your Product'}
          </h2>
          
          <p className="text-gray-600 mb-8">
            Our AI is working to create engaging, conversion-optimized content for 
            {enhancingAll ? ' all your products' : ' your product'}.
          </p>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {enhancementProgress < 25 ? 'Analyzing product data...' : 
                   enhancementProgress < 50 ? 'Researching market trends...' :
                   enhancementProgress < 75 ? 'Generating optimized content...' :
                   'Finalizing enhancements...'}
                </span>
                <span>{enhancementProgress}%</span>
              </div>
              <Progress value={enhancementProgress} className="h-2" />
            </div>
            
            <div className="flex flex-col gap-3 text-left text-sm text-gray-600">
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${enhancementProgress >= 20 ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {enhancementProgress >= 20 ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <Loader2 className="h-3 w-3 text-gray-400 animate-spin" />
                  )}
                </div>
                <span>Analyzing product characteristics</span>
              </div>
              
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${enhancementProgress >= 40 ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {enhancementProgress >= 40 ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <Loader2 className="h-3 w-3 text-gray-400 animate-spin" />
                  )}
                </div>
                <span>Optimizing for {enhancementOptions.marketplace} marketplace</span>
              </div>
              
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${enhancementProgress >= 60 ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {enhancementProgress >= 60 ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <Loader2 className="h-3 w-3 text-gray-400 animate-spin" />
                  )}
                </div>
                <span>Generating SEO-optimized content</span>
              </div>
              
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${enhancementProgress >= 80 ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {enhancementProgress >= 80 ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <Loader2 className="h-3 w-3 text-gray-400 animate-spin" />
                  )}
                </div>
                <span>Applying {enhancementOptions.quality} style preferences</span>
              </div>
              
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${enhancementProgress >= 95 ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {enhancementProgress >= 95 ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <Loader2 className="h-3 w-3 text-gray-400 animate-spin" />
                  )}
                </div>
                <span>Finalizing enhanced listing</span>
              </div>
            </div>
            
            {/* Show option to view with animation next time */}
            {!showTransformationAnimation && enhancementProgress > 40 && enhancementProgress < 80 && (
              <div className="mt-6 pt-4 border-t border-gray-200 text-left">
                <div className="flex items-center">
                  <Switch 
                    id="show-animation-next"
                    checked={showTransformationAnimation}
                    onCheckedChange={setShowTransformationAnimation}
                    className="mr-3"
                  />
                  <Label htmlFor="show-animation-next" className="text-sm cursor-pointer">
                    Show transformation animation next time
                  </Label>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-10">
                  Visualize how AI enhances your product data
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {enhancedProducts.length > 1 
              ? `Enhancing Products (${currentProductIndex + 1}/${enhancedProducts.length})` 
              : "Product Enhancement"}
          </h2>
          <p className="text-gray-600">
            Optimize your product data for marketplace success
          </p>
        </div>
        <div className="flex gap-4">
          {!editMode && (
            <Button 
              variant="outline" 
              className="border-blue-200 text-blue-700"
              onClick={() => setEditMode(true)}
            >
              Edit Content <Settings className="ml-2 h-4 w-4" />
            </Button>
          )}
          {editMode && (
            <Button 
              variant="outline" 
              className="border-green-200 text-green-700"
              onClick={() => setEditMode(false)}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Edits
            </Button>
          )}
          <Button 
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleComplete}
          >
            Continue to Export <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar - Enhancement controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-blue-100">
            <CardContent className="p-5">
              <h3 className="text-base font-medium text-gray-900 mb-4">Enhancement Options</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="marketplace">Target Marketplace</Label>
                  <Select 
                    value={enhancementOptions.marketplace}
                    onValueChange={(value) => setEnhancementOptions({...enhancementOptions, marketplace: value})}
                  >
                    <SelectTrigger id="marketplace">
                      <SelectValue placeholder="Select marketplace" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amazon">Amazon</SelectItem>
                      <SelectItem value="ebay">eBay</SelectItem>
                      <SelectItem value="walmart">Walmart</SelectItem>
                      <SelectItem value="shopify">Shopify</SelectItem>
                      <SelectItem value="etsy">Etsy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quality">Content Quality</Label>
                  <Select 
                    value={enhancementOptions.quality}
                    onValueChange={(value) => setEnhancementOptions({...enhancementOptions, quality: value})}
                  >
                    <SelectTrigger id="quality">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced (Standard)</SelectItem>
                      <SelectItem value="professional">Professional (Premium)</SelectItem>
                      <SelectItem value="creative">Creative & Engaging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="optimizeFor">Optimize For</Label>
                  <Select 
                    value={enhancementOptions.optimizeFor}
                    onValueChange={(value) => setEnhancementOptions({...enhancementOptions, optimizeFor: value})}
                  >
                    <SelectTrigger id="optimizeFor">
                      <SelectValue placeholder="Select optimization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversion">Conversion Rate</SelectItem>
                      <SelectItem value="seo">Search Visibility (SEO)</SelectItem>
                      <SelectItem value="information">Detailed Information</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-animation">Show Transformation Animation</Label>
                      <p className="text-xs text-gray-500">
                        Visualize how AI enhances your product
                      </p>
                    </div>
                    <Switch 
                      id="show-animation"
                      checked={showTransformationAnimation}
                      onCheckedChange={setShowTransformationAnimation}
                    />
                  </div>
                  
                  {showTransformationAnimation && (
                    <div className="mt-2 space-y-2">
                      <Label htmlFor="animationField" className="text-sm">Field to Animate</Label>
                      <Select 
                        value={animationFieldToShow}
                        onValueChange={(value: string) => {
                          if (value === 'all' || value === 'title' || value === 'description' || value === 'bulletPoints') {
                            setAnimationFieldToShow(value);
                          }
                        }}
                      >
                        <SelectTrigger id="animationField">
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Show All Fields</SelectItem>
                          <SelectItem value="title">Title Only</SelectItem>
                          <SelectItem value="description">Description Only</SelectItem>
                          <SelectItem value="bulletPoints">Bullet Points Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={enhancementProgress > 0 && enhancementProgress < 100}
                  onClick={enhanceCurrentProduct}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Enhance This Product
                </Button>
                
                {enhancedProducts.length > 1 && (
                  <Button 
                    variant="outline"
                    className="w-full mt-2"
                    disabled={enhancementProgress > 0 && enhancementProgress < 100}
                    onClick={enhanceAllProducts}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Enhance All Products
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200">
            <CardContent className="p-5">
              <h3 className="text-base font-medium text-gray-900 mb-4">Navigation</h3>
              
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  className="justify-start"
                  disabled={currentProductIndex === 0}
                  onClick={goToPreviousProduct}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous Product
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start"
                  disabled={currentProductIndex === enhancedProducts.length - 1}
                  onClick={goToNextProduct}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Next Product
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="justify-start text-gray-600"
                  onClick={onBack}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content - Product view */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              <Tabs 
                defaultValue="original" 
                value={selectedTab} 
                onValueChange={setSelectedTab}
                className="w-full"
              >
                <div className="border-b border-gray-200">
                  <TabsList className="h-auto p-0 bg-transparent">
                    <TabsTrigger 
                      value="original" 
                      className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none py-3"
                    >
                      Original Data
                    </TabsTrigger>
                    <TabsTrigger 
                      value="enhanced" 
                      className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none py-3"
                    >
                      Enhanced Content
                      <Badge 
                        variant="outline" 
                        className="ml-2 bg-blue-100 text-blue-800 border-0"
                      >
                        AI
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="original" className="p-6 m-0">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Original Product Data</h3>
                      <p className="text-gray-600 text-sm">
                        This is the data you provided in your CSV file
                      </p>
                    </div>
                    {currentProduct?.status === "enhanced" && (
                      <Button 
                        variant="outline" 
                        className="text-blue-700"
                        onClick={() => setSelectedTab("enhanced")}
                      >
                        View Enhanced <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Product ID</Label>
                      <div className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-700">
                        {currentProduct.product_id || "N/A"}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-700">Title</Label>
                      <div className={`p-2 rounded border ${!originalValues.title ? "bg-red-50 border-red-200 text-red-700" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
                        {originalValues.title || "No title provided"}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700">Brand</Label>
                        <div className={`p-2 rounded border ${!originalValues.brand ? "bg-red-50 border-red-200 text-red-700" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
                          {originalValues.brand || "No brand provided"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700">Category</Label>
                        <div className={`p-2 rounded border ${!originalValues.category ? "bg-red-50 border-red-200 text-red-700" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
                          {originalValues.category || "No category provided"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-700">Description</Label>
                      <div className={`p-2 rounded border min-h-[100px] ${!originalValues.description ? "bg-red-50 border-red-200 text-red-700" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
                        {originalValues.description || "No description provided"}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-700">Bullet Points</Label>
                      {originalValues.bullet_points && originalValues.bullet_points.length > 0 ? (
                        <div className="p-2 rounded border bg-gray-50 border-gray-200 text-gray-700">
                          <ul className="list-disc pl-5 space-y-1">
                            {originalValues.bullet_points.map((point: string, index: number) => (
                              <li key={index}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="p-2 rounded border bg-red-50 border-red-200 text-red-700">
                          No bullet points provided
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="enhanced" className="p-6 m-0">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Enhanced Product Content</h3>
                      <p className="text-gray-600 text-sm">
                        AI-optimized for {enhancementOptions.marketplace} marketplace
                      </p>
                    </div>
                    <div className="flex gap-3">
                      {currentProduct?.status === "enhanced" && (
                        <Button 
                          variant="outline" 
                          className="text-amber-700 border-amber-200 hover:bg-amber-50"
                          onClick={resetToOriginal}
                        >
                          <Undo2 className="mr-2 h-4 w-4" />
                          Reset to Original
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {currentProduct?.status !== "enhanced" ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="h-12 w-12 text-gray-300 mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No Enhanced Content Yet
                      </h4>
                      <p className="text-gray-600 mb-6 max-w-md">
                        Click the "Enhance This Product" button to generate optimized content 
                        for {enhancementOptions.marketplace}.
                      </p>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={enhanceCurrentProduct}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Enhance This Product
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-gray-700">Title</Label>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">AI Enhanced</Badge>
                        </div>
                        {editMode ? (
                          <Input 
                            value={currentProduct.title || ""}
                            onChange={(e) => updateProductData("title", e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          <div className="p-3 bg-white rounded border border-gray-200 text-gray-800 shadow-sm">
                            {currentProduct.title}
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label className="text-gray-700">Brand</Label>
                            {!originalValues.brand && (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">AI Enhanced</Badge>
                            )}
                          </div>
                          {editMode ? (
                            <Input 
                              value={currentProduct.brand || ""}
                              onChange={(e) => updateProductData("brand", e.target.value)}
                              className="w-full"
                            />
                          ) : (
                            <div className="p-3 bg-white rounded border border-gray-200 text-gray-800 shadow-sm">
                              {currentProduct.brand}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label className="text-gray-700">Category</Label>
                            {!originalValues.category && (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">AI Enhanced</Badge>
                            )}
                          </div>
                          {editMode ? (
                            <Input 
                              value={currentProduct.category || ""}
                              onChange={(e) => updateProductData("category", e.target.value)}
                              className="w-full"
                            />
                          ) : (
                            <div className="p-3 bg-white rounded border border-gray-200 text-gray-800 shadow-sm">
                              {currentProduct.category}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-gray-700">Description</Label>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">AI Enhanced</Badge>
                        </div>
                        {editMode ? (
                          <Textarea 
                            value={currentProduct.description || ""}
                            onChange={(e) => updateProductData("description", e.target.value)}
                            className="min-h-[200px]"
                          />
                        ) : (
                          <div className="p-3 bg-white rounded border border-gray-200 text-gray-800 shadow-sm whitespace-pre-line min-h-[200px]">
                            {currentProduct.description}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-gray-700">Bullet Points</Label>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">AI Enhanced</Badge>
                        </div>
                        <div className="p-3 bg-white rounded border border-gray-200 text-gray-800 shadow-sm">
                          {renderBulletPointInputs()}
                        </div>
                      </div>
                      
                      {editMode && (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => setEditMode(false)}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Analysis
            </Button>
            
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleComplete}
            >
              Continue to Export <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Enhancement;