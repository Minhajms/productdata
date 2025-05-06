import { ChangeEvent, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatFileSize } from "@/lib/utils";
import { Upload, AlertCircle, FileSpreadsheet, X, Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
}

export function FileUploader({
  onFileUpload,
  maxSize = 10 * 1024 * 1024, // Default 10MB
  acceptedFileTypes = [".csv"]
}: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];
      
      if (!file) return;
      
      if (file.size > maxSize) {
        setError(`File is too large. Maximum size is ${formatFileSize(maxSize)}.`);
        return;
      }
      
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (!acceptedFileTypes.includes(fileExtension)) {
        setError(`Invalid file type. Please upload a ${acceptedFileTypes.join(", ")} file.`);
        return;
      }
      
      setSelectedFile(file);
      onFileUpload(file);
    },
    [maxSize, acceptedFileTypes, onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': acceptedFileTypes
    },
    maxSize,
    multiple: false
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onDrop([file]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const downloadTemplate = () => {
    // Create a sample CSV template
    const csvContent = 
      "product_id,title,description,price,category,brand,images\n" +
      "SAMPLE-001,Bluetooth Headphones,High quality wireless headphones,99.99,Electronics,AudioTech,https://example.com/image1.jpg\n" +
      "SAMPLE-002,Coffee Maker,Programmable coffee maker with timer,49.99,Kitchen,HomeBrew,https://example.com/image2.jpg";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "product_template.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "drag-drop-zone rounded-lg p-8 mb-6 flex flex-col items-center justify-center cursor-pointer",
            isDragActive && "active"
          )}
        >
          <input {...getInputProps()} onChange={handleFileChange} />
          <Upload className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-2 text-center">Drag and drop your CSV file here</p>
          <p className="text-gray-400 text-sm mb-4 text-center">or</p>
          <Button>
            Browse Files
          </Button>
          <p className="text-gray-400 text-xs mt-4">Maximum file size: {formatFileSize(maxSize)}</p>
        </div>
      ) : (
        <div className="mb-6">
          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <FileSpreadsheet className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={removeFile}>
                <X className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Recommended CSV Format</h3>
          <p className="text-gray-500 text-sm mb-3">For best results, your CSV should include these columns:</p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              product_id
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              title
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              description
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              price
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              category
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              brand
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              images
            </span>
          </div>
          <div className="mt-3">
            <Button
              variant="link"
              className="p-0 h-auto text-primary hover:text-primary/80 text-sm font-medium flex items-center"
              onClick={downloadTemplate}
            >
              <Download className="h-4 w-4 mr-1" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FileUploader;
