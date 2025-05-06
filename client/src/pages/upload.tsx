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
      
      <FileUploader onFileUpload={handleFileUpload} />
    </div>
  );
}

export default Upload;
