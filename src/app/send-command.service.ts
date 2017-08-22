import {Observable} from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

import { Host } from './host';
import { Service } from './service';

// Le service qui envoie des commandes au serveur

@Injectable()
export class SendCommandService {
  private baseApiURL = 'http://centrifugo.crocoware.com:9191/api/';
  
  constructor(private http: Http) {}
  
  headers = new Headers({
    'Content-Type': 'application/json'
  });

  postJson(url: string, data: any): Observable<Response> {
    return this.http.post(
      url,
      JSON.stringify(data),
      {headers: this.headers}
    )
  }
  
  sendCommandLine(host: Host): void {
		this.postJson(this.baseApiURL + "send-order.php",
			{
				t: 'CMD',
				// 'id': cmdId,
				'client-id': host.client, 
				'host-id': host.name,
				cmd: 'RUN',
				args:  {cmdline: host.cmdline}
			}
		).subscribe(response=>console.log(response));
  }
	
  sendUnregister(host: Host, service: Service): void {
		this.postJson(this.baseApiURL + "send-order.php",
			{
				t: 'CMD',
				// 'id': cmdId,
				'client-id': host.client, 
				'host-id': host.name,
				cmd: 'UNREGISTER',
				args:  {serviceId: service.name}
			}
		).subscribe(response=>console.log(response));
  }
	
  registerService(host: Host, name: string, cmdline: string): void {
		this.postJson(this.baseApiURL + "send-order.php",
			{
				t: 'CMD',
				// 'id': cmdId,
				'client-id': host.client, 
				'host-id': host.name,
				cmd: 'REGISTER',
				args:  {cmdline: cmdline}
			}
		).subscribe(response=>console.log(response));
  }
	
}