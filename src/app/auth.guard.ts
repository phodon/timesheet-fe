import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    // Kiểm tra nếu đang chạy trên trình duyệt
    if (typeof window !== 'undefined' && localStorage) {
      const accessToken = localStorage.getItem('accessToken');
    
      if (accessToken) {
        // Nếu có accessToken, cho phép truy cập
        return true;
      } else {
        // Nếu không có accessToken, điều hướng về trang đăng nhập
        this.router.navigate(['/login']);
        return false;
      }
    }

    // Nếu không phải trên trình duyệt, từ chối truy cập
    return false;
  }
}
