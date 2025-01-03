import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css'],
})
export class AttendanceComponent implements OnInit {
  years: number[] = [];
  months: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;

  attendances: any[] = [];
  isDataFetched: boolean = false;
  requestIdMap: { [key: number]: string } = {
    1: 'Đi Muộn',
    2: 'Về Sớm',
    3: 'Off Sáng',
    4: 'Off Chiều',
    5: 'Off cả ngày',
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 10 }, (_, i) => currentYear - i); // 10 năm gần nhất
    // Gọi API lần đầu tiên khi component được khởi tạo
    this.fetchAttendance();
  }

  fetchAttendance() {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}`, // Thêm token vào header
    });
    const body = { year: this.selectedYear, month: this.selectedMonth };

    this.http
      .post('http://localhost:8080/api/attendance/getAttendance', body, {
        headers,
      })
      .subscribe({
        next: (response: any) => {
          this.attendances = response.attendances || [];
          console.log('Attendance data fetched successfully:', this.attendances);
          this.isDataFetched = true;
        },
        error: (err) => {
          console.error('Error fetching attendance:', err);
          this.attendances = [];
          this.isDataFetched = true;
        },
      });
  }
}
