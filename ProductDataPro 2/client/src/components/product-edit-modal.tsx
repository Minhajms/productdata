import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/types";
import { Pencil } from "lucide-react";

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (updatedProduct: Product) => void;
  marketplace: string;
}

export function ProductEditModal({ isOpen, onClose, product, onSave, marketplace }: ProductEditModalProps) {
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);
  
  useEffect(() => {
    if (product) {
      setEditedProduct({ ...product });
    }
  }, [product]);
  
  if (!editedProduct) return null;
  
  const handleChange = (field: keyof Product, value: string | string[] | number) => {
    setEditedProduct({
      ...editedProduct,
      [field]: value
    });
  };
  
  const handleBulletPointChange = (index: number, value: string) => {
    const bulletPoints = [...(editedProduct.bullet_points || [])];
    bulletPoints[index] = value;
    handleChange('bullet_points', bulletPoints);
  };
  
  const addBulletPoint = () => {
    const bulletPoints = [...(editedProduct.bullet_points || []), ''];
    handleChange('bullet_points', bulletPoints);
  };
  
  const removeBulletPoint = (index: number) => {
    const bulletPoints = (editedProduct.bullet_points || []).filter((_, i) => i !== index);
    handleChange('bullet_points', bulletPoints);
  };
  
  const handleSave = () => {
    onSave(editedProduct);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <div className="flex items-start mb-4">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 sm:mx-0 sm:h-10 sm:w-10">
            <Pencil className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information for {marketplace}
            </DialogDescription>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="product-id">Product ID</Label>
            <Input
              id="product-id"
              value={editedProduct.product_id}
              onChange={(e) => handleChange('product_id', e.target.value)}
              readOnly
              disabled
            />
          </div>
          
          {marketplace === "Amazon" && (
            <div className="grid gap-2">
              <Label htmlFor="asin">ASIN</Label>
              <Input
                id="asin"
                value={editedProduct.asin || ''}
                onChange={(e) => handleChange('asin', e.target.value)}
              />
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={editedProduct.brand || ''}
              onChange={(e) => handleChange('brand', e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={editedProduct.category || ''}
              onChange={(e) => handleChange('category', e.target.value)}
            />
          </div>
          
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editedProduct.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>
          
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedProduct.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={5}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={editedProduct.price || ''}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
            />
          </div>
          
          <div className="grid gap-2 md:col-span-2">
            <Label>Bullet Points</Label>
            <div className="space-y-2">
              {(editedProduct.bullet_points || []).map((point, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={point}
                    onChange={(e) => handleBulletPointChange(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => removeBulletPoint(index)}
                  >
                    -
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={addBulletPoint}
              >
                Add Bullet Point
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProductEditModal;
