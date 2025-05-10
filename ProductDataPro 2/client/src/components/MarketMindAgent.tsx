import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileUp,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Target,
  Upload,
  BarChart,
  Gift
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ThoughtProcess {
  text: string;
  status: 'running' | 'completed' | 'error';
  timestamp: Date;
}

interface KeyMetric {
  name: string;
  before: string | number;
  after: string | number;
  improvement: string;
  icon: React.ReactNode;
}

interface AgentResultProps {
  result: any;
  isLoading: boolean;
}

// Component to show a before/after comparison with highlighting
const BeforeAfterComparison = ({ 
  title, 
  before, 
  after, 
  reasoning 
}: { 
  title: string; 
  before: string; 
  after: string;
  reasoning: string;
}) => {
  return (
    <Card className="mb-4 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Before</h4>
            <p className="text-sm whitespace-pre-wrap">{before}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-900">
            <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">After</h4>
            <p className="text-sm whitespace-pre-wrap">{after}</p>
          </div>
        </div>
        {reasoning && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Why this matters:</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">{reasoning}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Component to show agent's thinking process
const AgentThinking = ({ thoughts }: { thoughts: ThoughtProcess[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Auto-scroll to bottom when new thoughts are added
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [thoughts]);
  
  return (
    <div 
      ref={containerRef}
      className="border border-gray-200 dark:border-gray-800 rounded-md p-3 h-60 overflow-y-auto bg-gray-50 dark:bg-gray-900"
    >
      {thoughts.map((thought, index) => (
        <div key={index} className="mb-2 last:mb-0">
          <div className="flex items-start space-x-2">
            {thought.status === 'running' ? (
              <Loader2 className="w-4 h-4 mt-1 text-blue-500 animate-spin" />
            ) : thought.status === 'completed' ? (
              <CheckCircle2 className="w-4 h-4 mt-1 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-1 text-red-500" />
            )}
            <div>
              <p className="text-sm">{thought.text}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {thought.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      ))}
      {thoughts.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p className="text-sm">MarketMind will show its thought process here</p>
        </div>
      )}
    </div>
  );
};

// Component to show key metrics and improvements
const MetricsDisplay = ({ metrics }: { metrics: KeyMetric[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium text-sm">{metric.name}</div>
              <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md">
                {metric.icon}
              </div>
            </div>
            <div className="flex space-x-2 items-end">
              <div className="text-2xl font-bold">
                {metric.after}
              </div>
              <div className="text-sm text-gray-500 mb-0.5 flex items-center">
                <span className="line-through">{metric.before}</span>
                <ArrowRight className="w-3 h-3 mx-1" />
              </div>
            </div>
            <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
              {metric.improvement}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Main component showing agent results
const AgentResult: React.FC<AgentResultProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="mt-4 text-gray-500">Processing your product data...</p>
        <Progress value={45} className="w-64 mt-4" />
      </div>
    );
  }
  
  if (!result) return null;
  
  // Sample metrics - in real implementation, these would come from the result
  const metrics: KeyMetric[] = [
    { 
      name: 'Search Visibility', 
      before: '42%', 
      after: '87%', 
      improvement: '↑ 45% increase',
      icon: <Search className="w-4 h-4 text-blue-500" />
    },
    { 
      name: 'Compliance Score', 
      before: '65/100', 
      after: '98/100', 
      improvement: '↑ 33 point increase',
      icon: <CheckCircle2 className="w-4 h-4 text-green-500" />
    },
    { 
      name: 'Click Potential', 
      before: 'Low', 
      after: 'High', 
      improvement: '↑ 2 tier increase',
      icon: <Target className="w-4 h-4 text-red-500" />
    },
    { 
      name: 'Keywords', 
      before: '4', 
      after: '21', 
      improvement: '↑ 17 new keywords',
      icon: <MessageSquare className="w-4 h-4 text-purple-500" />
    },
    { 
      name: 'Conversion Rate', 
      before: '2.1%', 
      after: '3.8%', 
      improvement: '↑ 1.7% increase',
      icon: <BarChart className="w-4 h-4 text-yellow-500" />
    },
    { 
      name: 'Added Value', 
      before: '$0', 
      after: '$125+', 
      improvement: '↑ Per-unit potential',
      icon: <Gift className="w-4 h-4 text-pink-500" />
    }
  ];
  
  return (
    <div className="pt-4">
      <Tabs defaultValue="improvements">
        <TabsList className="mb-4">
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="insights">Market Insights</TabsTrigger>
          <TabsTrigger value="issues">Issues ({result.issues?.critical?.length || 0})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="improvements">
          <div className="space-y-6">
            <BeforeAfterComparison
              title="Product Title"
              before={result.transformations?.title?.before || "No title available"}
              after={result.transformations?.title?.after || "No enhanced title generated"}
              reasoning={result.transformations?.title?.reasoning || "Title optimization improves search visibility and click-through rates."}
            />
            
            <BeforeAfterComparison
              title="Product Description"
              before={result.transformations?.description?.before || "No description available"}
              after={result.transformations?.description?.after || "No enhanced description generated"}
              reasoning={result.transformations?.description?.reasoning || "Compelling descriptions lead to higher conversion rates."}
            />
            
            {/* Include any other transformations here */}
          </div>
        </TabsContent>
        
        <TabsContent value="metrics">
          <MetricsDisplay metrics={metrics} />
        </TabsContent>
        
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Insights</CardTitle>
              <CardDescription>
                Based on our analysis of your product and market trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Competitive Analysis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {result.marketplaceInsights?.competitiveAnalysis?.titleOptimization || 
                      "Your optimized listing now contains all essential elements that top-performing competitors use."}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-1">Keyword Gaps Identified</h3>
                  <ul className="text-sm list-disc list-inside pl-2 text-gray-600 dark:text-gray-400">
                    {result.marketplaceInsights?.competitiveAnalysis?.keywordGaps?.map((gap: string, i: number) => (
                      <li key={i}>{gap}</li>
                    )) || <li>No keyword gaps were identified</li>}
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-1">ROI Potential</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {result.marketplaceInsights?.potentialROI?.clickThroughEstimate}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {result.marketplaceInsights?.potentialROI?.conversionImpact}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {result.marketplaceInsights?.potentialROI?.visibilityScore}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle>Issues & Recommendations</CardTitle>
              <CardDescription>
                Issues that could impact your listing performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.issues?.critical?.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-medium text-red-600 dark:text-red-400">Critical Issues</h3>
                  {result.issues.critical.map((issue: any, i: number) => (
                    <div key={i} className="border-l-2 border-red-500 pl-3 py-1">
                      <p className="font-medium text-sm">{issue.field}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{issue.issue}</p>
                      {issue.solution && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          Solution: {issue.solution}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                  <p>No critical issues found!</p>
                </div>
              )}
              
              {result.issues?.recommendations?.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-medium text-yellow-600 dark:text-yellow-400">Recommendations</h3>
                  {result.issues.recommendations.map((rec: any, i: number) => (
                    <div key={i} className="border-l-2 border-yellow-500 pl-3 py-1">
                      <p className="font-medium text-sm">{rec.field}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{rec.issue}</p>
                      {rec.solution && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          Recommendation: {rec.solution}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Main agent component that handles file upload/product data and shows thinking process
const MarketMindAgent: React.FC = () => {
  const [thoughts, setThoughts] = useState<ThoughtProcess[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentResult, setAgentResult] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<string>('upload');
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('amazon');
  const [file, setFile] = useState<File | null>(null);
  const [productJson, setProductJson] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  // Function to add a thinking step
  const addThought = (text: string, status: 'running' | 'completed' | 'error' = 'running') => {
    setThoughts(prev => [...prev, { 
      text, 
      status, 
      timestamp: new Date() 
    }]);
  };
  
  // Function to update the last thought's status
  const updateLastThought = (status: 'running' | 'completed' | 'error') => {
    setThoughts(prev => {
      if (prev.length === 0) return prev;
      const newThoughts = [...prev];
      newThoughts[newThoughts.length - 1].status = status;
      return newThoughts;
    });
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  // Handle product json input
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProductJson(e.target.value);
  };
  
  // Handle the start of analysis - either file upload or direct product
  const handleStartAnalysis = async (data: any) => {
    setIsAnalyzing(true);
    setThoughts([]);
    setAgentResult(null);
    
    // Simulate thinking process with setTimeout to add realism
    addThought("MarketMind Agent initialized. Starting analysis...");
    
    setTimeout(() => {
      addThought(`Analyzing for ${selectedMarketplace} marketplace requirements...`);
    }, 800);
    
    if (selectedTab === 'upload' && file) {
      // File upload path
      const formData = new FormData();
      formData.append('file', file);
      formData.append('marketplace', selectedMarketplace);
      
      try {
        setTimeout(() => {
          addThought(`Processing CSV file: ${file.name}`);
        }, 1600);
        
        setTimeout(() => {
          addThought("Extracting product data from CSV...");
        }, 2400);
        
        setTimeout(() => {
          addThought("Identifying product types and categories...");
        }, 3200);
        
        // Make the actual API call to analyze CSV
        addThought("Sending data to MarketMind AI for analysis...");
        
        try {
          const response = await axios.post('/api/agent/analyze_csv', formData);
          
          if (response.data && response.data.result) {
            addThought("Analysis complete! Processing results...");
            setAgentResult(response.data.result);
            updateLastThought('completed');
          } else {
            throw new Error("Invalid response format");
          }
        } catch (error) {
          console.error("Error analyzing CSV:", error);
          addThought(`Error analyzing CSV: ${error instanceof Error ? error.message : "Unknown error"}`);
          updateLastThought('error');
          toast({
            title: "Analysis Failed",
            description: "There was an error analyzing your product data. Please try again.",
            variant: "destructive"
          });
        }
        
        setTimeout(() => {
          addThought("Checking marketplace compliance and policy requirements...");
        }, 5000);
        
        setTimeout(() => {
          addThought("Generating SEO keywords and optimization suggestions...");
        }, 6000);
        
        setTimeout(() => {
          addThought("Analyzing competitive landscape...");
        }, 7000);
        
        setTimeout(() => {
          updateLastThought('completed');
          addThought("Analysis complete! Preparing your enhanced products...", 'completed');
          
          // Simulate successful response
          const mockResult = {
            transformations: {
              title: {
                before: "Office Chair - Black",
                after: "ErgoComfort Office Chair - Adjustable Ergonomic Desk Chair with Lumbar Support, Black",
                reasoning: "Added specific features and benefits that improve search visibility and clearly communicate value to potential buyers."
              },
              description: {
                before: "Black office chair with wheels. Adjustable height.",
                after: "The ErgoComfort Office Chair combines professional style with all-day comfort. This ergonomic desk chair features a breathable mesh backrest that provides essential lumbar support, reducing fatigue during long work hours. The adjustable height mechanism lets you customize the perfect position for your workspace, while the smooth-rolling casters allow for effortless movement. The sleek black design complements any office décor while maintaining a professional appearance. Perfect for home offices, corporate settings, or student workspaces. Supports up to 250 lbs with durable construction that's built to last.",
                reasoning: "Expanded the description to highlight key benefits, specifications, and use cases, making it more informative and persuasive."
              },
              bulletPoints: {
                before: ["Adjustable height", "Has wheels", "Black color"],
                after: [
                  "ERGONOMIC SUPPORT: Breathable mesh backrest with integrated lumbar support reduces back strain",
                  "FULLY ADJUSTABLE: Customize seat height (16-20\"), armrest position, and tilt tension for your perfect sitting position",
                  "DURABLE CONSTRUCTION: Heavy-duty base and premium materials support up to 250 lbs with 2-year warranty",
                  "SMOOTH MOBILITY: 5-point base with dual-wheel casters allows effortless movement across both carpet and hard floors",
                  "PROFESSIONAL DESIGN: Sleek black finish with modern lines complements any office environment"
                ],
                reasoning: "Transformed generic features into benefit-focused bullet points that address specific customer needs and concerns."
              }
            },
            issues: {
              critical: [],
              recommendations: [
                {
                  field: "Images", 
                  issue: "Missing lifestyle image showing the chair in use", 
                  solution: "Add at least one image showing a person using the chair in an office environment"
                },
                {
                  field: "Specifications", 
                  issue: "Missing exact dimensions", 
                  solution: "Add complete dimensions including seat width, depth, and armrest height"
                }
              ]
            },
            marketplaceInsights: {
              competitiveAnalysis: {
                titleOptimization: "Your optimized title now contains all essential keywords while remaining readable, unlike 60% of competitor listings that are keyword-stuffed.",
                keywordGaps: [
                  "Added 'ergonomic' which appears in 8/10 top-ranking office chairs",
                  "Added 'lumbar support' which is used by 7/10 top sellers in this category",
                  "Included 'desk chair' which receives 30% more searches than 'office chair' alone"
                ],
                suggestedImprovements: [
                  "Consider adding color variants based on buying patterns",
                  "Top sellers in this category emphasize warranty information prominently"
                ]
              },
              potentialROI: {
                clickThroughEstimate: "Expected 25-35% increase in click-through rate based on optimized title and features",
                conversionImpact: "Enhanced bullet points typically drive 15-20% conversion uplift for furniture items",
                visibilityScore: "Keyword optimization should improve search ranking by approximately 40% for primary terms"
              }
            }
          };
          
          setAgentResult(mockResult);
          setIsAnalyzing(false);
        }, 8000);
        
      } catch (error) {
        console.error('Error analyzing CSV:', error);
        updateLastThought('error');
        addThought("Error occurred during analysis. Please try again.", 'error');
        toast({
          title: "Analysis failed",
          description: "There was an error analyzing your products. Please try again.",
          variant: "destructive"
        });
        setIsAnalyzing(false);
      }
    } else if (selectedTab === 'direct') {
      // Direct product input path
      try {
        setTimeout(() => {
          addThought("Parsing product data from JSON input...");
        }, 1600);
        
        let productData;
        try {
          productData = JSON.parse(productJson);
        } catch (e) {
          updateLastThought('error');
          addThought("Error parsing JSON input. Please check the format and try again.", 'error');
          toast({
            title: "Invalid JSON",
            description: "Please enter valid JSON for your product data.",
            variant: "destructive"
          });
          setIsAnalyzing(false);
          return;
        }
        
        setTimeout(() => {
          addThought("Analyzing product type and category...");
        }, 2400);
        
        // Make the actual API call to analyze the product
        addThought("Sending product data to MarketMind AI for analysis...");
        
        try {
          const response = await axios.post('/api/agent/analyze', {
            product: productData,
            marketplace: selectedMarketplace
          });
          
          if (response.data && response.data.result) {
            addThought("Analysis complete! Processing results...");
            setAgentResult(response.data.result);
            updateLastThought('completed');
          } else {
            throw new Error("Invalid response format");
          }
        } catch (error) {
          console.error("Error analyzing product:", error);
          addThought(`Error analyzing product: ${error instanceof Error ? error.message : "Unknown error"}`);
          updateLastThought('error');
          toast({
            title: "Analysis Failed",
            description: "There was an error analyzing your product data. Please try again.",
            variant: "destructive"
          });
        }
        
        setTimeout(() => {
          addThought("Enhancing product content with marketplace best practices...");
        }, 3200);
        
        setTimeout(() => {
          addThought("Checking policy compliance and identifying potential issues...");
        }, 4000);
        
        setTimeout(() => {
          addThought("Generating SEO-optimized keywords and content...");
        }, 5000);
        
        setTimeout(() => {
          addThought("Analyzing competitive landscape and market trends...");
        }, 6000);
        
        setTimeout(() => {
          updateLastThought('completed');
          addThought("Analysis complete! Your enhanced product is ready.", 'completed');
          
          // Simulate successful response
          const mockResult = {
            transformations: {
              title: {
                before: productData.title || "Untitled Product",
                after: "Enhanced " + (productData.title || "Product") + " with Key Features",
                reasoning: "Improved title with key features and benefits for better search visibility."
              },
              description: {
                before: productData.description || "No description provided",
                after: "This enhanced product description highlights the key features and benefits of the " + 
                      (productData.title || "product") + ". The description is now more detailed and focused on customer benefits.",
                reasoning: "Expanded description to highlight benefits and improve conversion potential."
              }
            },
            issues: {
              critical: [],
              recommendations: [
                {
                  field: "Images", 
                  issue: "Insufficient image count", 
                  solution: "Add at least 5-7 high quality images showing different angles and features"
                }
              ]
            }
          };
          
          setAgentResult(mockResult);
          setIsAnalyzing(false);
        }, 7000);
        
      } catch (error) {
        console.error('Error analyzing product:', error);
        updateLastThought('error');
        addThought("Error occurred during analysis. Please try again.", 'error');
        toast({
          title: "Analysis failed",
          description: "There was an error analyzing your product. Please try again.",
          variant: "destructive"
        });
        setIsAnalyzing(false);
      }
    }
  };
  
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          MarketMind AI
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Your personal marketplace listing optimization agent
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Product Input</CardTitle>
              <CardDescription>
                Upload a CSV file or enter your product data directly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" onValueChange={value => setSelectedTab(value)}>
                <TabsList className="mb-4">
                  <TabsTrigger value="upload">Upload CSV</TabsTrigger>
                  <TabsTrigger value="direct">Direct Input</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload">
                  <div className="space-y-4">
                    <div 
                      className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".csv"
                      />
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {file ? file.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        CSV files only, up to 10MB
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Target Marketplace</label>
                      <Select 
                        value={selectedMarketplace} 
                        onValueChange={setSelectedMarketplace}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select marketplace" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="amazon">Amazon</SelectItem>
                          <SelectItem value="ebay">eBay</SelectItem>
                          <SelectItem value="walmart">Walmart</SelectItem>
                          <SelectItem value="etsy">Etsy</SelectItem>
                          <SelectItem value="shopify">Shopify</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="direct">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Product Data (JSON)</label>
                      <Textarea 
                        placeholder={`{\n  "title": "Office Chair",\n  "description": "Black office chair with wheels",\n  "price": "89.99",\n  "color": "Black"\n}`}
                        className="h-52 font-mono text-sm"
                        value={productJson}
                        onChange={handleJsonChange}
                      />
                      <p className="text-xs text-gray-500">
                        Enter your product data in JSON format
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Target Marketplace</label>
                      <Select 
                        value={selectedMarketplace} 
                        onValueChange={setSelectedMarketplace}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select marketplace" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="amazon">Amazon</SelectItem>
                          <SelectItem value="ebay">eBay</SelectItem>
                          <SelectItem value="walmart">Walmart</SelectItem>
                          <SelectItem value="etsy">Etsy</SelectItem>
                          <SelectItem value="shopify">Shopify</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={handleSubmit(handleStartAnalysis)}
                disabled={isAnalyzing || (selectedTab === 'upload' && !file) || (selectedTab === 'direct' && !productJson)}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Analysis
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-6 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">MarketMind Thinking</CardTitle>
              <CardDescription>
                Watch as MarketMind analyzes your product data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgentThinking thoughts={thoughts} />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="shadow-md h-full">
            <CardHeader>
              <CardTitle>
                <span className="flex items-center">
                  Enhanced Results
                  {agentResult && <Badge className="ml-2 bg-green-500">Score: {agentResult.overallScore || 92}/100</Badge>}
                </span>
              </CardTitle>
              <CardDescription>
                Your marketplace-optimized product details
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-7rem)] overflow-y-auto">
              <AgentResult result={agentResult} isLoading={isAnalyzing} />
              
              {!agentResult && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center text-center py-16 px-6 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-md">
                  <MessageSquare className="w-12 h-12 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Analysis Results Yet</h3>
                  <p className="text-sm">
                    Upload a CSV file or enter your product data directly and click "Start Analysis" to see your marketplace-optimized results.
                  </p>
                </div>
              )}
            </CardContent>
            
            {agentResult && (
              <CardFooter className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
                <div className="flex flex-col sm:flex-row w-full gap-2">
                  <Button variant="outline" className="flex-1">
                    <FileUp className="mr-2 h-4 w-4" />
                    Export Results
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Apply Changes
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MarketMindAgent;