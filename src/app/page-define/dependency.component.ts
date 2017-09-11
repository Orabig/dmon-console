import {Component, Input} from '@angular/core';
import {Application, Host, Composant} from '../_models/objects';
import {Technology} from '../_models/templates';
import {ObjectsDataService} from '../_services/objects-data.service';
import {BusService} from './bus.service';

/**
 * Displays the list of components for the given host and application
 */
@Component({
  selector: 'dependency',
  templateUrl: './dependency.component.html',
  styleUrls: ['./dependency.component.css'],
  providers: [ObjectsDataService]
})
export class DependencyComponent {

  application: Application;

  @Input() knownHosts: Host[];

  constructor(private busService: BusService, private objectsDataService: ObjectsDataService) {
    busService.applicationSelected$.subscribe(
      application => {
        this.application = application;
      });
    busService.uniqueNameRequest$.subscribe(
      data => this.findUniqueName(data)
    );
    busService.composantKnown$.subscribe(
      composant => this.registerComposant(composant)
    );
  }

  private knownComposants: Composant[] = [];

  registerComposant(composant: Composant) {
    this.knownComposants.push(composant);
  }

  nameExist(name: string) {
    for (let index = 0; index < this.knownComposants.length; index++) {
      let composant = this.knownComposants[index];
      if (composant.name === name) return true;
    }
    return false;
  }

  findUniqueName(data: any) {
    var baseName = data.baseName
    var uniqueName = baseName;
    if (this.nameExist(uniqueName)) {
      var inc = 2;
      do {
        uniqueName = baseName+'-'+inc;
        inc++;
      } while (this.nameExist(uniqueName))
    }
    // Sends the name to the caller
    this.busService.uniqueNameFound(uniqueName);
  }
  
  // -------- Ajout dynamique de nouveau host
  
  newHostname: string="";
  
  addHost() {
    this.objectsDataService.addHost(new Host({name: this.newHostname}))
      .subscribe(host=>{
        this.knownHosts.push(host);
        this.newHostname="";
      });
  }
  
  deleteHost(host: Host) {
    this.objectsDataService.deleteHost(host)
      .subscribe(result => this.knownHosts = this.knownHosts.filter(h => h.id !== host.id));
  }
  
}
