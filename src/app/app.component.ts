import { Component, OnInit } from '@angular/core';
import { Host } from './model/host';

import { HostService } from './services/host.service';
import { CentrifugeService } from './services/centrifuge.service';

@Component({
  selector: 'app-root',
  templateUrl: './templates/app.component.html',
  styleUrls: ['./templates/app.component.css'],
  providers: []
})

export class AppComponent implements OnInit {
	
  constructor(private hostService: HostService,
				private centrifugeService: CentrifugeService) { }
    
  selectedHost: Host;
  hosts: Host[];
  
  connectionState: string;
  
  onSelect(host: Host): void {
	  this.selectedHost = host;
	}
  ngOnInit(): void {
	  this.centrifugeService.connect({
		url: 'http://centrifugo.crocoware.com:8000/connection',
		user: 'First_User_12345',
		timestamp: "1503256116",
		debug: true,
		info: '{"class":"console"}',
		token: "aae0cd7e7f8d0b8f178c1d577cbd7141eb2f404330479c0fb836ac990bd3003b",
		authEndpoint: "http://centrifugo.crocoware.com:9191/api/auth.php"
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
