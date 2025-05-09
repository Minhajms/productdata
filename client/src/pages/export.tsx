import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Download,
  FileJson,
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle2,
  Home,
  Copy,
  BarChart3,
  Package2,
  FileText,
  History,
  MoreHorizontal
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface ExportProps {
  products: any[];
  onBack: () => void;
  onNew: () => void;
}

export function Export({ products, onBack, onNew }: ExportProps) {
  const [, setLocation] = useLocation();
  const [exportFormat, setExportFormat] = useState("csv");
  const [targetMarketplace, setTargetMarketplace] = useState("amazon");
  const [exportOptions, setExportOptions] = useState({
    includeHeaders: true,
    includeUnenhanced: true,
    encodeUtf8: true,
    addQuotes: true,
    formatForMarketplace: true,
  });
  const [selectedExportFields, setSelectedExportFields] = useState<string[]>([
    "product_id", "title", "description", "bullet_points", "brand", "category", "price", "images"
  ]);
  const [exportHistory, setExportHistory] = useState([
    { 
      id: 1, 
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
      format: "CSV", 
      marketplace: "Amazon", 
      products: 15,
      name: "Amazon Electronics Batch"
    },
    { 
      id: 2, 
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), 
      format: "CSV", 
      marketplace: "eBay", 
      products: 8,
      name: "eBay Home Goods"
    }
  ]);
  
  const marketplaceOptions = [
    { id: "amazon", name: "Amazon", icon: <Package2 className="h-4 w-4 mr-2" /> },
    { id: "ebay", name: "eBay", icon: <BarChart3 className="h-4 w-4 mr-2" /> },
    { id: "walmart", name: "Walmart", icon: <Package2 className="h-4 w-4 mr-2" /> },
    { id: "etsy", name: "Etsy", icon: <Package2 className="h-4 w-4 mr-2" /> },
    { id: "shopify", name: "Shopify", icon: <Package2 className="h-4 w-4 mr-2" /> },
    { id: "generic", name: "Generic CSV", icon: <FileText className="h-4 w-4 mr-2" /> },
  ];
  
  const formatOptions = [
    { id: "csv", name: "CSV", icon: <FileSpreadsheet className="h-4 w-4 mr-2" />, description: "Compatible with Excel and spreadsheet software" },
    { id: "json", name: "JSON", icon: <FileJson className="h-4 w-4 mr-2" />, description: "Best for developer-friendly data" },
    { id: "tsv", name: "TSV", icon: <FileText className="h-4 w-4 mr-2" />, description: "Tab-separated values for specific systems" },
  ];
  
  const fieldOptions = [
    { id: "product_id", label: "Product ID", required: true },
    { id: "title", label: "Title", required: true },
    { id: "description", label: "Description", required: false },
    { id: "bullet_points", label: "Bullet Points", required: false },
    { id: "brand", label: "Brand", required: false },
    { id: "category", label: "Category", required: false },
    { id: "price", label: "Price", required: false },
    { id: "images", label: "Images", required: false },
    { id: "asin", label: "ASIN", required: false },
    { id: "sku", label: "SKU", required: false },
    { id: "upc", label: "UPC", required: false },
    { id: "keywords", label: "Keywords", required: false },
  ];
  
  const toggleField = (field: string) => {
    setSelectedExportFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field) 
        : [...prev, field]
    );
  };
  
  const handleExport = () => {
    // Simulate export
    toast({
      title: "Export completed",
      description: `${products.length} products exported as ${exportFormat.toUpperCase()} for ${getMarketplaceName(targetMarketplace)}`,
    });
    
    // Update export history
    const newExportRecord = {
      id: exportHistory.length + 1,
      date: new Date().toISOString(),
      format: exportFormat.toUpperCase(),
      marketplace: getMarketplaceName(targetMarketplace),
      products: products.length,
      name: `${getMarketplaceName(targetMarketplace)} Export ${new Date().toLocaleDateString()}`
    };
    
    setExportHistory([newExportRecord, ...exportHistory]);
  };
  
  const getMarketplaceName = (id: string) => {
    return marketplaceOptions.find(m => m.id === id)?.name || id;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };
  
  const copyToClipboard = () => {
    toast({
      title: "Link copied to clipboard",
      description: "Share this link to provide access to your export",
    });
  };
  
  const downloadSelectedExport = (id: number) => {
    toast({
      title: "Download started",
      description: "Your previously exported file is being downloaded",
    });
  };
  
  const renderExportPreview = () => {
    const enhancedProducts = products.filter(p => p.status === "enhanced");
    const previewProducts = enhancedProducts.slice(0, 3);
    
    if (exportFormat === "csv") {
      return (
        <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm font-mono overflow-x-auto max-h-[300px] text-gray-700">
          {/* CSV header row */}
          <div className="mb-1">
            {selectedExportFields.join(",")}
          </div>
          
          {/* Sample data rows */}
          {previewProducts.map((product, index) => (
            <div key={index} className="mb-1">
              {selectedExportFields.map(field => {
                // Handle special fields that might be arrays or objects
                if (field === "bullet_points" && Array.isArray(product[field])) {
                  return `"${product[field].join("; ")}"`;
                }
                if (field === "images" && Array.isArray(product[field])) {
                  return `"${product[field].join("; ")}"`;
                }
                return `"${product[field] || ""}"`;
              }).join(",")}
            </div>
          ))}
          
          {enhancedProducts.length > 3 && (
            <div className="text-gray-500 pt-1">
              ... and {enhancedProducts.length - 3} more rows
            </div>
          )}
        </div>
      );
    }
    
    if (exportFormat === "json") {
      const jsonPreview = previewProducts.map(product => {
        const filteredProduct: Record<string, any> = {};
        selectedExportFields.forEach(field => {
          filteredProduct[field] = product[field];
        });
        return filteredProduct;
      });
      
      return (
        <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm font-mono overflow-x-auto max-h-[300px] text-gray-700">
          {JSON.stringify(jsonPreview, null, 2)}
          {enhancedProducts.length > 3 && (
            <div className="text-gray-500 pt-1">
              ... and {enhancedProducts.length - 3} more items
            </div>
          )}
        </div>
      );
    }
    
    // TSV format
    return (
      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm font-mono overflow-x-auto max-h-[300px] text-gray-700">
        {/* TSV header row */}
        <div className="mb-1">
          {selectedExportFields.join("\t")}
        </div>
        
        {/* Sample data rows */}
        {previewProducts.map((product, index) => (
          <div key={index} className="mb-1">
            {selectedExportFields.map(field => {
              // Handle special fields that might be arrays or objects
              if (field === "bullet_points" && Array.isArray(product[field])) {
                return `"${product[field].join("; ")}"`;
              }
              if (field === "images" && Array.isArray(product[field])) {
                return `"${product[field].join("; ")}"`;
              }
              return `"${product[field] || ""}"`;
            }).join("\t")}
          </div>
        ))}
        
        {enhancedProducts.length > 3 && (
          <div className="text-gray-500 pt-1">
            ... and {enhancedProducts.length - 3} more rows
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Export Enhanced Products</h2>
          <p className="text-gray-600">
            Export your enhanced products in your preferred format
          </p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={onNew}
          >
            <Home className="mr-2 h-4 w-4" />
            New Upload
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Products
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export options column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Export Format</CardTitle>
              <CardDescription>Choose your preferred file format</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={exportFormat} 
                onValueChange={setExportFormat}
                className="space-y-3"
              >
                {formatOptions.map(format => (
                  <div 
                    key={format.id}
                    className={`flex items-center space-x-2 rounded-md border p-3 ${exportFormat === format.id ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}
                  >
                    <RadioGroupItem value={format.id} id={`format-${format.id}`} />
                    <Label 
                      htmlFor={`format-${format.id}`}
                      className="flex-1 cursor-pointer flex items-center"
                    >
                      {format.icon}
                      <div>
                        <div className="font-medium">{format.name}</div>
                        <div className="text-xs text-gray-500">{format.description}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Target Marketplace</CardTitle>
              <CardDescription>Optimize format for specific marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              <Select 
                value={targetMarketplace} 
                onValueChange={setTargetMarketplace}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a marketplace" />
                </SelectTrigger>
                <SelectContent>
                  {marketplaceOptions.map(marketplace => (
                    <SelectItem key={marketplace.id} value={marketplace.id}>
                      <div className="flex items-center">
                        {marketplace.icon}
                        {marketplace.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="format-marketplace">Format for Marketplace</Label>
                    <div className="text-xs text-gray-500">
                      Adjust field names for {getMarketplaceName(targetMarketplace)} format
                    </div>
                  </div>
                  <Switch 
                    id="format-marketplace"
                    checked={exportOptions.formatForMarketplace}
                    onCheckedChange={(checked) => 
                      setExportOptions({...exportOptions, formatForMarketplace: checked})
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Customize your export file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-headers">Include Headers</Label>
                  <div className="text-xs text-gray-500">
                    Add field names as the first row
                  </div>
                </div>
                <Switch 
                  id="include-headers"
                  checked={exportOptions.includeHeaders}
                  onCheckedChange={(checked) => 
                    setExportOptions({...exportOptions, includeHeaders: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-unenhanced">Include Unenhanced</Label>
                  <div className="text-xs text-gray-500">
                    Include products without AI enhancement
                  </div>
                </div>
                <Switch 
                  id="include-unenhanced"
                  checked={exportOptions.includeUnenhanced}
                  onCheckedChange={(checked) => 
                    setExportOptions({...exportOptions, includeUnenhanced: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="encode-utf8">UTF-8 Encoding</Label>
                  <div className="text-xs text-gray-500">
                    Add UTF-8 BOM for international characters
                  </div>
                </div>
                <Switch 
                  id="encode-utf8"
                  checked={exportOptions.encodeUtf8}
                  onCheckedChange={(checked) => 
                    setExportOptions({...exportOptions, encodeUtf8: checked})
                  }
                />
              </div>
              
              {exportFormat === "csv" && (
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="add-quotes">Quote Text Fields</Label>
                    <div className="text-xs text-gray-500">
                      Add quotes around text fields
                    </div>
                  </div>
                  <Switch 
                    id="add-quotes"
                    checked={exportOptions.addQuotes}
                    onCheckedChange={(checked) => 
                      setExportOptions({...exportOptions, addQuotes: checked})
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Fields and preview column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Export Fields</CardTitle>
              <CardDescription>Select the fields to include in your export</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {fieldOptions.map(field => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`field-${field.id}`}
                      checked={selectedExportFields.includes(field.id)}
                      onCheckedChange={() => toggleField(field.id)}
                      disabled={field.required}
                    />
                    <div>
                      <Label 
                        htmlFor={`field-${field.id}`}
                        className="cursor-pointer"
                      >
                        {field.label}
                      </Label>
                      {field.required && (
                        <span className="ml-2 text-xs text-red-500">Required</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Alert className="mt-6">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <AlertTitle>Export Ready</AlertTitle>
                <AlertDescription>
                  {products.filter(p => p.status === "enhanced").length} enhanced products are ready for export to {getMarketplaceName(targetMarketplace)}.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Export Preview</CardTitle>
              <CardDescription>Preview of your export file (first 3 rows)</CardDescription>
            </CardHeader>
            <CardContent>
              {renderExportPreview()}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <History className="mr-2 h-5 w-5 text-gray-600" />
                    Export History
                  </CardTitle>
                  <CardDescription>Previous exports available for download</CardDescription>
                </div>
                <Badge variant="secondary" className="text-gray-600">
                  {exportHistory.length} Exports
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Marketplace</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exportHistory.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm">
                        {formatDate(item.date)}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.marketplace}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-100 hover:bg-gray-100">
                          {item.format}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => copyToClipboard()}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => downloadSelectedExport(item.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {exportHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                        No export history available yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Enhancement
            </Button>
            
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleExport}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Products
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Export;