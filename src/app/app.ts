import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { PocketbaseService } from './services/pocketbase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Forum des cours';
  isLoggedIn = false;

  constructor(private pb: PocketbaseService) {}

  ngOnInit() {
    const storedToken = localStorage.getItem('auth_token');
    const storedUserId = localStorage.getItem('user_id');

    if (storedToken && storedUserId) {
      this.pb.setAuth(storedToken, storedUserId);
      this.isLoggedIn = true;
    }
  }
}
