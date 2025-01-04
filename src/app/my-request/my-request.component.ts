import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import moment from 'moment';
import { HttpClient, HttpHeaders, HttpErrorResponse  } from '@angular/common/http';

@Component({
  selector: 'app-my-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-request.component.html',
  styleUrls: ['./my-request.component.css']
})
export class MyRequestComponent {
  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  calendarDays: { day: string, isCurrentMonth: boolean, status: string, type: number }[][] = [];
  currentMonth!: number;
  currentYear!: number;
  selectedYear!: number;
  selectedMonth!: number;
  months = Array.from({ length: 12 }, (_, i) => ({ value: i, name: (i + 1).toString() }));
  years: number[] = [];
  requestData: any[] = [];
  constructor(private http: HttpClient) {}
  reason: string = '';

  // Các biến liên quan đến form
  showForm = false;
  selectedDay = '';
  selectedStatus = 'Off sáng';
  selectedHours = 4;
  hoursError = false;

  options = [
    { value: "di-muon", label: 'Đi muộn', id: 1 },
    { value: "ve-som", label: 'Về sớm', id: 2 },
    { value: "off-sang", label: 'Off sáng',  id: 3 },
    { value: "off-chieu", label: 'Off chiều', id: 4 },
    { value: "off-ca-ngay", label: 'Off cả ngày', id: 5 }
  ];

