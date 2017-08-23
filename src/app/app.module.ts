import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms'; // <-- NgModel 
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { HostComponent } from './host.component';
import { HostDetailComponent } from './host-detail.component';
import { ServiceStateComponent } from './service-state.component';

import { CentrifugeService } from './centrifuge.service';

@NgModule({
  declarations: [
    AppComponent,
	HostComponent,
	HostDetailComponent,
	ServiceStateComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [CentrifugeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
