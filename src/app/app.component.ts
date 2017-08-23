import { Component, OnInit } from '@angular/core';
import { Host } from './host';
import { HostService } from './host.service';
import { CentrifugeService } from './centrifuge.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [HostService, CentrifugeService]
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
