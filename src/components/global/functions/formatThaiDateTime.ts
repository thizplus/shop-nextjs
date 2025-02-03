function formatThaiDateTime(dateString: string | null | undefined): string {
  // ถ้า dateString เป็น null หรือ undefined ให้คืนค่า "-"
  if (!dateString) {
    return "-";
  }

  try {
    const date = new Date(dateString);

    // ตรวจสอบว่า date เป็น valid date หรือไม่
    if (isNaN(date.getTime())) {
      return "-";
    }

    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const day = date.getDate().toString().padStart(2, '0');
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year} | ${hours}:${minutes} น.`;
  } catch (error) {
    // ถ้าเกิด error ในการแปลงวันที่ ให้คืนค่า "-"
    return "-";
  }
}

export default formatThaiDateTime;
