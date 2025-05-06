import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { Eye, Star, StarHalf } from "lucide-react";

interface ProductPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  marketplace: string;
}

export function ProductPreviewModal({ isOpen, onClose, product, marketplace }: ProductPreviewModalProps) {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <div className="flex items-start mb-4">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 sm:mx-0 sm:h-10 sm:w-10">
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <DialogTitle>Product Preview</DialogTitle>
            <DialogDescription>
              This is how your product will appear in {marketplace} listings
            </DialogDescription>
          </div>
        </div>
        
        <div className="border rounded-md p-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Product Image */}
            <div className="w-full md:w-1/3">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0]} 
                  alt={product.title} 
                  className="w-full h-auto rounded-md object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center">
                  <p className="text-gray-500 text-sm">No image available</p>
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div className="w-full md:w-2/3">
              <h2 className="text-xl font-medium text-gray-900 mb-2">{product.title}</h2>
              
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <StarHalf className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </div>
                <span className="text-sm text-gray-500 ml-2">4.5 (120 reviews)</span>
              </div>
              
              <p className="text-xl font-bold text-gray-900 mb-4">${Number(product.price).toFixed(2)}</p>
              
              {product.bullet_points && product.bullet_points.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">About this item</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    {product.bullet_points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Product Description</h3>
                <p className="text-sm text-gray-700">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-5">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Marketplace Information</h4>
          <div className="bg-gray-50 rounded-md p-3">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {marketplace === "Amazon" && (
                <div className="flex justify-between md:block">
                  <dt className="text-gray-500">ASIN</dt>
                  <dd className="font-medium text-gray-900">{product.asin || 'Not available'}</dd>
                </div>
              )}
              <div className="flex justify-between md:block">
                <dt className="text-gray-500">Brand</dt>
                <dd className="font-medium text-gray-900">{product.brand}</dd>
              </div>
              <div className="flex justify-between md:block">
                <dt className="text-gray-500">Category</dt>
                <dd className="font-medium text-gray-900">{product.category}</dd>
              </div>
              <div className="flex justify-between md:block">
                <dt className="text-gray-500">Product ID</dt>
                <dd className="font-medium text-gray-900">{product.product_id}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductPreviewModal;
