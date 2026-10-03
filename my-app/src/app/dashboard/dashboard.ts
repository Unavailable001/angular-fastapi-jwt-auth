import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';


interface UserInfo {
  id: number;
  email: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  myInfo = signal<UserInfo | null>(null);
  name = signal<string | null>(null);


  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit() {
    this.authService.getUserInfo().subscribe({
      next: (userInfo) => {
        console.log('User info:', userInfo);
        this.name.set(userInfo.email.split('@')[0].toUpperCase());
        this.myInfo.set(userInfo);
      },
      error: (error) => {
        console.error('Error fetching user info:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.name.set(null);
    this.myInfo.set(null);
    window.location.href = '/login';
  }
}
