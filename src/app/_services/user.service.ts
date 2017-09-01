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
	
    getAll() {
        return this.httpInterceptorService.getJson('user.php', {});
    }
	
	getKeys(): Observable<ApiKey[]> {
        return this.httpInterceptorService.getJson('get-keys.php', {});
	}
	
    delete(id: number) {
        return this.httpInterceptorService.deleteJson('user.php/'+id);
    }
}