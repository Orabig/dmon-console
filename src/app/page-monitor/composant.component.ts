import {Component, OnInit, Input} from '@angular/core';
import {Application, Host, Composant} from '../_models/objects';
import { ObjectsDataService } from '../_services/objects-data.service';

@Component({
  selector: 'monitor-composant',
  templateUrl: './composant.component.html',
  styleUrls: ['./composant.component.css']
})
export class ComposantComponent implements OnInit {

  @Input() host: Host;
  @Input() application: Application;
  
  composants: Composant[];

  constructor(private objectsService: ObjectsDataService) {
  }


  ngOnInit() {
    this.objectsService.getAllComponentsFor(this.host,this.application)
      .subscribe(composant => this.composants = composant);
  }

}
