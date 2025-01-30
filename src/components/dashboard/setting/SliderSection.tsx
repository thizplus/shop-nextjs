import React from 'react';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface SliderItem {
  id: string;
  url: string;

  isTemp?: boolean;
}

interface SliderSectionProps {
  sliders: SliderItem[];
  onRemove: (id: string) => Promise<void>;
  onAdd: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SliderSection: React.FC<SliderSectionProps> = ({ sliders, onRemove, onAdd }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onAdd(event);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="slider-upload"
        />
        <label htmlFor="slider-upload">
          <Button
            component="span"
            variant="outlined"
            startIcon={<AddIcon />}
            size='small'
          >
            เพิ่มรูปภาพสไลด์
          </Button>
        </label>
      </div>

      <div className="space-y-4">
        {sliders.map((slider, index) => (
          <div key={slider.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
            <span className="text-gray-500 w-8">{index + 1}.</span>
            {slider.url ? (
              <img
                src={slider.url}
                alt={`slider ${index + 1}`}
                className="w-32 h-24 object-cover rounded"
              />
            ) : (
              <div className="w-32 h-24 bg-gray-200 flex items-center justify-center rounded">
                <span className="text-gray-500">Uploading...</span>
              </div>
            )}
            <div className="flex-grow" />
            <IconButton
              onClick={() => onRemove(slider.id)}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SliderSection;
