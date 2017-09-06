import { Component, OnInit, OnDestroy } from '@angular/core';
import { Host } from '../_models/objects/host';
import { User } from '../_models/users/user';

import { HostService } from '../_services/host.service';
import { CentrifugeService } from '../_services/centrifuge.service';
import { GroupService } from '../_services/group.service';

import { environment } from '../../environments/environment';

@Component({
  selector: 'group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css'],
  providers: [ GroupService ]
})

export class GroupComponent implements OnInit, OnDestroy {
	
  constructor(private hostService: HostService,
				private groupService: GroupService,
				private centrifugeService: CentrifugeService) { }
    
  selectedHost: Host;
  hosts: Host[];
  user:User;
  
  connectionState: string;
  
  onSelect(host: Host): void {
	  this.selectedHost = host;
	}
	
  ngOnInit(): void {
	  this.user = JSON.parse(localStorage.getItem('currentUser')) as User;
	  this.initCentrifuge();
	  this.getHosts();
  }
  
  ngOnDestroy(): void {
	  this.centrifugeService.disconnect();
  }
  
  initCentrifuge() {
	  var user=this.user;
	  var timestamp = (Date.now() | 0).toString();
	  var info= {
		  class:"console",
		  lastName: user.lastName,
		  // firstName: user.firstName   TODO : Attention aux caractères spéciaux !!
		  };
	  // Ask for token
	  this.hostService.getToken(user.userName,timestamp,info).subscribe( 
		// Then connect to centrifuge
		token => this.connectToCentrifuge(user.userName,timestamp,info,token)
	  );
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
	}
	
  getHosts(): void {
	  this.groupService.getGroups(this.user.organization.id)
		.subscribe(groups =>
			this.hostService.getHosts( groups['default'] )
				.subscribe(hosts => 
					this.hosts = hosts
				) 
		);
	}
}
