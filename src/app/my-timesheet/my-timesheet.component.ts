import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { getMonday, getSunday, getDayName, formatDate } from '../utils/date-utils';
import { DatePipe } from '@angular/common';
import { CheckinComponent } from '../checkin/checkin.component';
import { AttendanceComponent } from '../attendance/attendance.component';

@Component({
  selector: 'app-my-timesheet',
  standalone: true,
  imports: [CommonModule, FormsModule, CheckinComponent, AttendanceComponent],
  templateUrl: './my-timesheet.component.html',
  providers: [DatePipe],
  styleUrls: ['./my-timesheet.component.css'] // Đã sửa từ styleUrl thành styleUrls
})
export class MyTimesheetComponent {
    today: Date = new Date(); // Ngày hiện tại
    selectedDate: Date = new Date(); // Ngày được chọn ban đầu là ngày hiện tại
    selectedDay: string = getDayName(this.today);
    daysOfWeek: { date: Date; dayName: string }[] = [];
    showDailyForm: boolean = false;
    newDaily: any = { 
      WorkingTime: 0,
      Content: '',
      Project: '', // Thêm thuộc tính Project vào newDaily
    }
    projects: any[] = []; // Mảng chứa danh sách dự án
    dailyEntries: any[] = [];
    weeklyTotalHours: string = ''; 
    checkInTime: string | null = null; // Lưu thời gian check-in
    checkOutTime: string | null = null; 

    constructor(private http: HttpClient, private datePipe: DatePipe) {
      this.updateDaysOfWeek();
      this.fetchProjects(); // Gọi fetchProjects để lấy danh sách dự án khi khởi tạo
      this.fetchDailyEntriesByTimeRange(); 
      this.fetchCheckInUser();
      this.fetchCheckOutUser();
    }

    fetchProjects(): void {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        console.error('Access token not found');
        return;
      }

      const headers = new HttpHeaders({
        'token': `Bearer ${accessToken}` // Thiết lập header với access token
      });

