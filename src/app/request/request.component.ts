import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css']
})
export class RequestComponent implements OnInit {
  requests: any[] = []; // Dữ liệu danh sách request
  statusFilter: string | null = null; // Giá trị bộ lọc status (null, Approvel, Pending)
  apiUrl: string = 'http://localhost:8080/api/request/getAllRequestByPM'; // URL API lấy danh sách request
  updateApiUrl: string = 'http://localhost:8080/api/request/approvelRequest'; // URL API cập nhật trạng thái

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchRequests(); // Lấy danh sách request khi component được tải
  }

  fetchRequests(): void {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('Access token is missing. Please log in.');
      return;
    }

    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}` // Sử dụng chuẩn `Authorization` header
    });

    // Xây dựng query params
    const params: any = this.statusFilter ? { status: this.statusFilter } : {};

    this.http.get<any>(this.apiUrl, { headers, params }).subscribe(
      (response) => {
        if (response.status === 'Success') {
          this.requests = response.data; // Cập nhật danh sách request
        } else {
          console.error('Failed to fetch requests:', response);
          alert('Failed to fetch requests. Please try again later.');
        }
      },
      (error) => {
        console.error('Error fetching requests:', error);
        alert('An error occurred while fetching requests.');
      }
    );
  }

  onStatusChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.statusFilter = selectElement.value || null; // Lấy giá trị từ dropdown
    this.fetchRequests(); // Gọi lại API với bộ lọc mới
  }

  onStatusClick(request: any): void {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('Access token is missing. Please log in.');
      return;
    }

    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}`
    });

    // Xác định trạng thái mới
    const newStatus = request.Status === 'Approved' ? 'Pending' : 'Approved';

    this.http.put<any>(`${this.updateApiUrl}/${request.Id}`, { Status: newStatus }, { headers }).subscribe(
      (response) => {
        if (response.status === 'Success') {
          alert('Status updated successfully!');
          this.fetchRequests(); // Làm mới danh sách request sau khi cập nhật
        } else {
          console.error('Failed to update status:', response);
          alert('Failed to update status. Please try again later.');
        }
      },
      (error) => {
        console.error('Error updating status:', error);
        alert('An error occurred while updating status.');
      }
    );
  }
}
