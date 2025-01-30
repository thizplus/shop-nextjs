import React, { useState, useCallback, useEffect } from 'react'

import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import { useDropzone } from 'react-dropzone'

interface FileUploadProps {
  onFileSelected: (file: File | null) => void
  currentImageUrl?: string
  multiple?: boolean
  height?: number
  accept?: string
  placeholderText?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelected,
  currentImageUrl,
  multiple = false,
  height = 250,
  accept = 'image/*',
  placeholderText = 'แนบภาพที่นี่...'
}) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      // ถ้าเป็นการอัพโหลดไฟล์เดียว
      if (!multiple) {
        const file = acceptedFiles[0];
        const previewUrl = URL.createObjectURL(file);

        setPreview(previewUrl);
        onFileSelected(file);
      }

      // ถ้าเป็นการอัพโหลดหลายไฟล์ ส่งไฟล์แรกไปแสดงเป็น preview
      else {
        const firstFile = acceptedFiles[0];
        const previewUrl = URL.createObjectURL(firstFile);

        setPreview(previewUrl);
        onFileSelected(firstFile);
      }
    }
  }, [onFileSelected, multiple]);

  useEffect(() => {
    setPreview(currentImageUrl || null);
  }, [currentImageUrl]);

  const { getRootProps, getInputProps } = useDropzone({
    multiple,
    accept: {
      [accept]: ['.png', '.jpg', '.jpeg', '.gif', '.svg']
    },
    onDrop
  });

  return (
    <Box
      {...getRootProps({ className: 'dropzone' })}
      sx={{
        height,
        border: '1px dashed grey',
        borderRadius: '15px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer'
      }}
    >
      <input {...getInputProps()} />
      {preview ? (
        preview.endsWith('.svg') ? (
          <object
            data={preview}
            type="image/svg+xml"
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
          >
            Your browser does not support SVG
          </object>
        ) : (
          <img
            src={preview}
            alt="Preview"
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
          />
        )
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <Avatar sx={{ width: 40, height: 40, margin: '0 auto' }}>
            <i className="tabler-upload" />
          </Avatar>
          <Typography variant="subtitle1">
            {placeholderText}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
