import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { MarketplaceRequirement } from "@/types";

interface CustomMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (marketplace: { name: string; description: string; requirements: MarketplaceRequirement[] }) => void;
}

export function CustomMarketplaceModal({ isOpen, onClose, onSave }: CustomMarketplaceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState<MarketplaceRequirement[]>([
    { name: "", required: true }
  ]);
  
  const addRequirement = () => {
    setRequirements([...requirements, { name: "", required: true }]);
  };
  
  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };
  
  const updateRequirement = (index: number, field: keyof MarketplaceRequirement, value: string | boolean) => {
    const newRequirements = [...requirements];
    newRequirements[index] = { 
      ...newRequirements[index], 
      [field]: value 
    };
    setRequirements(newRequirements);
  };
  
  const handleSave = () => {
    if (!name.trim()) return;
    
    // Filter out empty requirement names
    const validRequirements = requirements.filter(req => req.name.trim() !== "");
    
    onSave({
      name,
      description,
      requirements: validRequirements
    });
    
    // Reset form
    setName("");
    setDescription("");
    setRequirements([{ name: "", required: true }]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle>Create Custom Marketplace</DialogTitle>
        <DialogDescription>
          Define your own marketplace with specific field requirements.
        </DialogDescription>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="marketplace-name">Marketplace Name</Label>
            <Input
              id="marketplace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Online Store"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="marketplace-description">Description</Label>
            <Input
              id="marketplace-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Custom e-commerce platform"
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Required Fields</Label>
            <div className="space-y-2">
              {requirements.map((req, index) => (
                <Card key={index}>
                  <CardContent className="p-3 flex items-center gap-2">
                    <Input
                      value={req.name}
                      onChange={(e) => updateRequirement(index, "name", e.target.value)}
                      placeholder="Field name"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRequirement(index)}
                      disabled={requirements.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={addRequirement}
              >
                Add Field
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Marketplace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CustomMarketplaceModal;
