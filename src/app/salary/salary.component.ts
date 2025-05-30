import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import emailjs from '@emailjs/browser';
emailjs.init('nsdPmH2JaqrfEPMB2');

@Component({
  selector: 'app-salary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css']
})
export class SalaryComponent {
  years: number[] = [];
  months: number[] = Array.from({ length: 12 }, (_, i) => i + 1); // [1, 2, ..., 12]
  selectedYear!: number;
  selectedMonth!: number;
  salaryData: any[] = []; // Array to store salary data

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed

    // Populate years (e.g., currentYear ± 5)
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
      this.years.push(year);
    }

    // Default to current year and previous month
    this.selectedYear = currentYear;
    this.selectedMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  }

  onYearChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedYear = parseInt(target.value, 10);
  }

  onMonthChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedMonth = parseInt(target.value, 10);
  }

  exportSalary(): void {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('Access token is missing. Please log in.');
      return;
    }

    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}` // Add token to headers
    });

    const payload = {
      year: this.selectedYear,
      month: this.selectedMonth
    };

    this.http.post<any>('http://localhost:8080/api/salaryUser/createSalaryUser', payload, { headers }).subscribe(
      (response) => {
        if (response.message === 'SalaryUser created successfully') {
          alert(`Success: ${response.message}`);
          this.salaryData = response.data; // Update the salaryData array with response data
          console.log('Salary data:', this.salaryData);
        } else {
          console.error('Failed to create salary user:', response);
          alert('Failed to export salary data.');
        }
      },
      (error) => {
        console.error('Error creating salary user:', error);
        alert('An error occurred while exporting salary data.');
      }
    );
  }

  async sendEmail(): Promise<void> {
    if (!this.salaryData || this.salaryData.length === 0) {
      alert('No salary data available. Please export salary data first.');
      return;
    }

    for (const [index, salary] of this.salaryData.entries()) {
      const templateParams = {
        to_name: salary.FullName,
        to_email: salary.Email,
        day_real: salary.DayReal,
        day_of_month: salary.DayOfMonth,
        fee: salary.Fee,
        salary: salary.Salary,
        salary_real: salary.SalaryReal,
        year: this.selectedYear, // Thêm năm
        month: this.selectedMonth, // Thêm tháng
      };

      try {
        // Đợi trước khi gửi email tiếp theo
        await new Promise((resolve) => setTimeout(resolve, index * 1000)); // 1 email mỗi giây
        const response = await emailjs.send(
          'service_ayh3ogh',
          'template_f2o2nfk',
          templateParams,
          '-5HYIwoJvMOagDdGr'
        );
        console.log(`Email sent to ${salary.Email}:`, response.status, response.text);
      } catch (error) {
        console.error(`Failed to send email to ${salary.Email}:`, error);
      }
    }

    alert('Email sending process completed.');
  }

}  