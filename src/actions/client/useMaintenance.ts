import { useState, useEffect } from 'react';

// กำหนด type สำหรับข้อมูลการตั้งค่า maintenance
interface MaintenanceConfig {
  isEnabled: boolean;
  message: string;
  restrictAfterDate: string;
  isRestrictNewUsers: boolean;
}

// กำหนด type สำหรับข้อมูลการปิดปรับปรุง
interface MaintenanceResponse {
  status: 'ok' | 'maintenance' | 'error';
  maintenance: boolean;
  message?: string;
  config?: MaintenanceConfig;
}

interface UseMaintenanceResult {
  isLoading: boolean;
  error: Error | null;
  data: MaintenanceResponse | null;
  isMaintenanceActive: boolean;
  shouldBlockUser: (registrationDate?: string) => boolean;
  refetch: () => Promise<void>;
}

/**
 * ฟังก์ชันช่วยแปลงวันที่เป็น YYYY-MM-DD string
 */
const formatDateToYMD = (dateString?: string): string | undefined => {
  if (!dateString) return undefined;

  try {
    const date = new Date(dateString);


    // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
    if (isNaN(date.getTime())) return undefined;

    // แปลงเป็น YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);

    return undefined;
  }
};

/**
 * Hook สำหรับตรวจสอบสถานะการปิดปรับปรุงระบบจากคลัง
 */
const useMaintenance = (): UseMaintenanceResult => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<MaintenanceResponse | null>(null);

  // ฟังก์ชันสำหรับดึงข้อมูล maintenance
  const fetchMaintenance = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching maintenance data from:', `${process.env.NEXT_PUBLIC_STORE_URL}/api/store/maintenance`);

      // เรียก API จากคลัง
      const response = await fetch(`${process.env.NEXT_PUBLIC_STORE_URL}/api/store/maintenance`);

      if (!response.ok) {
        throw new Error(`Failed to fetch maintenance data: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      console.log('Maintenance data:', result);
      setData(result);
    } catch (err) {
      console.error('Error fetching maintenance data:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  // เรียกดึงข้อมูลเมื่อ component mount
  useEffect(() => {
    fetchMaintenance();
  }, []);

  // ฟังก์ชันตรวจสอบว่า maintenance กำลังทำงานอยู่หรือไม่
  const isMaintenanceActive = data?.config?.isEnabled || false;

  // ฟังก์ชันตรวจสอบว่าควรบล็อคผู้ใช้หรือไม่ตามวันที่ลงทะเบียน
  // ฟังก์ชันตรวจสอบว่าควรบล็อคผู้ใช้หรือไม่ตามวันที่ลงทะเบียน
  const shouldBlockUser = (registrationDate?: string | Date): boolean => {
    console.log('shouldBlockUser called with:', registrationDate);

    // ถ้าไม่มีข้อมูล หรือไม่ได้เปิดใช้งาน maintenance ไม่ต้องบล็อค
    if (!data?.config?.isEnabled) {
      return false;
    }

    // ถ้าไม่ได้จำกัดเฉพาะผู้ใช้ใหม่ ให้บล็อคทุกคน
    if (!data.config.isRestrictNewUsers) {
      return true;
    }

    // ถ้าไม่มีวันที่จำกัด หรือไม่มีวันที่ลงทะเบียน ให้บล็อค
    if (!data.config.restrictAfterDate || !registrationDate) {
      return true;
    }

    // แปลงข้อมูลวันที่ให้อยู่ในรูปแบบที่ถูกต้อง

    let registrationDateStr: string | undefined;

    if (registrationDate instanceof Date) {
      registrationDateStr = registrationDate.toISOString();
    } else {
      registrationDateStr = registrationDate;
    }

    console.log('Registration date after conversion:', registrationDateStr);

    // แปลงวันที่เป็นรูปแบบ YYYY-MM-DD
    const restrictDateStr = formatDateToYMD(data.config.restrictAfterDate);
    const userRegDateStr = formatDateToYMD(registrationDateStr);

    console.log('After formatDateToYMD:', {
      restrictDateStr,
      userRegDateStr
    });

    if (!restrictDateStr || !userRegDateStr) {
      console.error('Invalid date format:', {
        restrictAfterDate: data.config.restrictAfterDate,
        registrationDate: registrationDateStr
      });

      return true; // ถ้าแปลงวันที่ไม่สำเร็จ ให้บล็อคไว้ก่อน
    }

    // ใช้การเปรียบเทียบ string เพื่อหลีกเลี่ยงปัญหาเรื่อง timezone
    console.log('Comparing dates:', {
      restrictDate: restrictDateStr,
      userRegDate: userRegDateStr,
      shouldBlock: userRegDateStr >= restrictDateStr
    });

    // ถ้าลงทะเบียนหลังวันที่จำกัด ให้บล็อค (>= เพราะรวมถึงวันที่กำหนดด้วย)
    return userRegDateStr >= restrictDateStr;
  };



  return {
    isLoading,
    error,
    data,
    isMaintenanceActive,
    shouldBlockUser,
    refetch: fetchMaintenance
  };
};

export default useMaintenance;
