import {Host, Application} from '../_models/objects';
import {Component, OnInit} from '@angular/core';
import {ObjectsDataService} from '../_services/objects-data.service';

@Component({
  selector: 'monitor-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

  hosts: Host[];
  applications: Application[];

  constructor(private objectsService: ObjectsDataService) {
  }

  ngOnInit() {
    this.objectsService.getAllHosts()
      .subscribe(hosts => this.hosts = hosts);
    this.objectsService.getAllApplications()
      .subscribe(applications => this.applications = applications);
  }

}
