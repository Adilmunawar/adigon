
import React from 'react';
import { X, File, Image, Mic, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileUploadResult } from '@/services/uploadService';

interface AttachmentPreviewProps {
  attachment: FileUploadResult & { preview?: string };
  onRemove: () => void;
  className?: string;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachment,
  onRemove,
  className = ''
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getIcon = () => {
    switch (attachment.type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'audio':
        return <Mic className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`bg-slate-800/60 border-slate-700/50 ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {attachment.type === 'image' && attachment.url ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
              <img 
                src={attachment.url} 
                alt={attachment.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
              {getIcon()}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              {attachment.name}
            </p>
            <p className="text-xs text-slate-400">
              {formatFileSize(attachment.size)}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {attachment.url && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-slate-200"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = attachment.url!;
                  link.download = attachment.name;
                  link.click();
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-red-400"
              onClick={onRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttachmentPreview;
