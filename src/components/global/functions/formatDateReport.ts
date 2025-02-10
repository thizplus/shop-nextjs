export const formatDateReport = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";

  // กรณีที่เป็นวันที่ภาษาไทยอยู่แล้ว
  if (dateString.match(/[ก-๙]/)) {
    const monthMapping: { [key: string]: string } = {
      'มกราคม': 'ม.ค.',
      'กุมภาพันธ์': 'ก.พ.',
      'มีนาคม': 'มี.ค.',
      'เมษายน': 'เม.ย.',
      'พฤษภาคม': 'พ.ค.',
      'มิถุนายน': 'มิ.ย.',
      'กรกฎาคม': 'ก.ค.',
      'สิงหาคม': 'ส.ค.',
      'กันยายน': 'ก.ย.',
      'ตุลาคม': 'ต.ค.',
      'พฤศจิกายน': 'พ.ย.',
      'ธันวาคม': 'ธ.ค.'
    };

    // แยกวันที่และเวลา
    const parts = dateString.split(' ');
    const time = parts[parts.length - 1]; // ส่วนเวลา เช่น "01:05"
    const timeFormatted = time.includes(':') ? `${time} น.` : '';

    // แยกวันที่เดือนปี
    const day = parts[0];
    const monthFull = parts[1];
    const yearFull = parts[2];

    // แปลงเดือนให้เป็นตัวย่อ
    const month = monthMapping[monthFull] || monthFull;

    // แปลงปีให้เป็นสองหลัก
    const year = yearFull.slice(-2);

    return timeFormatted ?
      `${day} ${month} ${year} ${timeFormatted}` :
      `${day} ${month} ${year}`;
  }

  // กรณีที่เป็นวันที่ในรูปแบบอื่น
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "-";

    const day = date.getDate();

    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const month = thaiMonths[date.getMonth()];
    const year = (date.getFullYear() + 543).toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year} ${hours}:${minutes} น.`;
  } catch (error) {
    return "-";
  }
};

export default formatDateReport;
