// src/app/utils/date-utils.ts

// Hàm lấy ngày thứ Hai của tuần chứa `date`
export function getMonday(date: Date): Date {
    const day = new Date(date);
    const dayOfWeek = day.getDay();
    const monday = new Date(day.setDate(day.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)));
    return monday;
  }
  
  // Hàm lấy ngày Chủ nhật của tuần chứa `date`
  export function getSunday(date: Date): Date {
    const monday = getMonday(date);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return sunday;
  }
  
  // Hàm lấy tên thứ của một ngày cụ thể
  export function getDayName(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }
  
  // Hàm định dạng ngày thành chuỗi 'YYYY-MM-DD'
  export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Hàm tạo danh sách các ngày trong tháng dựa trên năm và tháng truyền vào
  export function generateDaysInMonth(year: number, month: number): Date[] {
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // số ngày trong tháng
    const days: Date[] = [];
  
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
  
    return days;
  }
  