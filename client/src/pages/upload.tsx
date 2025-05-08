import { useEffect, useState } from "react";
import FileUploader from "@/components/ui/file-uploader";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Your Product Data</h2>
      <p className="text-gray-600 mb-6">
        Upload a CSV file containing your product information. We'll help you transform it into marketplace-ready listings.
      </p>
      
      <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h3 className="text-blue-800 font-medium text-sm mb-2">What happens next?</h3>
        <ul className="text-blue-700 text-sm space-y-2">
          <li className="flex items-start">
            <span className="mr-2 mt-0.5">1.</span>
            <span>We'll analyze your product data to identify which type of products you're selling</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-0.5">2.</span>
            <span>Our AI will identify missing or incomplete fields that could improve your listings</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-0.5">3.</span>
            <span>We'll enhance your listings with SEO-optimized titles, compelling descriptions, and persuasive bullet points</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-0.5">4.</span>
            <span>You'll be able to review and edit all AI-generated content before exporting</span>
          </li>
        </ul>
      </div>
      
      <FileUploader onFileUpload={handleFileUpload} />
    </div>
  );
}

export default Upload;
