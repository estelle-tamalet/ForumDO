import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PocketbaseService } from '../../services/pocketbase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  isLoading = false;

  constructor(private pb: PocketbaseService, private router: Router) {}

  login() {
    this.isLoading = true;
    this.error = '';

    this.pb.login(this.email, this.password).subscribe({
      next: res => {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('user_id', res.record.id);

        this.pb.setAuth(res.token, res.record.id);

        const appComponent = document.querySelector('app-root');
        if (appComponent) {
          Object.assign(appComponent, { isLoggedIn: true });
        }

        this.router.navigate(['/cours']).catch(err => console.error('Navigation error:', err));
        this.isLoading = false;
      },
      error: () => {
        this.error = "Échec de connexion. Vérifiez vos identifiants.";
        this.isLoading = false;
      }
    });
  }
}
