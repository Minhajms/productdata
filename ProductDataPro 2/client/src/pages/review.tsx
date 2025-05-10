import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Product } from "@/types";
import { CheckCircle, Edit, Eye, Search } from "lucide-react";
import ProductPreviewModal from "@/components/product-preview-modal";
import ProductEditModal from "@/components/product-edit-modal";

interface ReviewProps {
  enhancedData: Product[];
  marketplace: string;
  onContinue: () => void;
  onBack: () => void;
  onUpdateProduct: (product: Product) => void;
}

export function Review({ enhancedData, marketplace, onContinue, onBack, onUpdateProduct }: ReviewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // Find all unique categories
  const categories = ["all", ...Array.from(new Set(enhancedData.map(p => p.category || "Uncategorized")))];
  
  // Calculate product status
  const getProductStatus = (product: Product): "complete" | "needs_review" | "error" => {
    if (!product.title || !product.description) return "error";
    if (!product.brand || !product.category) return "needs_review";
    return "complete";
  };
  
  // Filter products based on search and filters
  const filteredProducts = enhancedData.filter(product => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      product.product_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.title && product.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    // Status filter
    const status = getProductStatus(product);
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "complete" && status === "complete") ||
      (statusFilter === "needs_review" && status === "needs_review") ||
      (statusFilter === "error" && status === "error");
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map(p => p.product_id));
    } else {
      setSelectedProducts([]);
    }
  };
  
  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };
  
  const handlePreview = (product: Product) => {
    setCurrentProduct(product);
    setPreviewModalOpen(true);
  };
  
  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setEditModalOpen(true);
  };
  
  const handleSaveEdit = (updatedProduct: Product) => {
    onUpdateProduct(updatedProduct);
  };
  
  // Calculate stats
  const totalProducts = enhancedData.length;
  const completeProducts = enhancedData.filter(p => getProductStatus(p) === "complete").length;
  const needsReviewProducts = enhancedData.filter(p => getProductStatus(p) === "needs_review").length;
  const errorProducts = totalProducts - completeProducts - needsReviewProducts;

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Review Enhanced Product Data</h2>
      <p className="text-gray-600 mb-6">
        Review and edit the enhanced product data before exporting to {marketplace} format.
      </p>
      
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.filter(c => c !== "all").map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="needs_review">Needs Review</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          className="w-full md:w-auto"
          onClick={() => {
            // Bulk edit feature (not fully implemented in this MVP)
            alert("Bulk edit functionality will be available in a future update.");
          }}
        >
          <Edit className="h-4 w-4 mr-2" />
          Bulk Edit
        </Button>
      </div>
      
      <div className="mb-8 overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all products"
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const status = getProductStatus(product);
                return (
                  <TableRow key={product.product_id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.includes(product.product_id)}
                        onCheckedChange={(checked) => 
                          handleSelectProduct(product.product_id, checked as boolean)
                        }
                        aria-label={`Select product ${product.product_id}`}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {product.product_id}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-900 max-w-md truncate">
                      {product.title}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {product.category || "Uncategorized"}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${status === "complete" ? "bg-green-100 text-green-800" : 
                          status === "needs_review" ? "bg-yellow-100 text-yellow-800" : 
                          "bg-red-100 text-red-800"}`}>
                        {status === "complete" ? "Complete" : 
                          status === "needs_review" ? "Needs Review" : 
                          "Error"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                          className="text-primary hover:text-primary/80"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePreview(product)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                  No products match your search criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Alert className="bg-green-50 border border-green-100 rounded-lg mb-8">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-green-800 font-medium text-sm">
          Data Enhancement Complete
        </AlertTitle>
        <AlertDescription className="text-green-700 text-sm mt-1">
          {completeProducts} out of {totalProducts} products have been successfully enhanced with missing data.
          {(needsReviewProducts > 0 || errorProducts > 0) && ` ${needsReviewProducts + errorProducts} products need review or have errors.`} 
          You can edit any product before exporting.
        </AlertDescription>
      </Alert>
      
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button onClick={onContinue}>
          Continue to Export
        </Button>
      </div>
      
      <ProductPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        product={currentProduct}
        marketplace={marketplace}
      />
      
      <ProductEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        product={currentProduct}
        onSave={handleSaveEdit}
        marketplace={marketplace}
      />
    </div>
  );
}

export default Review;
