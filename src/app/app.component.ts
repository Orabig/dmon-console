import { Component, OnInit } from '@angular/core';
import { Host } from './model/host';

import { HostService } from './services/host.service';
import { CentrifugeService } from './services/centrifuge.service';

@Component({
  selector: 'app-root',
  templateUrl: './templates/app.component.html',
  styleUrls: ['./templates/app.component.css'],
  providers: [CentrifugeService]
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
	  this.centrifugeService.getStates().subscribe(
		state => this.connectionState = state.state
	  );
	  this.getHosts();
	}
  getHosts(): void {
	  this.hostService.getHosts("$Group_1234abcd").subscribe(hosts => this.hosts = hosts);
	}
}