  isWeekend(day: string): boolean {
    const date = moment(day, 'YYYY-MM-DD');
    const dayOfWeek = date.day();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  // Phương thức trích xuất ngày
  extractDay(day: string): string {
    return moment(day, 'YYYY-MM-DD').format('D');
  }

  // Phương thức gửi yêu cầu
  sendRequest(): void {
    const token = localStorage.getItem('accessToken');  // Lấy token từ localStorage
    if (!token) {
      console.log('No token found!');
      return;
    }

    const payload = {
      Date: this.selectedDay,
      Hours: this.selectedHours,
      TypeId: this.options.find(option => option.value === this.selectedStatus)?.id,
      Reason: this.reason
    };

    const headers = new HttpHeaders({
      'token': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    console.log('Sending request...', payload);

    this.http.post('http://localhost:8080/api/request/createRequest', payload, { headers }).subscribe(
      (response: any) => {  // Define response type as 'any' or a specific type if you know the structure
        console.log('Request sent successfully!', response);
        // Xử lý thành công, có thể thông báo cho người dùng
        this.closeForm();
      },
      (error: HttpErrorResponse) => {  // Use HttpErrorResponse for error handling
        console.log('Error sending request', error);
        // Xử lý lỗi (ví dụ: thông báo lỗi cho người dùng)
      }
    );
  }

  // Phương thức xác thực giờ
  validateHours(): void {
    if (this.selectedStatus === 'di-muon' || this.selectedStatus === 've-som') {
      if (this.selectedHours > 2) {
        this.hoursError = true;
        return;
      }
    }
    this.hoursError = false;
  }

  ngOnInit(): void {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.selectedYear = this.currentYear;
    this.selectedMonth = this.currentMonth;
    this.generateYears();
    this.updateCalendarDay();
    this.callGetAllRequestByUser();
    this.generateCalendar();
  }

  generateYears(): void {
    for (let i = this.currentYear - 10; i <= this.currentYear + 10; i++) {
      this.years.push(i);
    }
  }

  generateCalendar(): void {
    const firstDayOfMonth = moment([this.selectedYear, this.selectedMonth]);
    const lastDayOfMonth = firstDayOfMonth.clone().endOf('month');
    const daysInMonth = lastDayOfMonth.date();
    const startDayOfWeek = firstDayOfMonth.day();
  
    let days: { day: string, isCurrentMonth: boolean, status: string, type: number }[] = [];
    const lastDayOfPrevMonth = firstDayOfMonth.clone().subtract(1, 'months').endOf('month').date();
  
    // Thêm các ngày của tháng trước vào calendarDays
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: firstDayOfMonth.clone().subtract(1, 'months').date(lastDayOfPrevMonth - i).format('YYYY-MM-DD'),
        isCurrentMonth: false,
        status: '',
        type: 0 // Gán giá trị mặc định cho type
      });
    }
  
    // Thêm các ngày của tháng hiện tại vào calendarDays
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day: firstDayOfMonth.clone().date(day).format('YYYY-MM-DD'),
        isCurrentMonth: true,
        status: '',
        type: 0 // Gán giá trị mặc định cho type
      });
    }
  
    // Thêm các ngày của tháng sau vào calendarDays nếu cần
    let nextMonthDay = 1;
    while (days.length < 35) {
      days.push({
        day: firstDayOfMonth.clone().add(1, 'months').date(nextMonthDay++).format('YYYY-MM-DD'),
        isCurrentMonth: false,
        status: '',
        type: 0 // Gán giá trị mặc định cho type
      });
    }
  
    // Cập nhật calendarDays với dữ liệu từ requestData
    this.calendarDays = [];
    this.requestData.forEach(request => {
      const requestDate = moment(request.Date).format('YYYY-MM-DD');
      
      // Duyệt qua từng ngày trong calendarDays
      for (let i = 0; i < days.length; i++) {
        console.log(days[i].day, requestDate);
        if (days[i].day === requestDate) {
          // Cập nhật status
          days[i].status = request.Status;
          
          // Cập nhật type (kiểm tra TypeId và map đến options)
          const typeOption = this.options.find(option => option.id === request.Type);
          days[i].type = typeOption ? typeOption.id : 0; // Gán giá trị mặc định cho type nếu không tìm thấy
        }
      }
    });
  
    // Chia nhỏ danh sách days thành các tuần
    for (let i = 0; i < days.length; i += 7) {
      this.calendarDays.push(days.slice(i, i + 7));
    }
  }

  onYearOrMonthChange(): void {
    this.updateCalendarDay();
    this.callGetAllRequestByUser();
    this.generateCalendar();
  }

  handleClick(day: string): void {
    const date = moment(day, 'YYYY-MM-DD');
    const dayOfWeek = date.day();
    const currentDate = moment();

    if (date.isSameOrAfter(currentDate, 'day') && dayOfWeek >= 1 && dayOfWeek <= 5) {
      this.selectedDay = day;
      this.showForm = true;
      this.selectedStatus = 'off-sang';
      this.selectedHours = this.getDefaultHours(this.selectedStatus);
      this.hoursError = false;
    }
  }

  getTypeLabel(type: number): string {
    const option = this.options.find(option => option.id === type);
    return option ? option.label : 'Unknown';
  }

  closeForm(): void {
    this.showForm = false;
    this.hoursError = false;
  }

  confirmRequest(): void {
    if (this.selectedStatus === 'di-muon' || this.selectedStatus === 've-som') {
      if (this.selectedHours > 2) {
        this.hoursError = true;
        return;
      }
    }

    this.hoursError = false;
    this.updateCalendarDay();
    this.closeForm();
    this.callGetAllRequestByUser();
    this.generateCalendar();
  }

  updateCalendarDay(): void {
    const dayIndex = this.findDayIndex(this.selectedDay);
    if (dayIndex !== -1) {
      this.calendarDays.flat()[dayIndex].status = this.selectedStatus;
    }
  }

  findDayIndex(day: string): number {
    for (let i = 0; i < this.calendarDays.length; i++) {
      const index = this.calendarDays[i].findIndex(d => d.day === day);
      if (index !== -1) {
        return i * 7 + index;
      }
    }
    return -1;
  }

  getDefaultHours(status: string): number {
    if (status === 'off-sang' || status === 'off-chieu') return 4;
    if (status === 'off-ca-ngay') return 8;
    return 0;
  }

  callGetAllRequestByUser(): void {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('No token found!');
      return;
    }

    const payload = {
        year: this.selectedYear,
        month: Number(this.selectedMonth) + 1
    };

    const headers = new HttpHeaders({
      'token': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.post('http://localhost:8080/api/request/getAllRequestByUser', payload, { headers }).subscribe(
      (response: any) => {
        this.requestData = response.data; 
        console.log('Request data:', this.requestData);
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching data:', error);
      }
    );
  }
}
