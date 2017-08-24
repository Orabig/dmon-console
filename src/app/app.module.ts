import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms'; // <-- NgModel 
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { HostComponent } from './host.component';
import { OrdersComponent } from './orders.component';
import { HostDetailComponent } from './host-detail.component';
import { ServiceStateComponent } from './service-state.component';

import { CentrifugeService } from './services/centrifuge.service';
import { SendCommandService } from './services/send-command.service';
import { HostService } from './services/host.service';

@NgModule({
  declarations: [
    AppComponent,
	HostComponent,
	OrdersComponent,
	HostDetailComponent,
	ServiceStateComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [CentrifugeService,SendCommandService,HostService],
  bootstrap: [AppComponent]
})
export class AppModule { }
