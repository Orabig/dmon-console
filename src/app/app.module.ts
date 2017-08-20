import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms'; // <-- NgModel 
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { HostDetailComponent } from './host-detail.component';

@NgModule({
  declarations: [
    AppComponent,
	HostDetailComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
