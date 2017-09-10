import { Application } from '../_models/objects';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class BusService {

  // Observable sources
  private applicationSelectedSource = new Subject<Application>();
  
  // Observable streams
  applicationSelected$ = this.applicationSelectedSource.asObservable();
  
  // Service commands
  applicationselected(application: Application) {
    this.applicationSelectedSource.next( application );
  }
  
  // When the 'composant-list.comp' receives an order to create a new composent, it must find a new UNIQUE name for it
  // It then sends a findUniqueName message to the bus, which sends this to uniqueNameRequest stream
  // the 'dependency.comp' listens for this, then finds a new name (because it knows all the hosts) and sends a foundUniqueName
  // message to the bus, which sends it to the uniqueNameFound stream which was listened by the initial component. 
}
