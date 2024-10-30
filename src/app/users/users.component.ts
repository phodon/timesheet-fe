import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: any[] = []; // Mảng chứa danh sách người dùng
  roles: any[] = []
  showUserForm = false; // Biến để hiển thị/ẩn form tạo người dùng mới

  // Khởi tạo biến cho người dùng mới
  newUser: any = {
    FullName: '',
    Email: '',
    Password: '',
    ConfirmPassword: '',
    PhoneNumber: '',
    Position: '',
    Bank: '',
    BankAccount: '',
    Address: '',
    Indentify: '',
    Salary: 0,
    Sex: '',
    Role: ''
  };

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
    this.getAllRoles()
  }

  // Hàm để toggle form nhập liệu
  toggleUserForm(): void {
    this.showUserForm = !this.showUserForm;
  }

  // Hàm gọi API để lấy danh sách người dùng
  getAllUsers(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}` // Thiết lập header với access token
    });

    return this.http.get<any>('http://localhost:8080/api/user/getAllUsers', { headers });
  }

  getAllRoles(): void {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}`
    });

    this.http.get<any>('http://localhost:8080/api/user/getAllRoles', { headers }).subscribe(
      (response) => {
        if (response.status === 'Success') {
          this.roles = response.data;
        } else {
          console.error('Failed to fetch roles:', response);
        }
      },
      (error) => {
        console.error('Error fetching roles:', error);
      }
    );
  }

  // Hàm gọi API để tạo người dùng mới
  createUser(): void {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}` // Thiết lập header với access token
    });

    // Gọi API để tạo người dùng mới
    this.http.post<any>('http://localhost:8080/api/user/sign-up', this.newUser, { headers }).subscribe(
      (response) => {
        if (response.status === 'Success') {
          this.users.push(response.data); // Thêm người dùng mới vào danh sách
          this.showUserForm = false; // Ẩn form sau khi tạo thành công
          this.resetNewUser(); // Reset form nhập liệu
        } else {
          console.error('Failed to create user:', response);
        }
      },
      (error) => {
        console.error('Error creating user:', error);
      }
    );
  }

  // Hàm reset thông tin người dùng mới
  resetNewUser(): void {
    this.newUser = {
      FullName: '',
      Email: '',
      Password: '',
      ConfirmPassword: '',
      PhoneNumber: '',
      Position: '',
      Bank: '',
      BankAccount: '',
      Address: '',
      Indentify: '',
      Salary: 0,
      Sex: '',
      Role: ''
    };
  }
}
