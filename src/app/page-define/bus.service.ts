import { Application, Composant } from '../_models/objects';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class BusService {

  // ----------------------------------------------------------
  // [applicationSelected] message
  
  // Sent by the application list to tell which application has been selected by the user
  
  private applicationSelectedSource = new Subject<Application>();
  
  public applicationSelected$ = this.applicationSelectedSource.asObservable();
  
  public applicationselected(application: Application) {
    this.applicationSelectedSource.next( application );
  }
  
  // ----------------------------------------------------------
  // [composantKnown] message
  
  // Sent by the composant lists to tell about the composants known. Allows to choose an unique name
  // for a new one.
  
  private composantKnownSource = new Subject<Composant>();
  
  public composantKnown$ = this.composantKnownSource.asObservable();
  
  public composantKnown(composant: Composant) {
    this.composantKnownSource.next( composant );
  }
  
  // ----------------------------------------------------------
  // [ uniqueNameRequest ] and [ uniqueNameFound ] messages
  
  // When the 'composant-list.comp' receives an order to create a new composent, it must find a new UNIQUE name for it
  // It then sends a uniqueNameRequest message to the bus, which sends this to uniqueNameRequest$ stream
  // the 'dependency.comp' listens for this, then finds a new name (because it knows all the hosts) and sends a uniqueNameFound
  // message to the bus, which sends it to the uniqueNameFound$ stream which was listened by the initial component. 
  
  
  private uniqueNameRequestSource = new Subject<any>();
  private uniqueNameFoundSource = new Subject<string>();
  
  public uniqueNameRequest$ = this.uniqueNameRequestSource.asObservable();
  public uniqueNameFound$ = this.uniqueNameFoundSource.asObservable();
  
  public uniqueNameRequest(data: any) {
    this.uniqueNameRequestSource.next( data );
  }
  public uniqueNameFound(name: string) {
    this.uniqueNameFoundSource.next( name );
  }
  
}
