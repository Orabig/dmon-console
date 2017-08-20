import { Component, OnInit } from '@angular/core';
import { Host } from './host';
import { HostService } from './host.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [HostService]
})

export class AppComponent implements OnInit {
  constructor(private hostService: HostService) { }
  title = 'DMon console';
  selectedHost: Host;
  hosts: Host[];
  onSelect(host: Host): void {
	  this.selectedHost = host;
	}
  ngOnInit(): void {
	  this.getHosts();
	}
  getHosts(): void {
	  this.hostService.getHosts().then(hosts => this.hosts = hosts);
	}
}
