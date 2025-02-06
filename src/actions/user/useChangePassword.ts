// hooks/useChangePassword.ts
import { useState } from 'react';

interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  userName: string | null | undefined;
}

export const useChangePassword = () => {
  const [loading, setLoading] = useState(false);

  const changePassword = async (data: ChangePasswordData) => {
    try {
      setLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
      }

      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading };
};
