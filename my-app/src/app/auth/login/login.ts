import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm = new FormGroup({

    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),

    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ])

  });

  constructor(
    private authService: AuthService,private router: Router
  ) {}
  



  login() {

    if (this.loginForm.invalid) {
      return;
    }

    const email = this.loginForm.value.email!;
    const password = this.loginForm.value.password!;

    this.authService.login(email, password)
      .subscribe({

        next: (response) => {

          console.log('Login successful');

          this.authService.saveToken(response.access_token);
          
          this.router.navigate(['dashboard']);

          console.log('Token saved');


        },

        error: (error) => {

          console.log('Login failed');
          console.log(error);

        }

      });


      

  }
}
