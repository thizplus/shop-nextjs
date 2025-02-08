// @/actions/backend/setting/getStoreConfig.ts

const actionGetStoreConfig = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/store/config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Get config failed');
    }

    const result = await response.json();


    return result;
  } catch (error) {
    console.error('Error during get config:', error);
    throw error;
  }
};

export default actionGetStoreConfig;
