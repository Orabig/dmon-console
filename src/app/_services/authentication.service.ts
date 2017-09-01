import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

import { environment } from '../../environments/environment';
import { HttpInterceptorService } from './http-interceptor.service';

@Injectable()
export class AuthenticationService {
    constructor(private httpInterceptorService: HttpInterceptorService, 
			private http: Http) { }

    login(userName: string, password: string) {
        return this.httpInterceptorService.postJson('login.php', {userName: userName, password: password})
            .map(this.validateUser);
    }

    loginAs(id: number) {
        return this.httpInterceptorService.getJson('login.php', {id:id})
			.map(this.validateUser);
    }
	
	validateUser(user: any) : any{
		if (user && user.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }
        return user;
	}

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
    }
}