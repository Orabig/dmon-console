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
    objectKeys = Object.keys; // Used in template
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
	  this.hostService.getHosts("$Group_1234abcd").subscribe(hosts => this.hosts = hosts);
	}
}
