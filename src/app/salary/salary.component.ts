import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

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

  constructor(private http: HttpClient) {}

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
          this.salaryData = [
            { DayReal: 21, Fee: 100000, SalaryReal: 9900000, Email: 'nguyen.anh@domain.com', FullName: 'Nguyễn Anh Tuấn' },
            { DayReal: 21, Fee: 150000, SalaryReal: 9850000, Email: 'tran.thi@domain.com', FullName: 'Trần Thị Lan' },
            { DayReal: 21, Fee: 150000, SalaryReal: 9850000, Email: 'le.quang@domain.com', FullName: 'Lê Quang Hieu' },
            { DayReal: 21, Fee: 100000, SalaryReal: 12400000, Email: 'pham.dong@domain.com', FullName: 'Phạm Đông Tùng' },
            { DayReal: 21, Fee: 200000, SalaryReal: 14800000, Email: 'hoang.mai@domain.com', FullName: 'Hoàng Mai Lan' },
            { DayReal: 21, Fee: 50000, SalaryReal: 9500000, Email: 'vu.tuan@domain.com', FullName: 'Vũ Tuấn Anh' },
            { DayReal: 21, Fee: 100000, SalaryReal: 9900000, Email: 'nguyen.bich@domain.com', FullName: 'Nguyễn Bích Thảo' },
            { DayReal: 21, Fee: 0, SalaryReal: 10000000, Email: 'le.kim@domain.com', FullName: 'Lê Kim Dung' },
            { DayReal: 21, Fee: 200000, SalaryReal: 9800000, Email: 'tran.quyen@domain.com', FullName: 'Trần Quyên Hoa' },
            { DayReal: 21, Fee: 150000, SalaryReal: 9850000, Email: 'pham.thai@domain.com', FullName: 'Phạm Thái Nguyên' }
          ];
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
}
