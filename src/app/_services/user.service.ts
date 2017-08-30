﻿import {Observable} from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { User } from '../_models/users/index';
import { ApiKey } from '../_models/users/api-key';

import { environment } from '../../environments/environment';

import { AlertService } from './alert.service';

@Injectable()
export class UserService {
    constructor(private http: Http,
				private alertService: AlertService) { }

    create(user: User) {
        return this.http.post(environment.dmonApiRoot+'register.php', user, this.jwt())
			.map((response: Response) => response.json());
    }
	
	getKeys(): Observable<ApiKey[]> {
        return this.http.get(environment.dmonApiRoot+'get-keys.php', this.jwt())
			.map((response: Response) => response.json())
			.filter(
			data => {
				if (data['error']) {
					console.log("error on getKeys() :",data['error']);
					this.alertService.error(data['detail'] || data['error'])
					if (data['disconnect']) {
						// TODO
					}
					return false;
				}
				return true;
			}
		);
	}
	
	// --------------- ABOVE : implemented (server-side) methods
	// --------------- BELOW : unused methods
    getAll() {
        return this.http.get('/api/users', this.jwt()).map((response: Response) => response.json());
    }

    getById(id: number) {
        return this.http.get('/api/users/' + id, this.jwt()).map((response: Response) => response.json());
    }

    update(user: User) {
        return this.http.put('/api/users/' + user.id, user, this.jwt()).map((response: Response) => response.json());
    }

    delete(id: number) {
        return this.http.delete('/api/users/' + id, this.jwt()).map((response: Response) => response.json());
    }

    // private helper methods

    private jwt() {
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            let headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
            return new RequestOptions({ headers: headers });
        }
    }
}