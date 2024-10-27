import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-my-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-info.component.html',
  styleUrl: './my-info.component.css'
})

export class MyInfoComponent implements OnInit {
  userInfo: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        // Decode the token to extract the user ID
        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken.id; // Thay đổi 'id' tùy thuộc vào cấu trúc của token của bạn
        console.log(userId)
        // Call API to fetch user information
        this.http.get(`http://localhost:8080/api/user/getInfo/${userId}`).subscribe(
          (data) => {
            this.userInfo = data;
          },
          (error) => {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
          }
        );
      } catch (error) {
        console.error('Lỗi khi decode token:', error);
      }
    } else {
      console.error('Không tìm thấy access token trong localStorage');
    }
  }
}
