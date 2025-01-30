// actions/backend/clients/clientDeliveryStatus.ts
import { useClientStores } from '@/stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export const getClientDeliveryStatus = async (): Promise<{ enableGrabDelivery: boolean }> => {
  const { user } = useClientStores.getState();

  if (!user?.userId) {
    return { enableGrabDelivery: false };
  }

  try {
    const response = await fetch(
      `${API_URL}/api/clients/${user.userId}/delivery-status`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch client delivery status: ${response.statusText}`);
    }

    const data = await response.json();


    return {
      enableGrabDelivery: data.enableGrabDelivery || false
    };
  } catch (error) {
    console.error('Error fetching delivery status:', error);

    return { enableGrabDelivery: false };
  }
};
