import { Component, OnInit } from '@angular/core';
import { Host } from '../_models/objects/index';
import { ObjectsDataService } from '../_services/index';

@Component({
  selector: 'app-page-plugin-discovery',
  templateUrl: './page-plugin-discovery.component.html',
  styleUrls: ['./page-plugin-discovery.component.css']
})
export class PagePluginDiscoveryComponent implements OnInit {

  hosts: Host[] = [];
  selectedHost: Host;

  constructor( private objectsDataService: ObjectsDataService ) {  }

  ngOnInit() {
	this.objectsDataService.getAllHosts().subscribe(
		hosts => this.hosts = hosts );
  }
  
  // Step 1 : User selects a hosts
  selectHost(host: Host) {
	this.selectedHost = host
  }
  
}
