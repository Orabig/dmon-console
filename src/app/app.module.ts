import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms'; 
import { HttpModule } from '@angular/http';

// used to create fake backend
import { fakeBackendProvider } from './_helpers/index';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { BaseRequestOptions } from '@angular/http';

import { AppComponent } from './app.component';
import { routing }        from './app.routing';

import { AlertComponent } from './_directives/index';
import { AuthGuard } from './_guards/index';
import { AlertService, AuthenticationService, UserService } from './_services/index';

import { HomeComponent } from './home/index';
import { GroupComponent } from './group/index';

import { UsersComponent } from './users/index';

import { LoginComponent } from './login/index';
import { RegisterComponent } from './register/index';

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
    AlertComponent,
    HomeComponent,
    UsersComponent,
    GroupComponent,
    LoginComponent,
    RegisterComponent,
	HostComponent,
	OrdersComponent,
	HostDetailComponent,
	ServiceStateComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing
  ],
  providers: [
          AuthGuard,
        AlertService,
        AuthenticationService,
        UserService,

        // providers used to create fake backend
        fakeBackendProvider,
        MockBackend,
        BaseRequestOptions,
		CentrifugeService,
		SendCommandService,
		HostService],
  bootstrap: [AppComponent]
})
export class AppModule { }
