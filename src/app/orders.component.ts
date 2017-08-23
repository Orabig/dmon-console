import { Component, Input, OnInit } from '@angular/core';

import { SendCommandService } from './send-command.service';
import { HostService } from './host.service';

import { Order } from './order';

@Component({
  selector: 'orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  providers: []
})

export class OrdersComponent implements OnInit {
	constructor( private sendCommandService: SendCommandService,
				private hostService: HostService) { }
	// @Input() host: Host;
	
	orders: Order[] = [];
	
	ngOnInit(): void {
	  this.sendCommandService.getOrders().subscribe( load => this.processOrder(load) );
	  this.hostService.getMessages().subscribe( load => {  
		if(load.data.cmdId){
			load.id=load.data.cmdId; // Bon ici, c'est un peu la merde, il faut que je modifie le client
		} else {
			load.id=load.data.id;
		}
		this.processOrder(load)
		} );
	}
	
	processOrder(load: any):void {
		var id = load.id;
		if (load.data && (load.data.t==='ALIVE' || load.data.t==='SERVICE'))return;
		if (id) {
			var exist = this.orders.filter(o => o.id===id);
			if (exist.length>0) {
				OrdersComponent.processExistingOrderLoad(exist[0], load);
			} else {
				this.orders.push(load);
			}
			this.orders = Object.assign( this.orders );
		} else {
			console.log("message without id",load.data.t, load);
		}
	}
	
	static processExistingOrderLoad(order: Order,load: any):void {
		if (load.data.t==='RESULT'){
			if (load.data.terminated) {
				if (load.data.killed) {
					order.state = Order.STATE_KILLED;
				} else {
					order.state = Order.STATE_DONE;
				}
			} else {
				order.state = Order.STATE_PROCESSING;
			}
		} else if (load.data.t==='ACK'){
			order.state = Order.STATE_ACK;
		} else {
			console.log("orders.component.ts :: unknown state");
			order.state = "unknown";
		}
	}
}
