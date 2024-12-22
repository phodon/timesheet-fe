import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

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

}