      this.http.get<any>('http://localhost:8080/api/project/getProjectByUserId', { headers }) // Sử dụng any cho phản hồi
        .subscribe(
          (response) => {
            if (response.status === 'Success') {
              this.projects = response.data; // Gán danh sách dự án
            } else {
              console.error('Error fetching projects:', response.message);
            }
          },
          (error) => {
            console.error('Error fetching projects:', error);
          }
        );
    }

    // Cập nhật danh sách các ngày trong tuần
    updateDaysOfWeek() {
      const startOfWeek = getMonday(this.selectedDate);

      this.daysOfWeek = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        this.daysOfWeek.push({
          date: day,
          dayName: getDayName(day)
        });
      }
    }

    // Thay đổi ngày khi nhấn vào từng ô trong bảng
    changeDate(date: Date, dayName: string) {
      this.selectedDate = date;
      this.selectedDay = dayName;
      this.fetchCheckInUser();
      this.fetchCheckOutUser();
    }

    // Điều hướng về tuần trước
    previousWeek() {
      this.selectedDate.setDate(this.selectedDate.getDate() - 7);
      this.selectedDate = getMonday(this.selectedDate);
      this.updateDaysOfWeek();
      this.fetchDailyEntriesByTimeRange();
      this.fetchCheckInUser();
      this.fetchCheckOutUser();
    }

    // Điều hướng đến tuần kế tiếp
    nextWeek() {
      this.selectedDate.setDate(this.selectedDate.getDate() + 7);
      this.selectedDate = getMonday(this.selectedDate);
      this.updateDaysOfWeek();
      this.fetchDailyEntriesByTimeRange();
      this.fetchCheckInUser();
      this.fetchCheckOutUser();
    }

    openModal() {
        this.showDailyForm = true;
    }
    
    closeModal() {
        this.showDailyForm = false;
    }
    
    addDaily(): void {
      const dailyData = {
          ProjectId: this.newDaily.Project, // Dự án đã chọn
          Content: this.newDaily.Content, // Ghi chú
          Hours: this.newDaily.WorkingTime, // Thời gian làm việc
          Date: formatDate(this.selectedDate) // Ngày đang được chọn
      };
  
      const accessToken = localStorage.getItem('accessToken');
  
      if (!accessToken) {
          console.error('Access token not found');
          return;
      }
  
      const headers = new HttpHeaders({
          'token': `Bearer ${accessToken}`, // Thiết lập header với access token
          'Content-Type': 'application/json' // Đặt Content-Type là application/json
      });
  
      this.http.post('http://localhost:8080/api/daily/createDaily', dailyData, { headers })
        .subscribe(
            (response) => {
                this.closeModal(); // Đóng modal sau khi thành công
                this.resetNewDaily(); 
                this.fetchDailyEntriesByTimeRange()
            },
            (error) => {
                console.error('Error creating daily entry:', error);
            }
        );
  }

  resetNewDaily(): void {
    this.newDaily = {
        WorkingTime: 0,
        Content: '',
        Project: '' // Khởi tạo lại Project để làm mới dropdown
    };
  }

  fetchDailyEntriesByTimeRange(): void {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('Access token not found');
      return;
    }

    const startDate = formatDate(getMonday(this.selectedDate));
    const endDate = formatDate(getSunday(this.selectedDate));
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    const body = { startDate, endDate };
    console.log(startDate, endDate)

    this.http.post<any>('http://localhost:8080/api/daily/getDailyByUser', body, { headers })
      .subscribe(
        (response) => {
          if (response.status === 'Success') {
            this.dailyEntries = response.data; // Gán danh sách daily entries
            this.weeklyTotalHours = this.getWeeklyTotalHours();
          } else {
            console.error('Error fetching daily entries:', response.message);
            this.weeklyTotalHours = '';
          }
        },
        (error) => {
          console.error('Error fetching daily entries:', error);
          this.weeklyTotalHours = '';
        }
      );
  }

  get selectedDailyEntry() {
    return this.dailyEntries.find(entry => entry.Date === formatDate(this.selectedDate));
  }

  getProjectName(projectId: string): string {
    const project = this.projects.find(p => p.Id === projectId);
    return project ? project.ProjectName : 'Unknown Project';
  }

  formatHours(hours: number): string {
    const h = Math.floor(hours).toString().padStart(2, '0');  // Get the whole hours, format to 2 digits
    const m = Math.round((hours % 1) * 60).toString().padStart(2, '0');  // Calculate the minutes, format to 2 digits
    return `${h}:${m}`;
  }

  getWeeklyTotalHours(): string {
    const startDate = formatDate(getMonday(this.selectedDate));
    const endDate = formatDate(getSunday(this.selectedDate));

    // Filter dailyEntries for entries within the current week's range
    const totalHours = this.dailyEntries
      .filter(entry => entry.Date >= startDate && entry.Date <= endDate)
      .reduce((sum, entry) => sum + parseFloat(entry.Hours), 0);

    return this.formatHours(totalHours);
  }

  getDailyHours(date: Date): string {
    const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    const entry = this.dailyEntries.find(d => d.Date === formattedDate);
    return entry ? this.formatHours(entry.Hours) : ''; // Display hours in HH:mm format or blank if no entry
  }

  fetchCheckInUser(): void {
    const accessToken = localStorage.getItem('accessToken');
  
    if (!accessToken) {
      console.error('Access token not found');
      return;
    }
  
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}`
    });
  
    // Lấy day, month, year từ selectedDay
    const day = this.selectedDate.getDate();
    const month = this.selectedDate.getMonth() + 1; // Tháng bắt đầu từ 0, cần +1
    const year = this.selectedDate.getFullYear();
  
    // Gọi API
    this.http
      .get<any>(`http://localhost:8080/api/checkHour/getCheckInUser`, {
        headers,
        params: { day: day.toString(), month: month.toString(), year: year.toString() }
      })
      .subscribe(
        (response) => {
          console.log(response)
          if (response.status === 'Success' && response.data[0]) {
            this.checkInTime = response.data[0].CheckIn; 
          } else {
            console.log("ok")
            this.checkInTime = null; 
          }
        },
        (error) => {
          console.error('Error fetching check-in data:', error);
        }
      );
  }

  fetchCheckOutUser(): void {
    const accessToken = localStorage.getItem('accessToken');
  
    if (!accessToken) {
      console.error('Access token not found');
      return;
    }
  
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}`
    });
  
    // Lấy day, month, year từ selectedDay
    const day = this.selectedDate.getDate();
    const month = this.selectedDate.getMonth() + 1; // Tháng bắt đầu từ 0, cần +1
    const year = this.selectedDate.getFullYear();
  
    // Gọi API
    this.http
      .get<any>(`http://localhost:8080/api/checkHour/getCheckOutUser`, {
        headers,
        params: { day: day.toString(), month: month.toString(), year: year.toString() }
      })
      .subscribe(
        (response) => {
          if (response.status === 'Success' && response.data[0]) {
            this.checkOutTime = response.data[0].CheckOut; 
          } else {
            console.log("ok")
            this.checkOutTime = null;
          }
        },
        (error) => {
          console.error('Error fetching check-out data:', error);
        }
      );
  }

  createCheckIn(): void {
    const accessToken = localStorage.getItem('accessToken');
  
    if (!accessToken) {
      console.error('Access token not found');
      return;
    }
  
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}`
    });
  
    this.http.post<any>(`http://localhost:8080/api/checkHour/createCheckIn`, {}, { headers })
      .subscribe(
        (response) => {
          if (response.status === 'Success' && response.data) {
            this.checkInTime = response.data.checkIn; 
          } else {
            console.log("Check-in failed or no data returned");
            this.checkInTime = null;
          }
        },
        (error) => {
          console.error('Error creating check-in:', error);
        }
      );
  }
  
  createCheckOut() {
    const accessToken = localStorage.getItem('accessToken');
  
    if (!accessToken) {
      console.error('Access token not found');
      return;
    }
  
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}`
    });
  
    this.http.post<any>(`http://localhost:8080/api/checkHour/createCheckOut`, {}, { headers })
      .subscribe(
        (response) => {
          if (response.status === 'Success' && response.data) {
            this.checkOutTime = response.data.checkOut; 
          } else {
            console.log("Check-in failed or no data returned");
            this.checkOutTime = null;
          }
        },
        (error) => {
          console.error('Error creating check-out:', error);
        }
      );
  }

  isToday(): boolean {
    const today = new Date();
    
    // Kiểm tra nếu hôm nay là thứ 7 (6) hoặc chủ nhật (0)
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;
  
    // Nếu hôm nay là cuối tuần, trả về false
    if (isWeekend) return false;
  
    // So sánh ngày, tháng, năm giữa selectedDate và ngày hôm nay
    return (
      this.selectedDate.getDate() === today.getDate() &&
      this.selectedDate.getMonth() === today.getMonth() &&
      this.selectedDate.getFullYear() === today.getFullYear()
    );
  }

  createAttendance(): void {
    const accessToken = localStorage.getItem('accessToken');
  
    if (!accessToken) {
      console.error('Access token not found');
      return;
    }
  
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}`
    });

  const body = { Date: this.selectedDate };

  this.http.post<any>('http://localhost:8080/api/attendance/createAttendance', body, { headers })
    .subscribe(
      (response) => {
        alert(response.message);
      },
      (error) => {
        const errorMessage = error.error?.message || 'Đã xảy ra lỗi khi tạo attendance.';
        alert(errorMessage);
        console.error('Error creating attendance:', error);
      }
    );
  }
  

}
