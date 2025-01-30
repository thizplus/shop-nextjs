// ส่วนของ Color Picker Component แยกออกมา
import React, { useState } from 'react';

import { ChromePicker } from 'react-color';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const ColorPickerButton: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          width: '40px',
          height: '40px',
          backgroundColor: color,
          cursor: 'pointer',
          border: '2px solid #ddd',
          borderRadius: '4px',
          '&:hover': {
            opacity: 0.8
          }
        }}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <ChromePicker
          color={color}
          onChange={(color) => onChange(color.hex)}
        />
      </Popover>
    </>
  );
};


export default ColorPickerButton
