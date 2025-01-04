import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css'] // Corrected to 'styleUrls'
})
export class RoleComponent implements OnInit {
  newRole: any = {
    RoleName: ''
  };
  showRoleForm = false;
  roles: any[] = [];
  detailedRole: any = null; // Lưu thông tin chi tiết của dự án
  showDetailsModal: boolean = false; // Điều khiển hiển thị modal chi tiết
  selectedRole: any = null;


  createRole() {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}` // Thêm token vào header
    });

    this.http.post<any>('http://localhost:8080/api/user/createRole', this.newRole, { headers }).subscribe(
      (response) => {
        if (response.status === 'Success') {
          this.roles.push(response.data); // Thêm Role mới vào danh sách
          this.showRoleForm = false; // Ẩn form sau khi tạo thành công
          this.resetNewRole(); // Reset form nhập liệu
        } else {
          console.error('Failed to create Role:', response);
        }
      },
      (error) => {
        console.error('Error creating Role:', error);
      }
    );
  }

  toggleRoleForm() {
    this.showRoleForm = !this.showRoleForm;
  }
  closeModal() {
    this.showRoleForm = false; // Ẩn modal
    this.newRole = {};
  }
  resetNewRole() {
    this.newRole = {
      RoleName: ''
    };
  }

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
  closeDetailsModal() {
    this.showDetailsModal = false;
    this.detailedRole = null;
  }
  getAllRoles(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}`
    });

    return this.http.get<any[]>('http://localhost:8080/api/user/getAllRoles', { headers });
  }

  viewRoleDetails(roleId: number) {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}`
    });

    this.http.get<any>(`http://localhost:8080/api/user/getRoleByRoleId/${roleId}`, { headers })
      .subscribe(
        (response) => {
          if (response.status === 'Success') {
            this.detailedRole = response.data;
            console.log(this.detailedRole);
            this.showDetailsModal = true; // Hiển thị modal chi tiết
          } else {
            console.error('Failed to fetch project details:', response);
          }
        },
        (error) => {
          console.error('Error fetching project details:', error);
        }
      );
  }

  updateRole(): void {
    if (!this.detailedRole) return;
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'token': `Bearer ${accessToken}`
    });

    this.http.put<any>(`http://localhost:8080/api/user/updateRole/${this.detailedRole.Id}`, this.detailedRole, { headers })
      .subscribe(
        (response) => {
          if (response.status === 'Success') {
            this.getAllRoles().subscribe(
              (rolesResponse) => {
                if (rolesResponse.status === 'Success') {
                  this.roles = rolesResponse.data; // Cập nhật lại danh sách roles
                } else {
                  console.error('Failed to fetch roles:', rolesResponse);
                }
              },
              (error) => {
                console.error('Error fetching roles:', error);
              }
            );
            this.closeDetailsModal(); // Đóng modal sau khi cập nhật
          } else {
            console.error('Failed to update role:', response);
          }
        },
        (error) => {
          console.error('Error updating role:', error);
        }
      );
  }
}
