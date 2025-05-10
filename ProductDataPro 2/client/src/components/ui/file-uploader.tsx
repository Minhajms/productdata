import { ChangeEvent, useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatFileSize } from "@/lib/utils";
import { Upload, AlertCircle, FileSpreadsheet, X, Download, CheckCircle, FileIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Simulate upload progress for better UX
  useEffect(() => {
    if (isUploading && uploadProgress < 100) {
      const timer = setTimeout(() => {
        setUploadProgress((prevProgress) => {
          const increment = Math.floor(Math.random() * 15) + 5;
          const newProgress = Math.min(prevProgress + increment, 100);
          
          if (newProgress === 100) {
            setIsUploading(false);
            setIsSuccess(true);
          }
          
          return newProgress;
        });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isUploading, uploadProgress]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      setIsSuccess(false);
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
      
      // Start simulated upload
      setIsUploading(true);
      setUploadProgress(0);
      setSelectedFile(file);
      
      // Simulate a slight delay before calling onFileUpload for better UX
      setTimeout(() => {
        onFileUpload(file);
      }, 1200);
    },
    [maxSize, acceptedFileTypes, onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
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
    setIsSuccess(false);
    setUploadProgress(0);
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
            "border-2 border-dashed rounded-lg transition-all duration-150 p-8 mb-6 flex flex-col items-center justify-center cursor-pointer",
            isDragActive && !isDragReject && "border-blue-400 bg-blue-50",
            isDragReject && "border-red-400 bg-red-50",
            isDragAccept && "border-green-400 bg-green-50",
            !isDragActive && "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
          )}
        >
          <input {...getInputProps()} onChange={handleFileChange} />
          <div className="w-20 h-20 mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <Upload className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Drop your CSV file here</h3>
          <p className="text-gray-500 mb-4 text-center max-w-md">
            Your product data will be analyzed and enhanced automatically
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Select CSV File
          </Button>
          <p className="text-gray-400 text-xs mt-4">Maximum file size: {formatFileSize(maxSize)}</p>
          
          <div className="grid grid-cols-3 gap-6 mt-8 max-w-lg">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 mx-auto flex items-center justify-center">
                <FileIcon className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600 mt-2">Upload CSV</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 mx-auto flex items-center justify-center opacity-60">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600 mt-2">AI Enhancement</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 mx-auto flex items-center justify-center opacity-60">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600 mt-2">Export</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <Card className={cn(
            "border",
            isSuccess && "border-green-200 shadow-sm"
          )}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center mr-3",
                    isSuccess ? "bg-green-100" : "bg-blue-100"
                  )}>
                    {isSuccess ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-400 hover:text-gray-600" 
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {(isUploading || uploadProgress > 0) && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-gray-600 font-medium">
                      {isSuccess ? "Uploaded successfully!" : "Uploading..."}
                    </span>
                    <span className="text-gray-600">{uploadProgress}%</span>
                  </div>
                  <Progress 
                    value={uploadProgress} 
                    className={cn(
                      "h-2", 
                      isSuccess && "bg-green-100"
                    )} 
                    indicatorClassName={isSuccess ? "bg-green-500" : undefined}
                  />
                </div>
              )}
              
              {isSuccess && (
                <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-100 text-sm text-green-800">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                    <p>
                      Your file has been uploaded successfully. Now our AI will process your data to create enhanced listings.
                    </p>
                  </div>
                </div>
              )}
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

      <Card className="bg-gradient-to-b from-white to-gray-50 border shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center mb-3">
            <Download className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Need a template to get started?</h3>
          </div>
          
          <p className="text-gray-600 text-sm mb-4">
            For best results, your CSV should include these columns:
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <div className="bg-white rounded border border-gray-200 px-3 py-2">
              <span className="text-xs font-semibold text-gray-600 block mb-0.5">product_id</span>
              <span className="text-xs text-gray-500">Unique identifier</span>
            </div>
            <div className="bg-white rounded border border-gray-200 px-3 py-2">
              <span className="text-xs font-semibold text-gray-600 block mb-0.5">title</span>
              <span className="text-xs text-gray-500">Product name</span>
            </div>
            <div className="bg-white rounded border border-gray-200 px-3 py-2">
              <span className="text-xs font-semibold text-gray-600 block mb-0.5">description</span>
              <span className="text-xs text-gray-500">Basic details</span>
            </div>
            <div className="bg-white rounded border border-gray-200 px-3 py-2">
              <span className="text-xs font-semibold text-gray-600 block mb-0.5">price</span>
              <span className="text-xs text-gray-500">Product price</span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={downloadTemplate}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FileUploader;
