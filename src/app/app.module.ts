import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms'; 
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { routing }        from './app.routing';

import { AlertComponent } from './_directives/index';
import { AuthGuard,AdminGuard } from './_guards/index';
import { AlertService,
		 AuthenticationService, 
		 UserService, 
		 CentrifugeService, 
		 SendCommandService, 
		 HostService, 
		 HttpInterceptorService,
		 GroupService,
		 OrderManageService		 } from './_services';

import { HomeComponent } from './home/index';
import { GroupComponent } from './page-monitor/index';
import { PageDefineComponent, ApplicationListComponent } from './page-define/index';
import { PageTemplateComponent, TechnologyListComponent, FamilyListComponent } from './page-template/index';

import { UsersComponent, ApiKeyComponent } from './users/index';

import { LoginComponent } from './login/index';
import { RegisterComponent } from './register/index';

import { HostComponent, HostDetailComponent } from './_comps/host';
import { ServiceStateComponent } from './_comps/service';
import { HeaderComponent, OrdersComponent } from './_comps';


@NgModule({
  declarations: [
    AppComponent,
    AlertComponent,
    HomeComponent,
    UsersComponent,
	ApiKeyComponent,
    GroupComponent,
    ApplicationListComponent,
    PageTemplateComponent,
    TechnologyListComponent,
    FamilyListComponent,
    PageDefineComponent,
    LoginComponent,
    RegisterComponent,
	HostComponent,
	OrdersComponent,
	HostDetailComponent,
	ServiceStateComponent,
	HeaderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing
  ],
  providers: [
        AuthGuard,
		AdminGuard,
        AlertService,
        AuthenticationService,
        UserService,
		CentrifugeService,
		SendCommandService,
		HostService,
		HttpInterceptorService,
		OrderManageService
	],
  bootstrap: [AppComponent]
})
export class AppModule { }
