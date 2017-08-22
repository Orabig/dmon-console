import { Host } from './host';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

declare var Centrifuge: any;

export class CentrifugeService {
  private handler: any;
  private wsURL = 'http://centrifugo.crocoware.com:8000/connection';
  private observable: Observable<any>;
  getMessages(channel: string): Observable<any> {
	if (!this.observable) {
		this.handler = new Centrifuge({
			url: this.wsURL,
			user: 'First_User_12345',
			timestamp: "1503256116",
			info: '{"class":"console"}',
			token: "aae0cd7e7f8d0b8f178c1d577cbd7141eb2f404330479c0fb836ac990bd3003b",
			debug: "true",
			authEndpoint: "http://centrifugo.crocoware.com:9191/api/auth.php"
		});
		this.handler
			.on('connect', function(data) {
				console.log("Connected to Centrifugo");
				console.log(data);
			}).on('disconnect', function(data) {
				console.log("Disconnected from Centrifugo");
				console.log(data);
			}).on('error', function(error) {
				console.log("Error Centrifugo :");
				console.log( error );
			});

		var subscription = this.handler.subscribe(channel);
			
		subscription.on("subscribe", function(data) {
				console.log("Subscribed to '"+channel+"' :", data);
			});
		subscription.on("error", function(error) {
				console.log("Centrifugo Subscribe error :", error);
			});
			
		this.handler.connect();
	  
		this.observable = Observable.fromEvent(subscription, 'message');
	}
	return this.observable;
  }
}