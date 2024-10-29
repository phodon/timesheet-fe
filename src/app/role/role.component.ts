import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css'] // Corrected to 'styleUrls'
})
export class RoleComponent implements OnInit {

  roles: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getAllRoles().subscribe(
      (response) => {
        if (response.status === 'Success') {
          this.roles = response.data; // Lấy data từ phản hồi
        } else {
          console.error('Failed to fetch roles:', response);
        }
      },
      (error) => {
        console.error('Error fetching roles:', error);
      }
    );
  }

  getAllRoles(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}`
    });

    return this.http.get<any[]>('http://localhost:8080/api/user/getAllRoles', { headers });
  }
}
