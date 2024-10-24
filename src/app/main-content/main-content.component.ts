import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.css']
})
export class MainContentComponent {
  currentRoute: string = '';

  constructor(private route: ActivatedRoute) {
    this.route.url.subscribe(url => {
      this.currentRoute = url.join('');
      console.log('Current Route:', this.currentRoute); // Thêm log để kiểm tra
    });
  }
}
