import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Import HttpClientModule và HttpClient
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule],  // Thêm HttpClientModule vào đây
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
  
      // Gọi API đăng nhập
      this.http.post<{ status: string, accessToken: string, refreshToken: string }>('http://localhost:8080/api/user/sign-in', { username, password })
        .subscribe({
          next: (response) => {
            // Lưu accessToken vào localStorage nếu đăng nhập thành công
            localStorage.setItem('accessToken', response.accessToken); // Sửa lại thành accessToken
            // Điều hướng đến trang home
            this.router.navigate(['/home']);
          },
          error: (err) => {
            // Hiển thị thông báo lỗi nếu đăng nhập thất bại
            this.errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
          }
        });
    }
  }
}
