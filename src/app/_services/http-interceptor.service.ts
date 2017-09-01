import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import { Injectable, EventEmitter } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';

import { environment } from '../../environments/environment';

import { AlertService } from './alert.service';

@Injectable()
export class HttpInterceptorService {
	
    constructor(private http: Http, private alertService: AlertService) { }
	
	getJson(url: string, load:any): Observable<any> {
		return this.http.get(environment.dmonApiRoot+url, this.jwtWithSearch( load ))
			.map((response: Response) => response.json())
			.filter( data => this.filterError(data) );
	}
	
	postJson(url: string, load: any): Observable<any> {
		return this.http.post(environment.dmonApiRoot+url, load, this.jwt())
			.map((response: Response) => response.json())
			.filter( data => this.filterError(data) );
	}  
	
	deleteJson(url: string): Observable<any> {
		return this.http.delete(environment.dmonApiRoot+url, this.jwt())
			.map((response: Response) => response.json())
			.filter( data => this.filterError(data) );
	}  
	
	filterError(data: any): any {
		if (data['error']) {
			this.alertService.error(data['detail'] || data['error'])
			if (data['disconnect']) {
				// TODO
			}
			return false;
		}
		return true;
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