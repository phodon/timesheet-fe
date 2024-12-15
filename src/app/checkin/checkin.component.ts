import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkin.component.html',
  styleUrls: ['./checkin.component.css']
})
export class CheckinComponent implements OnInit {
  selectedYear: number = new Date().getFullYear(); // Default to current year
  selectedMonth: number = new Date().getMonth() + 1; // Default to current month (1-based)
  years: number[] = [];
  months = [
    { value: 1, name: '1' },
    { value: 2, name: '2' },
    { value: 3, name: '3' },
    { value: 4, name: '4' },
    { value: 5, name: '5' },
    { value: 6, name: '6' },
    { value: 7, name: '7' },
    { value: 8, name: '8' },
    { value: 9, name: '9' },
    { value: 10, name: '10' },
    { value: 11, name: '11' },
    { value: 12, name: '12' }
  ];

  currentMonthDays: Date[] = [];
  workingTimeData: { [key: number]: { checkIn: string, checkOut: string } } = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.years = Array.from({ length: 31 }, (_, i) => 2000 + i);
    this.updateDaysInMonth();
    this.getWorkingTime(); // Fetch the working time for the default date range
  }

  updateDaysInMonth() {
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    this.currentMonthDays = Array.from(
      { length: daysInMonth },
      (_, day) => new Date(this.selectedYear, this.selectedMonth - 1, day + 1)
    );
  }

  onYearOrMonthChange() {
    this.updateDaysInMonth();
    this.getWorkingTime(); // Fetch the working time again when the month or year changes
  }

  getWorkingTime() {
    const startDate = new Date(this.selectedYear, this.selectedMonth - 1, 1); // First day of selected month
    const endDate = new Date(this.selectedYear, this.selectedMonth, 0); // Last day of selected month
    
    const formattedStartDate = this.formatDate(startDate);
    const formattedEndDate = this.formatDate(endDate);
    
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      console.error('No access token found.');
      return;
    }

    const body = {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    };
    // Make POST request to API
    this.http.post('http://localhost:8080/api/checkHour/getWorkingTime', body, {
      headers: {
        "token": `Bearer ${accessToken}`
      }
    }).subscribe(
      (response: any) => {
        console.log(response)
        this.processWorkingTimeData(response);
      },
      error => {
        console.error('Error fetching working times:', error);
      }
    );
  }

  processWorkingTimeData(response: any) {
    if (Array.isArray(response.data)) {
      this.workingTimeData = {};  // Reset dữ liệu trước khi cập nhật

      response.data.forEach((item: any) => {
        const day = new Date(item.date).getDate();  // Lấy ngày từ chuỗi date
        this.workingTimeData[day] = {
          checkIn: item.checkIn || '--:--',  // Nếu không có checkIn thì gán '--:--'
          checkOut: item.checkOut || '--:--'  // Nếu không có checkOut thì gán '--:--'
        };
      });
    } else {
      console.error("Dữ liệu không hợp lệ", response);
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensure 2-digit month
    const day = date.getDate().toString().padStart(2, '0'); // Ensure 2-digit day
    return `${year}-${month}-${day}`;
  }
}
