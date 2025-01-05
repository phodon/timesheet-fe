import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import moment from 'moment';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-my-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-request.component.html',
  styleUrls: ['./my-request.component.css']
})
export class MyRequestComponent {
  currentYear: number;
  currentMonth: number;
  daysInMonth: Array<{ date: number; status: string; type: string | null }[]> = [];
  weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  months = Array.from({ length: 12 }, (_, i) => i + 1);
  requestData: any[] = [];
  options = [
    { value: 'di-muon', id: 1 },
    { value: 've-som', id: 2 },
    { value: 'off-sang', id: 3 },
    { value: 'off-chieu', id: 4 },
    { value: 'off-ca-ngay', id: 5 }
  ];

  showForm: boolean = false;
  selectedDay: any = null; // To store the selected day's data
  selectedStatus: string = '';
  selectedHours: number = 0;
  reason: string = '';
  hoursError: boolean = false;

  constructor(private http: HttpClient) {
    this.currentYear = moment().year();
    this.currentMonth = moment().month();
    this.generateCalendar();
    this.callGetAllRequestByUser();
  }

  generateCalendar() {
    const startOfMonth = moment([this.currentYear, this.currentMonth]).startOf('month');
    const daysInMonth = moment([this.currentYear, this.currentMonth]).daysInMonth();
    this.daysInMonth = [];

    let week = new Array(7).fill(null);
    const requestMap = this.createRequestMap();

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = startOfMonth.clone().date(day);
      const weekdayIndex = currentDay.isoWeekday() - 1;
      const dateString = currentDay.format('YYYY-MM-DD');

      week[weekdayIndex] = {
        date: currentDay.date(),
        status: requestMap[dateString]?.status || null,
        type: requestMap[dateString]?.type || null // Ensure type can be string or null
      };

      if (weekdayIndex === 6 || day === daysInMonth) {
        this.daysInMonth.push(week);
        week = new Array(7).fill(null);
      }
    }
  }

  createRequestMap() {
    const requestMap: { [key: string]: { status: string; type: string | null } } = {};
    this.requestData.forEach(request => {
      const dateKey = moment(request.Date).format('YYYY-MM-DD');
      requestMap[dateKey] = {
        status: request.Status, // Assuming Status is a string
        type: this.getTypeValue(request.Type) // Assuming TypeId corresponds to the type object
      };
    });
    return requestMap;
  }

  onDayClick(day: any) {
    this.selectedDay = day;
    this.selectedStatus = day ? day.type : '';
    this.showForm = true; // Show the form
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.selectedStatus = '';
    this.selectedHours = 0;
    this.reason = '';
    this.hoursError = false;
  }

  confirmRequest() {
    this.sendRequest();
    this.closeForm(); // Close the form after confirmation
  }

  sendRequest(): void {
    const token = localStorage.getItem('accessToken');  // Lấy token từ localStorage
    if (!token) {
      console.log('No token found!');
      return;
    }
  
    if (!this.selectedDay) {
      console.log('No day selected!');
      return;
    }
  
    const payload = {
      Date: moment([this.currentYear, this.currentMonth, this.selectedDay.date]).format('YYYY-MM-DD'), // Ensure selectedDay has a date property
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
      (response: any) => {  
        this.callGetAllRequestByUser()
        this.generateCalendar()
        this.closeForm(); // Close the form after sending
        alert(response.message)
      },
      (error: HttpErrorResponse) => {  
        console.log('Error sending request', error);
      }
    );
  }

  getDefaultHours(status: string): number {
    switch (status) {
      case 'di-muon':
      case 've-som':
        return 2; // Default hours for "Đi muộn" and "Về sớm"
      case 'off-sang':
      case 'off-chieu':
        return 4; // Default hours for "Off sáng" and "Off chiều"
      case 'off-ca-ngay':
        return 8; // Default hours for "Off cả ngày"
      default:
        return 0; // Default for no status
    }
  }

  validateHours() {
    this.hoursError = (this.selectedHours > 2) && (this.selectedStatus === 'di-muon' || this.selectedStatus === 've-som');
  }


  getTypeValue(typeId: number): string | null { // Allow returning null
    const types = [
      { value: 'Đi muộn', id: 1 },
      { value: 'Về sớm', id: 2 },
      { value: 'Off sáng', id: 3 },
      { value: 'Off chiều', id: 4 },
      { value: 'Off cả ngày', id: 5 }
    ];
    const type = types.find(t => t.id === typeId);
    return type ? type.value : null; // Return null if not found
  }

  onMonthChange(event: any) {
    this.currentMonth = +event.target.value;
    this.callGetAllRequestByUser();
    this.generateCalendar();
    
  }

  onYearChange(event: any) {
    this.currentYear = +event.target.value;
    this.callGetAllRequestByUser();
    this.generateCalendar();
  }

  callGetAllRequestByUser(): void {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('No token found!');
      return;
    }

    const payload = {
      year: this.currentYear,
      month: this.currentMonth + 1 // Adjusting for 0-based month index
    };

    const headers = new HttpHeaders({
      'token': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.post('http://localhost:8080/api/request/getAllRequestByUser', payload, { headers }).subscribe(
      (response: any) => {
        if (response.status === 'Success') {
          this.requestData = response.data;
          console.log('Request data:', this.requestData);
          this.generateCalendar(); // Regenerate calendar after fetching request data
        } else {
          console.error('Failed to create project:', response);
        }
      },
      (error: any) => {
        console.error('Error creating project:', error);
      }
    );
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'Đi muộn':
        return '#FF5733'; // Red color
      case 'Về sớm':
        return '#FFBD33'; // Yellow color
      case 'Off sáng':
        return '#75FF33'; // Light green
      case 'Off chiều':
        return '#33FF57'; // Green
      case 'Off cả ngày':
        return '#3358FF'; // Blue
      default:
        return '#ccc'; // Default color
    }
  }
}