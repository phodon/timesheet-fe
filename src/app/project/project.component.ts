import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

interface User {
  Id: number;
  FullName: string;
}

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})

export class ProjectComponent {
  newProject: any = {
    ProjectName: '',
    ClientName: '',
    Description: ''
  };
  showProjectForm = false;
  projects: any[] = []; // Danh sách project sau khi tạo thành công
  searchError: boolean = false;
  searchResults: any[] = []; 
  searchProjectName: string = '';
  detailedProject: any = null; // Lưu thông tin chi tiết của dự án
  showDetailsModal: boolean = false; // Điều khiển hiển thị modal chi tiết
  selectedProject: any = null;

  showAddBox: boolean = false;
  showRemoveBox: boolean = false;
  selectedUserToAdd: string = '';
  selectedUserToRemove: string = '';
  projectMembers: any[] = []; // Load members of the selected project
  users: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getAllProjects();
  }

  toggleProjectForm() {
    this.showProjectForm = !this.showProjectForm;
  }

  closeModal() {
    this.showProjectForm= false; // Ẩn modal
    this.newProject = {}; 
  }

  resetNewProject() {
    this.newProject = {
      ProjectName: '',
      ClientName: '',
      Description: ''
    };
  }

  createProject() {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}` // Thêm token vào header
    });

    this.http.post<any>('http://localhost:8080/api/project/createProject', this.newProject, { headers }).subscribe(
      (response) => {
        if (response.status === 'Success') {
          this.projects.push(response.data); // Thêm project mới vào danh sách
          this.showProjectForm = false; // Ẩn form sau khi tạo thành công
          this.resetNewProject(); // Reset form nhập liệu
        } else {
          console.error('Failed to create project:', response);
        }
      },
      (error) => {
        console.error('Error creating project:', error);
      }
    );
  }

  searchProjectByName() {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}`
    });
    console.log(this.searchProjectName);

    if (this.searchProjectName.trim()) {
      this.http.post<any>('http://localhost:8080/api/project/searchProjectByName', { name: this.searchProjectName }, {headers})
        .subscribe(
          (response) => {
            if (response.status === 'Success') {
              this.searchResults = response.data; // Cập nhật danh sách dự án tìm được
              console.log(this.searchResults);
            } else {
              this.searchError = true;
            }
          },
          (error) => {
            console.error('Error searching projects:', error);
            this.searchError = true;
          }
        );
    } else {
      this.searchResults = this.projects; // Nếu không nhập tên tìm kiếm, hiển thị tất cả dự án
    }
  } 

  getAllProjects() {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}` // Thêm token vào header
    });

    this.http.get<any>('http://localhost:8080/api/project/getAllProject', { headers })
      .subscribe(
        (response) => {
          if (response.status === 'Success') {
            this.projects = response.data;
          } else {
            this.searchError = true;
          }
        },
        (error) => {
          console.error('Error fetching projects:', error);
          this.searchError = true;
        }
      );
  }

  viewProjectDetails(projectId: number) {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'token': `Bearer ${accessToken}`
    });
  
    this.http.get<any>(`http://localhost:8080/api/project/getProjectByProjectId/${projectId}`, { headers })
      .subscribe(
        (response) => {
          if (response.status === 'Success') {
            this.detailedProject = response.data; // Lưu dữ liệu dự án vào biến
            console.log(this.detailedProject);
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

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.detailedProject = null;
  }

  updateProject(): void {
    if (!this.detailedProject) return;
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'token': `Bearer ${accessToken}`
    });
  
    this.http.put<any>(`http://localhost:8080/api/project/updateProject/${this.detailedProject.Id}`, this.detailedProject, { headers })
      .subscribe(
        (response) => {
          if (response.status === 'Success') {
            this.getAllProjects(); // Lấy lại danh sách dự án sau khi cập nhật thành công
            this.closeDetailsModal(); // Đóng modal sau khi cập nhật
          } else {
            console.error('Failed to update project:', response);
          }
        },
        (error) => {
          console.error('Error updating project:', error);
        }
      );
  }

  openAddBox(project: any, event: Event): void {
      event.stopPropagation(); // Prevent triggering row click
      this.selectedProject = project;
      this.showAddBox = true;
    
      const accessToken = localStorage.getItem('accessToken'); // Lấy token từ localStorage
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'token': `Bearer ${accessToken}`
      });
    
      const projectId = project.Id; // ID của dự án
    
      this.http.get<any>(`http://localhost:8080/api/user/getAllUserNotInProject/${projectId}`, { headers })
        .subscribe(
          (response) => {
            console.log('API Response:', response);  // Kiểm tra dữ liệu trả về
            
            if (response && response.status === 'Success' && Array.isArray(response.data)) {
              this.projectMembers = response.data.map((user: User) => ({ id: user.Id, name: user.FullName }));
              console.log(this.projectMembers);
            } else {
              console.error('Invalid response format or empty data:', response);
            }
          },
          (error) => {
            console.error('Error fetching users:', error);
          }
        );
  }

  
  // Close Add Member box
  closeAddBox(): void {
    this.showAddBox = false;
  }
  
  // Open Remove Member box
  openRemoveBox(project: any, event: Event): void {
    event.stopPropagation(); // Ngăn sự kiện click trên hàng
    this.selectedProject = project;
    this.showRemoveBox = true;
  
    const accessToken = localStorage.getItem('accessToken'); // Lấy token từ localStorage
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'token': `Bearer ${accessToken}`
    });
  
    const projectId = project.Id; // ID của dự án
  
    this.http.get<any>(`http://localhost:8080/api/user/getAllUserInProject/${projectId}`, { headers })
        .subscribe(
          (response) => {
            console.log('API Response:', response);  // Kiểm tra dữ liệu trả về
            
            if (response && response.status === 'Success' && Array.isArray(response.data)) {
              this.projectMembers = response.data.map((user: User) => ({ id: user.Id, name: user.FullName }));
              console.log(this.projectMembers);
            } else {
              console.error('Invalid response format or empty data:', response);
            }
          },
          (error) => {
            console.error('Error fetching users:', error);
          }
        );
  }
  
  // Close Remove Member box
  closeRemoveBox(): void {
    this.showRemoveBox = false;
  }
  
  // Add Member
  addMember(): void {
    if (this.selectedUserToAdd) {
      const accessToken = localStorage.getItem('accessToken'); // Lấy token từ localStorage
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'token': `Bearer ${accessToken}`
      });
  
      const body = {
        projectId: this.selectedProject.Id,
        userId: this.selectedUserToAdd,
      };
  
      this.http.post<any>(`http://localhost:8080/api/project/addUsersToProject`, body, { headers })
        .subscribe(
          (response) => {
            if (response.status === 'Success') {
              console.log(`User ${this.selectedUserToAdd} added to project ${this.selectedProject.ProjectName}`);
              this.closeAddBox(); // Đóng box sau khi thêm thành viên
            } else {
              console.error('Failed to add member:', response);
            }
            alert(response.message);
          },
          (error) => {
            console.error('Error adding user:', error);
          }
        );
    }
  }
  
  // Remove Member
  removeMember(): void {
    if (this.selectedUserToRemove) {
      const accessToken = localStorage.getItem('accessToken'); // Lấy token từ localStorage
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'token': `Bearer ${accessToken}`
      });
  
      const body = {
        projectId: this.selectedProject.Id,
        userId: this.selectedUserToRemove,
      };
  
      this.http.post<any>(`http://localhost:8080/api/project/removeUsersToProject`, body, { headers })
        .subscribe(
          (response) => {
            if (response.status === 'Success') {
              console.log(`User ${this.selectedUserToRemove} removed from project ${this.selectedProject.ProjectName}`);
              this.closeRemoveBox(); // Đóng box sau khi loại bỏ thành viên
            } else {
              console.error('Failed to remove member:', response);
            }
            alert(response.message);
          },
          (error) => {
            console.error('Error removing user:', error);
          }
        );
    }

  }
}
