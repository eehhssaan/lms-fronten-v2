/**
 * Utility functions for handling file operations
 */

// Create a download link for a blob file
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Get file extension from filename
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop() || '';
};

// Format file size to human readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Check if file type is allowed
export const isFileTypeAllowed = (file: File, allowedTypes: string[]): boolean => {
  const fileType = file.type.split('/')[1];
  return allowedTypes.includes(fileType);
};

// Check if file size is within limit
export const isFileSizeAllowed = (file: File, maxSizeInBytes: number): boolean => {
  return file.size <= maxSizeInBytes;
};

// Convert base64 to blob
export const base64ToBlob = (base64: string, contentType: string): Blob => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};

// Get file icon based on file extension
export const getFileIcon = (extension: string): string => {
  const iconMap: { [key: string]: string } = {
    pdf: 'file-text',
    doc: 'file-text',
    docx: 'file-text',
    xls: 'file',
    xlsx: 'file',
    ppt: 'file',
    pptx: 'file',
    txt: 'file-text',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    mp4: 'video',
    mov: 'video',
    mp3: 'music',
    wav: 'music',
    zip: 'archive',
    rar: 'archive'
  };

  return iconMap[extension.toLowerCase()] || 'file';
};
