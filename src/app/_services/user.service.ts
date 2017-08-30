import {Observable} from 'rxjs/Observable';
import { Injectable } from '@angular/core';

import { User } from '../_models/users/index';
import { ApiKey } from '../_models/users/api-key';

import { HttpInterceptorService } from './http-interceptor.service';

@Injectable()
export class UserService {
    constructor(private httpInterceptorService: HttpInterceptorService) { }

    create(user: User) {
        return this.httpInterceptorService.postJson('register.php', user);
    }
	
	getKeys(): Observable<ApiKey[]> {
        return this.httpInterceptorService.getJson('get-keys.php',{});
	}
	
	// --------------- ABOVE : implemented (server-side) methods
	// --------------- BELOW : unimplemented methods (php missing)
/*
    getAll() {
        return this.http.get('/api/users', this.jwt()).map((response: Response) => response.json());
    }

    delete(id: number) {
        return this.http.delete('/api/users/' + id, this.jwt()).map((response: Response) => response.json());
    }
*/
}