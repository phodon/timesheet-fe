import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import moment from 'moment';

@Component({
  selector: 'app-my-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-request.component.html',
  styleUrls: ['./my-request.component.css']
})
export class MyRequestComponent {
  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  calendarDays: { day: string, isCurrentMonth: boolean, status: string }[][] = []; // Cập nhật kiểu dữ liệu
  currentMonth!: number;
  currentYear!: number;
  selectedYear!: number;
  selectedMonth!: number;
  months = Array.from({ length: 12 }, (_, i) => ({ value: i, name: (i + 1).toString() }));
  years: number[] = [];
  
  ngOnInit(): void {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.selectedYear = this.currentYear;
    this.selectedMonth = this.currentMonth;
    this.generateYears();
    this.generateCalendar();
  }

  generateYears() {
    for (let i = this.currentYear - 10; i <= this.currentYear + 10; i++) {
      this.years.push(i);
    }
  }

  extractDay(dateString: string): number {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date string');
    }
    return date.getDate();
  }

  generateCalendar(): void {
    const firstDayOfMonth = moment([this.selectedYear, this.selectedMonth]);
    const lastDayOfMonth = firstDayOfMonth.clone().endOf('month');
    const daysInMonth = lastDayOfMonth.date();
    const startDayOfWeek = firstDayOfMonth.day();

    let days: { day: string, isCurrentMonth: boolean, status: string }[] = [];
    const lastDayOfPrevMonth = firstDayOfMonth.clone().subtract(1, 'months').endOf('month').date();

    // Add previous month's days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: firstDayOfMonth.clone().subtract(1, 'months').date(lastDayOfPrevMonth - i).format('YYYY-MM-DD'),
        isCurrentMonth: false,
        status: ''
      });
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day: firstDayOfMonth.clone().date(day).format('YYYY-MM-DD'),
        isCurrentMonth: true,
        status: ''
      });
    }

    // Add next month's days to fill the remaining cells to make a 5-week view (35 cells)
    let nextMonthDay = 1;
    while (days.length < 35) {
      days.push({
        day: firstDayOfMonth.clone().add(1, 'months').date(nextMonthDay++).format('YYYY-MM-DD'),
        isCurrentMonth: false,
        status: ''
      });
    }

    // Split days into weeks (7 days per week)
    this.calendarDays = [];
    for (let i = 0; i < days.length; i += 7) {
      this.calendarDays.push(days.slice(i, i + 7));
    }
  }

  onYearOrMonthChange(): void {
    this.generateCalendar();
  }

  isWeekend(day: string): boolean {
    const date = moment(day, 'YYYY-MM-DD');
    const dayOfWeek = date.day();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  getCurrentMonthString(): string {
    return moment([this.selectedYear, this.selectedMonth]).format('YYYY-MM');
  }

  handleClick(day: string): void {
    const date = moment(day, 'YYYY-MM-DD');
    const dayOfWeek = date.day();
    const currentDate = moment();

    // Kiểm tra ngày có phải >= ngày hiện tại và không phải cuối tuần
    if (date.isSameOrAfter(currentDate, 'day') && dayOfWeek >= 1 && dayOfWeek <= 5) {
      const dayIndex = this.findDayIndex(day);
      if (dayIndex !== -1) {
        const dayStatus = this.calendarDays.flat().find(item => item.day === day)?.status;

        const statuses = ['off-sang', 'off-chieu', 'nghi', 'di-muon', 've-som'];
        const nextStatus = statuses[(statuses.indexOf(dayStatus || 'off-sang') + 1) % statuses.length];

        // Cập nhật trạng thái của ô
        if (dayIndex !== -1) {
          this.calendarDays.flat()[dayIndex].status = nextStatus;
        }
      }
    }
  }

  // Tìm chỉ mục của ngày trong calendarDays
  findDayIndex(day: string): number {
    for (let i = 0; i < this.calendarDays.length; i++) {
      const index = this.calendarDays[i].findIndex(d => d.day === day);
      if (index !== -1) {
        return i * 7 + index;
      }
    }
    return -1;
  }

  sendRequest() {
    console.log('Send Request clicked!');
  }

}
