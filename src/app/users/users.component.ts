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
  roles: any[] = [];
  searchEmail: string = '';// Danh sách người dùng
  searchResult: any | null = null; // Kết quả tìm kiếm người dùng
  searchError: string | null = null; // Thông báo lỗi khi không tìm thấy người dùng
  showUserForm = false; // Biến để hiển thị/ẩn form tạo người dùng mới

  // Khởi tạo biến cho người dùng mới và người dùng được chọn để chỉnh sửa
  selectedUser: any = null; // Biến chứa người dùng được chọn để chỉnh sửa

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

  closeModal() {
    this.showUserForm = false; // Ẩn modal
    this.newUser = {}; // Reset thông tin người dùng mới
  }

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
    this.getAllRoles();
    this.fetchUsers();
  }

  // Hàm để toggle form nhập liệu
  toggleUserForm(): void {
      this.showUserForm = !this.showUserForm;
      if (!this.showUserForm) this.resetNewUser(); // Reset form khi ẩn
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
    this.closeModal()
  }
  searchUserByEmail() {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    const body = {
      email: this.searchEmail
    };

    this.http.post(`http://localhost:8080/api/user/getUserByEmail`, body, { headers })
      .subscribe(
        (response: any) => {
          // Nếu có người dùng trả về thì gán `users` là mảng 1 phần tử chứa người dùng tìm được
          if (response && response.data) {
            this.users = [response.data]; // Gán `users` là mảng chứa `searchResult`
            this.searchError = null;
          } else {
            // Nếu không có người dùng nào thì hiện thông báo lỗi
            this.users = []; // Reset danh sách người dùng
            this.searchError = 'Không tìm được người dùng với email đã nhập';
          }
        },
        (error) => {
          console.error('Lỗi khi gọi API:', error);
          this.users = []; // Reset danh sách người dùng
          this.searchError = 'Không tìm được người dùng với email đã nhập';
        }
      );
}

fetchUsers(): void {
  this.getAllUsers().subscribe(
    (response) => {
      if (response.status === 'Success') {
        this.users = response.data;
      } else {
        console.error('Failed to fetch users:', response);
      }
    },
    (error) => {
      console.error('Error fetching users:', error);
    }
  );
}

// Hàm để mở modal và hiển thị thông tin chi tiết người dùng
openEditModal(user: any): void {
  this.selectedUser = { ...user }; // Clone dữ liệu của người dùng để chỉnh sửa
}

// Hàm gọi API để cập nhật thông tin người dùng
updateUser(): void {
  if (!this.selectedUser) return;
  const accessToken = localStorage.getItem('accessToken');
  const headers = new HttpHeaders({
    'token': `Bearer ${accessToken}`
  });
  console.log(this.selectedUser)

  this.http.put<any>(`http://localhost:8080/api/user/updateUser/${this.selectedUser.Id}`, this.selectedUser, { headers })
    .subscribe(
      (response) => {
        if (response.status === 'Success') {
          this.fetchUsers(); // Lấy lại dữ liệu người dùng sau khi cập nhật thành công
          this.selectedUser = null; // Đóng modal sau khi cập nhật
        } else {
          console.error('Failed to update user:', response);
        }
      },
      (error) => {
        console.error('Error updating user:', error);
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
