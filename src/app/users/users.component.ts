import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: any[] = []; // Khai báo mảng chứa danh sách người dùng

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getAllUsers().subscribe(
      (response) => {
        if (response.status === 'Success') {
          this.users = response.data; // Lấy data từ phản hồi
        } else {
          console.error('Failed to fetch users:', response);
        }
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  getAllUsers(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}` // Thiết lập header với access token
    });

    return this.http.get<any>('http://localhost:8080/api/user/getAllUsers', { headers });
  }
}
