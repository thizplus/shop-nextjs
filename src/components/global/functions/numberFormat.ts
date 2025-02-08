const numberFormatter = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

export const formatNumber = (value: number): string => {
  return numberFormatter.format(value);
};

// ฟังก์ชันเพิ่มเติมสำหรับจัดรูปแบบเป็นเงินบาท
export const formatCurrency = (value: number): string => {
  return `${numberFormatter.format(value)} บาท`;
};
