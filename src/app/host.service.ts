import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Host } from './host';

@Injectable()
export class HostService {
  private apiURL = 'http://centrifugo.crocoware.com:9191/api/get-group-members.php';
  constructor(private http: Http) {}
  
	getHosts(): Promise<Host[]> {
		return this.http.get(this.apiURL)
		  .toPromise()
		  .then(response => response.json() as Host[])
		  .catch(this.handleError);
	}
  
	private handleError(error: any): Promise<any> {
		console.error('An error occurred', error); // for demo purposes only
		return Promise.reject(error.message || error);
	}
}