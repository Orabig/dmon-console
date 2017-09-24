import { Component, OnInit, OnDestroy } from '@angular/core';

import { Host, Composant, Agent } from '../_models/objects';
import { User } from '../_models/users/user';

import { HostService ,
		CentrifugeService,
		GroupService,
		ObjectsDataService,
		OrderManageService		} from '../_services';

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
				private orderManageService: OrderManageService,
				private centrifugeService: CentrifugeService,
				private objectsDataService: ObjectsDataService) { }
    
  selectedHost: Host;
  hosts: Host[];
  user:User;
  private defaultGroup: string;
  
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
		state => this.setConnectionState(state)
	  );
	}

  setConnectionState(state) {
	  this.connectionState = state.type==='state' ? state.state : this.connectionState;
	  // If we were waiting for this, then connect to centrifugo Groups channel
	  this.listenToGroupWhenPossible();
  }
	
  getHosts(): void {
	  /* Ces vieux services ne donnent pas l'ID des hosts
	  
	  this.groupService.getGroups(this.user.organization.id)
		.subscribe(groups =>
			this.hostService.getHosts( groups['default'] )
				.subscribe(hosts => {
					if (this.hosts==null)
						this.downloadHostServices(hosts);
					this.hosts = hosts;
					}
				) 
		);
		*/
	  this.groupService.getGroups(this.user.organization.id)
		.subscribe(groups => {
				this.defaultGroup = groups['default'];
				// If we were waiting for this, then connect to centrifugo Groups channel
				this.listenToGroupWhenPossible();
				this.objectsDataService.getAllHosts().subscribe(hosts => {
					this.hosts = hosts.filter(host => this.hostBelongTo(host, this.defaultGroup));
					this.downloadHostServices(hosts);
					}
				) 
		});
	}
	
	// This will check if both centrifugo is connected and the name of the group is known,
	// then subscribe to the channel
	listenToGroupWhenPossible() {
		if (this.defaultGroup==null) return;
		console.log(this.connectionState);
		if (this.connectionState!="connected") return;
		this.centrifugeService.getMessagesOn('$'+this.defaultGroup)
			.subscribe(message => this.processServiceMessage(message));
	}
	
	hostBelongTo(host: Host, group): boolean {
		// TODO : groups are not used for now
		return true;
	}
	
	processServiceMessage(message) {
		if (this.orderManageService.shouldMessageBeProcessed(message))
			this.hosts = this.hostService.transformHosts(this.hosts,message);
	}
	
	getHostByName(name): Host {
		for(var i=0;i<this.hosts.length;i++) {
			if (this.hosts[i].name==name) return this.hosts[i];
		}
		return null;
	}
	
   // request the state for the hosts
   // starts by downloading the Application list (because it's needed to retrieve the component states)
   downloadHostServices(hosts: Host[]) {
	   hosts.forEach(
			host => this.objectsDataService.getAllComponentsFor(host,null)
				.subscribe(composants => this.appendComposantsToHost(host,composants))
		);
   }
   
   appendComposantsToHost(host: Host, composants: Composant[]) {
	   composants.forEach(composant => this.appendAgentsToHost(host, composant.agents));
   }
   
   appendAgentsToHost(host: Host, agents: Agent[]) {
	   if (host.services==null)host.services=[];
	   agents.forEach(agent => host.services[agent.id] = agent);
   }

}
