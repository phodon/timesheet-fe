import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-my-timesheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-timesheet.component.html',
  styleUrls: ['./my-timesheet.component.css'] // Đã sửa từ styleUrl thành styleUrls
})
export class MyTimesheetComponent {
    today: Date = new Date(); // Ngày hiện tại
    selectedDate: Date = new Date(); // Ngày được chọn ban đầu là ngày hiện tại
    selectedDay: string = this.getDayName(this.today);
    daysOfWeek: { date: Date; dayName: string }[] = [];
    showDailyForm: boolean = false;
    newDaily: any = { 
      WorkingTime: 0,
      Content: '',
      Project: '', // Thêm thuộc tính Project vào newDaily
    }
    projects: any[] = []; // Mảng chứa danh sách dự án

    constructor(private http: HttpClient) {
      this.updateDaysOfWeek();
      this.fetchProjects(); // Gọi fetchProjects để lấy danh sách dự án khi khởi tạo
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
              console.log(this.projects)
            } else {
              console.error('Error fetching projects:', response.message);
            }
          },
          (error) => {
            console.error('Error fetching projects:', error);
          }
        );
    }

    // Hàm lấy ngày thứ Hai của tuần chứa `date`
    getMonday(date: Date): Date {
      const day = new Date(date);
      const dayOfWeek = day.getDay();
      const monday = new Date(day.setDate(day.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))); // Lùi về thứ 2 của tuần
      return monday;
    }

    // Cập nhật danh sách các ngày trong tuần
    updateDaysOfWeek() {
      const startOfWeek = this.getMonday(this.selectedDate);

      this.daysOfWeek = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        this.daysOfWeek.push({
          date: day,
          dayName: this.getDayName(day)
        });
      }
    }

    // Hàm lấy tên thứ của một ngày cụ thể
    getDayName(date: Date): string {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    }

    // Thay đổi ngày khi nhấn vào từng ô trong bảng
    changeDate(date: Date, dayName: string) {
      this.selectedDate = date;
      this.selectedDay = dayName;
    }

    // Điều hướng về tuần trước
    previousWeek() {
      this.selectedDate.setDate(this.selectedDate.getDate() - 7);
      this.selectedDate = this.getMonday(this.selectedDate);
      this.updateDaysOfWeek();
    }

    // Điều hướng đến tuần kế tiếp
    nextWeek() {
      this.selectedDate.setDate(this.selectedDate.getDate() + 7);
      this.selectedDate = this.getMonday(this.selectedDate);
      this.updateDaysOfWeek();
    }

    openModal() {
        this.showDailyForm = true;
    }
    
    closeModal() {
        this.showDailyForm = false;
    }
    
    addDaily(): void {
      console.log('Selected Project ID:', this.newDaily.Project); 
      const dailyData = {
          ProjectId: this.newDaily.Project, // Dự án đã chọn
          Content: this.newDaily.Content, // Ghi chú
          Hours: this.newDaily.WorkingTime, // Thời gian làm việc
          Date: this.formatDate(this.selectedDate) // Ngày đang được chọn
      };
      console.log(dailyData)
  
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
                console.log('Daily entry created successfully:', response);
                this.closeModal(); // Đóng modal sau khi thành công
                this.resetNewDaily(); 
            },
            (error) => {
                console.error('Error creating daily entry:', error);
            }
        );
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Thêm 1 vì tháng bắt đầu từ 0
    const day = String(date.getDate()).padStart(2, '0'); // Đảm bảo có 2 chữ số cho ngày
    return `${year}-${month}-${day}`;
  }

  resetNewDaily(): void {
    this.newDaily = {
        WorkingTime: 0,
        Content: '',
        Project: '' // Khởi tạo lại Project để làm mới dropdown
    };
  }
}
