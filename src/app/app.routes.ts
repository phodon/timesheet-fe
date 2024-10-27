import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth.guard';
import { MainContentComponent } from './main-content/main-content.component';
import { MyInfoComponent } from './my-info/my-info.component';
import { MyTimesheetComponent } from './my-timesheet/my-timesheet.component';
import { MyRequestComponent } from './my-request/my-request.component';
import { UsersComponent } from './users/users.component';
import { RoleComponent } from './role/role.component';
import { ProjectComponent } from './project/project.component';
import { RequestComponent } from './request/request.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: MainContentComponent,
        children: [
          { path: 'my-info', component: MyInfoComponent },
          { path: 'my-timesheet', component: MyTimesheetComponent },
          { path: 'my-request', component: MyRequestComponent },
          { path: 'users', component: UsersComponent },
          { path: 'role', component: RoleComponent },
          { path: 'project', component: ProjectComponent },
          { path: 'request', component: RequestComponent }
        ]
      }
    ]
  },
  { path: '', redirectTo: '/home/my-info', pathMatch: 'full' }
];
