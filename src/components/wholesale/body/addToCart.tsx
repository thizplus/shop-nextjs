import React, { useEffect } from 'react';

import { TextField } from '@mui/material';

import { useCartStore } from '@/stores/cartStore';
import type { TypesProductWholesale } from '@/types/productTypes';
import { useClientStores } from '@/stores/authStore';

interface PropsAddToCart {
  items: TypesProductWholesale;
  priceId: string;
}

const AddToCart: React.FC<PropsAddToCart> = ({ items, priceId }) => {
  const { addItem, updateItemQuantity, getItemQuantity, updateItemPrice } = useCartStore();
  const quantity = getItemQuantity(priceId, items.sku);

  const { user } = useClientStores();
  const customPrice = user?.customPrices?.find(cp => cp.sku === items.sku)?.price;

  const price = customPrice || items.price;

  useEffect(() => {
    if (quantity > 0) {
      // ปรับจาก items.price เป็น price (ที่รวม customPrice แล้ว)
      updateItemPrice(priceId, items.sku, price);
      updateItemQuantity(priceId, items.sku, Math.min(quantity, items.availablestock));
    }
  }, [items, priceId, quantity, updateItemPrice, updateItemQuantity, price]); // เพิ่ม price ใน dependencies

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Math.min(parseInt(event.target.value) || 0, items.availablestock);

    updateQuantity(newQuantity);
  };

  const handleIncrement = () => {
    if (quantity < items.availablestock) {
      updateQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      updateQuantity(quantity - 1);
    }
  };

  const updateQuantity = (newQuantity: number) => {
    if (quantity === 0 && newQuantity > 0) {
      addItem(priceId, {
        ...items,
        qty: newQuantity,
        price: customPrice || items.price, // ใช้ customPrice ถ้ามี
      });
    } else {
      updateItemQuantity(priceId, items.sku, newQuantity);
    }
  };

  return (
    <div className='flex justify-between mt-2'>
      <p onClick={handleDecrement} className='flex p-0 my-auto cursor-pointer'>
        <i className="tabler-minus"></i>
      </p>
      <TextField
        value={quantity}
        onChange={handleChange}
        type="number"
        onFocus={(event) => event.currentTarget.select()}
        inputProps={{
          min: 0,
          max: items.availablestock,
          className: 'p-0 text-center h-full p-1 w-[70px]'
        }}
        sx={{
          "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
            display: "none",
          },
          "& input[type=number]": {
            MozAppearance: "textfield",
          },
        }}
        size="small"
      />
      <p onClick={handleIncrement} className='flex p-0 my-auto cursor-pointer'>
        <i className="tabler-plus"></i>
      </p>
    </div>
  );
};

export default AddToCart;
