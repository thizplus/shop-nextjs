// components/dashboard/products/ProductInfoCell.tsx
import React, { useState } from 'react';

import { Box, Typography, Modal, IconButton } from '@mui/material';

import type { TypesProduct } from "@/types/productTypes";

interface ProductInfoCellProps {
  product: TypesProduct;
}

const ProductInfoCell: React.FC<ProductInfoCellProps> = ({ product }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleOpenLightbox = (e: React.MouseEvent) => {
    e.stopPropagation(); // ป้องกันการ trigger event ของ table row
    setIsLightboxOpen(true);
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', minWidth: 250 }}>
        {/* รูปภาพสินค้า */}
        <Box
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            cursor: product.imagepath ? 'pointer' : 'default',
            '&:hover': {
              opacity: product.imagepath ? 0.8 : 1
            }
          }}
          onClick={product.imagepath ? handleOpenLightbox : undefined}
        >
          {product.imagepath ? (
            <img
              src={product.imagepath}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '4px'
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: 'grey.100',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className="tabler-photo-off" />
            </Box>
          )}
        </Box>

        {/* ข้อมูลสินค้า */}
        <Box sx={{ flex: 1, lineHeight: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {product.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {product.categories?.map(cat => cat.name).join(', ')}
          </Typography>
        </Box>
      </Box>

      {/* Lightbox Modal */}
      <Modal
        open={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        aria-labelledby="image-lightbox"
        onClick={() => setIsLightboxOpen(false)}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '90vw',
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 1,
          borderRadius: 1,
          outline: 'none'
        }}>
          {/* Close button */}
          <IconButton
            onClick={() => setIsLightboxOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <i className="tabler-x" />
          </IconButton>

          {/* Image */}
          <img
            src={product.imagepath || ''}
            alt={product.name}
            style={{
              display: 'block',
              maxWidth: '100%',
              maxHeight: 'calc(90vh - 2rem)',
              objectFit: 'contain',
              margin: '0 auto'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </Box>
      </Modal>
    </>
  );
};

export default ProductInfoCell;
