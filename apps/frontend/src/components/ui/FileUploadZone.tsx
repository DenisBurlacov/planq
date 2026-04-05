import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileUploadZoneProps {
  accept: string;
  maxSize: number; // in bytes
  maxSizeLabel: string;
  multiple?: boolean;
  onUpload: (files: File[]) => void;
  preview?: string | null;
  onRemove?: () => void;
  'data-testid'?: string;
  'data-testid-remove'?: string;
}

export function FileUploadZone({
  accept,
  maxSize,
  maxSizeLabel,
  multiple = false,
  onUpload,
  preview,
  onRemove,
  'data-testid': testId,
  'data-testid-remove': testIdRemove,
}: FileUploadZoneProps) {
  const { t } = useTranslation('common');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    size: string;
    dimensions?: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptTypes = accept.split(',').map(s => s.trim());

  const validateFiles = useCallback(
    (files: FileList | File[]): File[] => {
      const valid: File[] = [];
      for (const file of Array.from(files)) {
        if (file.size > maxSize) {
          setError(t('upload.error.tooLarge', { size: maxSizeLabel }));
          return [];
        }
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        const typeMatch = acceptTypes.some(
          a =>
            file.type === a ||
            a === ext ||
            (a.endsWith('/*') && file.type.startsWith(a.replace('/*', '/')))
        );
        if (!typeMatch) {
          setError(t('upload.error.invalidType'));
          return [];
        }
        valid.push(file);
      }
      setError(null);
      return valid;
    },
    [maxSize, maxSizeLabel, acceptTypes, t]
  );

  const captureFileInfo = useCallback((file: File) => {
    const size = formatFileSize(file.size);
    setFileInfo({ size });
    // Try to read image dimensions
    if (file.type.startsWith('image/')) {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        setFileInfo({ size, dimensions: `${img.width} x ${img.height}` });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const files = validateFiles(e.dataTransfer.files);
      if (files.length > 0) {
        captureFileInfo(files[0]);
        onUpload(files);
      }
    },
    [validateFiles, onUpload, captureFileInfo]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = validateFiles(e.target.files);
    if (files.length > 0) {
      captureFileInfo(files[0]);
      onUpload(files);
    }
    e.target.value = '';
  };

  // Clear file info when preview is removed
  useEffect(() => {
    if (!preview) setFileInfo(null);
  }, [preview]);

  return (
    <div data-testid={testId ?? 'file-upload-zone'}>
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt=""
            data-testid="upload-preview"
            className="h-24 w-24 rounded-xl object-cover border border-[var(--border)]"
          />
          {onRemove && (
            <button
              data-testid={testIdRemove ?? 'upload-remove'}
              onClick={onRemove}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              aria-label={t('upload.remove')}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {fileInfo && (
            <div
              data-testid="upload-file-info"
              className="mt-1 text-xs text-[var(--text-secondary)]"
            >
              <span>{t('upload.fileSize', { size: fileInfo.size })}</span>
              {fileInfo.dimensions && (
                <span className="ml-2">
                  {t('upload.fileDimensions', {
                    width: fileInfo.dimensions.split(' x ')[0],
                    height: fileInfo.dimensions.split(' x ')[1],
                  })}
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          data-testid="upload-dropzone"
          onDragOver={e => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors ${
            dragActive
              ? 'border-[var(--upload-border)] bg-[var(--upload-bg-hover)]'
              : 'border-[var(--border)] hover:border-[var(--upload-border)] hover:bg-[var(--upload-bg-hover)]'
          }`}
        >
          <Upload className="h-8 w-8 text-[var(--text-secondary)]" />
          <p className="text-sm text-[var(--text-secondary)]">{t('upload.dragDrop')}</p>
          <p className="text-xs text-[var(--text-secondary)]">
            {t('upload.maxSize', { size: maxSizeLabel })}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {t('upload.formats', { formats: accept })}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            className="hidden"
            data-testid="upload-input"
          />
        </div>
      )}
      {error && (
        <p data-testid="upload-error" className="text-xs text-red-500 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
