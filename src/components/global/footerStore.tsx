import { useEffect, useState } from "react";

import { ButtonGroup } from "@mui/material";

import MyOrders from "../global/header/myOrders";
import { useClientStores } from '@/stores/authStore';
import { useConfigStore } from "@/stores/configStore";

const FooterStore = () => {

  const { user, isLoggedIn } = useClientStores();
  const { config } = useConfigStore();

  const primaryColor = config?.displayConfig.primaryColor ? config?.displayConfig.primaryColor : '#000000'

  const [priceId, setPriceId] = useState('store');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [priceName, setPriceName] = useState('store');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const currentPriceId = path.startsWith('/wholesale/') ? path.split('/')[2] : 'store';

      setPriceId(currentPriceId);

      // Get price name from config if available
      if (config && currentPriceId !== 'store') {
        const priceConfig = config.saleModel.listPrice.find(price => price.id === currentPriceId);

        if (priceConfig) {
          setPriceName(priceConfig.name);
        } else {
          setPriceName(currentPriceId);
        }
      } else {
        setPriceName('หน้าหลัก');
      }
    }
  }, [config]);

  return (
    <ButtonGroup
      variant="contained"
      aria-label="Basic button group"
      className={`fixed bottom-0 left-0 w-full min-h-[50px]`}
      style={{ display: "flex", background: primaryColor }} // ใช้ Flexbox
    >
      {user && isLoggedIn && (
        <MyOrders profile={user} priceId={priceId} />
      )}

      {/**
      <Button style={{ flex: 1, borderRadius: 0, border: 0, background: primaryColor }}>คูปอง</Button>
      <Button style={{ flex: 1, borderRadius: 0, border: 0, background: primaryColor }}>โปรโมชั่น</Button>
      <Button style={{ flex: 1, borderRadius: 0, border: 0, background: primaryColor }}>แต้มสะสม</Button>
 */}


    </ButtonGroup>
  );
};

export default FooterStore;
