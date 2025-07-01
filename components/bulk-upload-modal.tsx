"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Download,
  FileSpreadsheet,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  FileText
} from "lucide-react";
import { bulkUploadUsers, parseCSVData, type BulkUploadResult } from "@/lib/admin-services";

interface BulkUploadModalProps {
  onUploadComplete?: (result: BulkUploadResult) => void;
}

export default function BulkUploadModal({ onUploadComplete }: BulkUploadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (isValidFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const isValidFile = (file: File) => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    return validTypes.includes(file.type) || file.name.endsWith('.csv');
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const text = await file.text();
      const userData = parseCSVData(text);
      const result = await bulkUploadUsers(userData);
      
      setUploadResult(result);
      onUploadComplete?.(result);
    } catch (error) {
      setUploadResult({
        success: false,
        totalProcessed: 0,
        successCount: 0,
        errorCount: 1,
        errors: [{
          row: 0,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          data: null
        }],
        createdUsers: []
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,email,phoneNumber,age,bio,location,verified,interests,seductionStyle,flameLevel,fantasyTrigger,powerPlayPreference,topTurnOn,kinkScore,idealSetting,encounterFrequency,afterPassionUnwind,spicyMediaComfort,consentImportance,midnightCraving,riskTolerance,distancePreference,photo1_url,photo2_url,photo3_url
"John Doe","john@example.com","+1234567890",25,"Sample bio","New York, NY",true,"[""hiking"", ""photography""]","playful_tease","hot_blaze","Sample trigger","maybe","Sample turn on",7,"Sample setting","weekly","Sample unwind","somewhat",9,"Sample craving","medium","both","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400","https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",""`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-users-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const resetModal = () => {
    setFile(null);
    setUploadResult(null);
    setUploading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetModal();
    }}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Bulk Upload Users
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Upload Users
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to create multiple users at once. The system will automatically download photos from URLs and upload them to AWS S3 with CloudFront CDN.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Template
              </CardTitle>
              <CardDescription>
                Start with our template to ensure proper formatting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadTemplate} variant="outline" className="w-full">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload File
              </CardTitle>
              <CardDescription>
                Drag and drop your CSV/Excel file or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="space-y-2">
                    <FileText className="mx-auto h-12 w-12 text-green-500" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Drop your CSV/Excel file here
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports .csv, .xls, .xlsx files
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".csv,.xls,.xlsx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" asChild>
                        <span>Browse Files</span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {uploading && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={undefined} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    Processing users and photos...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Results */}
          {uploadResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {uploadResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  Upload Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {uploadResult.totalProcessed}
                    </div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {uploadResult.successCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Success</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {uploadResult.errorCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Errors</div>
                  </div>
                </div>

                {uploadResult.success && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Successfully uploaded {uploadResult.successCount} users with their photos!
                    </AlertDescription>
                  </Alert>
                )}

                {uploadResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <Separator />
                    <h4 className="font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Errors ({uploadResult.errors.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {uploadResult.errors.map((error, index) => (
                        <div key={index} className="text-sm p-2 bg-red-50 rounded border">
                          <div className="font-medium">Row {error.row}</div>
                          <div className="text-red-600">{error.error}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={uploading}
            >
              {uploadResult ? 'Close' : 'Cancel'}
            </Button>
            {!uploadResult && (
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Users
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 