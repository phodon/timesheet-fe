import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MyInfoComponent } from '../my-info/my-info.component';
import { MyTimesheetComponent } from '../my-timesheet/my-timesheet.component';
import { MyRequestComponent } from '../my-request/my-request.component';
import { UsersComponent } from '../users/users.component';
import { RoleComponent } from '../role/role.component';
import { ProjectComponent } from '../project/project.component';
import { RequestComponent } from '../request/request.component';
import { SalaryComponent } from '../salary/salary.component';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [
    CommonModule, 
    MyInfoComponent,
    MyTimesheetComponent,
    MyRequestComponent,
    UsersComponent,
    RoleComponent,
    ProjectComponent,
    RequestComponent,
    SalaryComponent
  ],
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.css']
})
export class MainContentComponent implements OnInit {
  currentRoute: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
  }
}
