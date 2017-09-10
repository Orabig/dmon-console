import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/throw';
import { Injectable, EventEmitter } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';

import { AlertService } from './alert.service';

@Injectable()
export class HttpInterceptorService {
	
    constructor(private http: Http,
        private router: Router,
		private alertService: AlertService) { }
	
	getJson(url: string, load:any): Observable<any> {
		return this.http.get(environment.dmonApiRoot+url, this.jwtWithSearch( load ))
			.map(response => response.json())
			.map( data => this.filterError(data) );
	}
	
	// POST a request (with the JWT token) and returns an Observable (which MUST be subscribed to have any effect)
	postJson(url: string, load: any): Observable<any> {
		return this.http.post(environment.dmonApiRoot+url, load, this.jwt())
			.map(response => response.json())
			.map( data => this.filterError(data) );
	}  
	
	// sends a DELETE request (with the JWT token) and returns an Observable (which MUST be subscribed to have any effect)
	// containing the number of affected rows
	deleteJson(url: string, id: any): Observable<number> {
		return this.http.delete(environment.dmonApiRoot+url + '/' + id, this.jwt())
			.map((response: Response) => response.json())
			.map( data => this.filterError(data))
			.filter( data => data > 0 );
	}  
	
	// TODO : improve this with : https://stackoverflow.com/questions/35326689/how-to-catch-exception-correctly-from-http-request
	filterError(data: any): any {
		if (data===0) return data; // API returns 0 in some cases (when inserting without autoincrement ID)
    if (data && data['disconnect']) {
      // logout
      this.router.navigate(['login']);
    }
    var errorMsg = data ? data['detail'] || data['error'] : 'Integrity error'; // TODO : work on api.php to get DB error
		if (errorMsg) {			
			// We must throw an error, so that caller may treat these accordingly
			throw( errorMsg );
		}
		return data;
	}

    private jwt() {
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            let headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
            return new RequestOptions({ headers: headers });
        }
    }
	
    private jwtWithSearch(load: any) {
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            let headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
            return new RequestOptions({ headers: headers, search: load });
        }
    }
}