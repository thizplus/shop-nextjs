


import type { TypesLogin } from '@/types/userTypes';


const actionLogin = async (formData: TypesLogin) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const results = await response.json();

    if (results.status) {
      // Register shop after successful login
      await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/shops/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: process.env.NEXT_PUBLIC_SITE_NAME,
          code: process.env.NEXT_PUBLIC_SITE_CODE,
        })
      });
    }

    return results;
  } catch (error) {
    console.error('Error Login User:', error);
    throw error;
  }
};

export default actionLogin;
