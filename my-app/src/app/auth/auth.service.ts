import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {

    return this.http.post(`${this.apiUrl}/auth/login`, { email: email, password: password });
    
  }
   
  register(email: string, password: string): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/auth/register`, { email, password });
  }

  getUserInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me`);
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }
  
  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

}
