import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-daily',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daily.component.html',
  styleUrl: './daily.component.css'
})
export class DailyComponent implements OnInit {
  month: number | null = null;
  year: number | null = null;
  selectedProject: string | null = null;
  dailyRecords: any[] = [];
  filteredRecords: any[] = [];
  months = Array.from({ length: 12 }, (_, i) => i + 1); // [1, 2, ..., 12]
  years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i); // 10 năm gần nhất
  uniqueProjects: string[] = [];
  apiUrl = 'http://localhost:8080/api/daily/getDailyByTimeRange';
  selectedDaily: any | null = null;  // Lưu trữ thông tin chi tiết của daily đã chọn

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
      this.fetchData(); // Mặc định gọi khi load trang
  }

  fetchData(): void {
      const token = localStorage.getItem('accessToken');
      if (!token) {
          alert('Token không tồn tại');
          return;
      }

      const headers = new HttpHeaders().set('token', `Bearer ${token}`);
      const body = {
          month: this.month,
          year: this.year
      };

      this.http.post(this.apiUrl, body, { headers })
          .subscribe({
              next: (response: any) => {
                  this.dailyRecords = response.data;
                  this.filteredRecords = [...this.dailyRecords];
                  this.uniqueProjects = [...new Set(this.dailyRecords.map(record => record.ProjectName))];
              },
              error: (error) => {
                  console.error('Error:', error);
                  alert('Có lỗi xảy ra khi tải dữ liệu.');
              }
          });
  }

  filterData(): void {
      this.filteredRecords = this.dailyRecords.filter(daily => {
          const matchesMonth = this.month ? new Date(daily.Date).getMonth() + 1 === this.month : true;
          const matchesYear = this.year ? new Date(daily.Date).getFullYear() === this.year : true;
          const matchesProject = this.selectedProject ? daily.ProjectName === this.selectedProject : true;
          return matchesMonth && matchesYear && matchesProject;
      });
  }

  onMonthChange(): void {
      this.filterData();
  }

  onYearChange(): void {
      this.filterData();
  }

  // Hàm để hiển thị chi tiết khi nhấp vào một dòng
  toggleDetail(daily: any): void {
      // Nếu đã chọn rồi thì đóng lại, nếu không thì mở chi tiết
      if (this.selectedDaily === daily) {
          this.selectedDaily = null;
      } else {
          this.selectedDaily = daily;
      }
  }
  
}

