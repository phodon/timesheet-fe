import { Component, OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode'; 

import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  role: number | null = null;
  options: string[] = [];
  activeOption: string | null = null;

  ngOnInit(): void {
    const token = localStorage.getItem('accessToken');

    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.role = decodedToken.role;

        if (this.role === 1) {
          this.options = [ 'ADMIN' ,'Management'];
        }
      } catch (error) {
        console.error('Invalid token:', error);
      }
    } else {
      console.error('No accessToken found in localStorage');
    }
  }
  onMyInfoClick(): void {
    console.log('My Info button clicked');
    // Thực hiện điều hướng hoặc logic khác cho "My Info"
  }

  toggleSubOptions(option: string): void {
    this.activeOption = this.activeOption === option ? null : option; // Đóng nếu đã mở, ngược lại mở
  }
}
