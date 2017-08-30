import { Component, OnInit, OnDestroy } from '@angular/core';
import { Host } from '../_models/objects/host';

import { HostService } from '../_services/host.service';
import { CentrifugeService } from '../_services/centrifuge.service';

import { environment } from '../../environments/environment';

@Component({
  selector: 'group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css'],
  providers: []
})

export class GroupComponent implements OnInit, OnDestroy {
	
  constructor(private hostService: HostService,
				private centrifugeService: CentrifugeService) { }
    
  selectedHost: Host;
  hosts: Host[];
  
  connectionState: string;
  
  onSelect(host: Host): void {
	  this.selectedHost = host;
	}
	
  ngOnInit(): void {
	  var user = 'First_User_12345';
	  var timestamp = (Date.now() | 0).toString();
	  var info= {"class":"console"};
	  // Ask for token
	  this.hostService.getToken(user,timestamp,info).subscribe( 
		// Then connect to centrifuge
		token => this.connectToCentrifuge(user,timestamp,info,token)
	  );
  }
  
  ngOnDestroy(): void {
	  this.centrifugeService.disconnect();
  }
  
  connectToCentrifuge(user:string, timestamp:string, info:any, token:string):void {
	  this.centrifugeService.connect({
		url: environment.centrifugoServerUrl,
		user: user,
		timestamp: timestamp,
		info: JSON.stringify( info ),
		token: token,
		debug: ! environment.production,
		authEndpoint: environment.centrifugoAuthEndpoint
	});
	  this.centrifugeService.getStates().subscribe(
		state => this.connectionState = state.type==='state' ? state.state : this.connectionState
	  );
	  this.getHosts();
	}
	
  getHosts(): void {
	  this.hostService.getHosts("$Group_1234abcd").subscribe(hosts => this.hosts = hosts);
	}
}
