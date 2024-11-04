import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-info.component.html',
  styleUrls: ['./my-info.component.css']
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
            const userId = decodedToken.id; // Đảm bảo trường 'id' đúng theo token của bạn
            console.log(userId);

            const headers = new HttpHeaders({
                'token': `Bearer ${token}`
            });

            // Call API to fetch user information
            this.http.get(`http://localhost:8080/api/user/getInfo/${userId}`, { headers }).subscribe(
                (response: any) => {
                    if (response.status === 'Success' && response.data && response.data.length > 0) {
                        console.log(response.data[0]);
                        this.userInfo = response.data[0]; // Truy cập vào phần tử đầu tiên của data
                    } else {
                        console.error('Dữ liệu không hợp lệ hoặc trống');
                    }
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

  updateUser(): void {
    if (!this.userInfo) return;

    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}`
    });

    this.http.put<any>(`http://localhost:8080/api/user/updateUser/${this.userInfo.Id}`, this.userInfo, { headers })
      .subscribe(
        (response) => {
          if (response.status === 'Success') {
            alert('Cập nhật thông tin người dùng thành công!');
            // Thực hiện các thao tác bổ sung nếu cần
          } else {
            console.error('Failed to update user:', response);
            alert('Cập nhật thông tin người dùng thất bại!');
          }
        },
        (error) => {
          console.error('Error updating user:', error);
          alert('Đã xảy ra lỗi khi cập nhật thông tin người dùng.');
        }
      );
  }
}
