import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth.guard';
import { MainContentComponent } from './main-content/main-content.component'; // Đảm bảo bạn đã tạo component này
export const routes: Routes = [
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] }, // Bảo vệ đường dẫn
    { path: 'login', component: LoginComponent },
    { path: 'my-info', component: MainContentComponent, canActivate: [AuthGuard] }, // Đường dẫn cho My Information
    { path: 'my-timesheet', component: MainContentComponent, canActivate: [AuthGuard] }, // Đường dẫn cho My Timesheet
    { path: 'my-request', component: MainContentComponent, canActivate: [AuthGuard] }, // Đường dẫn cho My Request
    { path: 'users', component: MainContentComponent, canActivate: [AuthGuard] }, // Đường dẫn cho Users
    { path: 'role', component: MainContentComponent, canActivate: [AuthGuard] }, // Đường dẫn cho Role
    { path: 'project', component: MainContentComponent, canActivate: [AuthGuard] }, // Đường dẫn cho Project
    { path: 'request', component: MainContentComponent, canActivate: [AuthGuard] }, // Đường dẫn cho Request
];
