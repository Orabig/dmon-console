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
    console.log("in bus");
    this.applicationSelectedSource.next( application );
  }
}
