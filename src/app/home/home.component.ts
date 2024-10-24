import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MainContentComponent } from '../main-content/main-content.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, SidebarComponent, MainContentComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
