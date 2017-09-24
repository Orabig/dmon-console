import { Injectable } from '@angular/core';
import 'rxjs/add/operator/filter';

import { SendCommandService } from './send-command.service';
import { CentrifugeService } from './centrifuge.service';

import { Order } from '../_models/comm/order';
import { Host } from '../_models/objects/host';

@Injectable()
// This service is keeping track of the sent orders, and the ones who have been acked and
// answered.
// It's useful for example to know if a RESULT message comes from this client or should be discarded
export class OrderManageService {
	constructor( private sendCommandService: SendCommandService,
				private centrifugeService: CentrifugeService) { 
	  this.sendCommandService.getOrders().subscribe( load => this.processOrder(load) );
	  this.centrifugeService.getMessages().subscribe( load => this.processMessage(load) );
	}
	
	orders: Order[] = [];
	
	processMessage(load: any):void {
		if (!this.isMessageKnown(load)) return;
		var data = load.data;
		var cmdId = data.cmdId;
		// These messages are not useful
		if (data.t==='ALIVE' || data.t==='SERVICE')return;
		var order = this.orders.filter(o => o.cmdId===cmdId)[0];
		if (data.t==='RESULT' && order['cmd']==='RUN'){
			if (data.terminated) {
				if (data.killed) {
					order.state = Order.STATE_KILLED;
				} else {
					order.state = Order.STATE_DONE;
				}
			} else {
				order.state = Order.STATE_PROCESSING;
			}
		} else if (data.t==='UNREGISTERED' && order['cmd']==='UNREGISTER'){
			order.state = Order.STATE_DONE;
		} else if (data.t==='REGISTERED' && order['cmd']==='REGISTER'){
			order.state = Order.STATE_DONE;
		} else if (data.t==='ACK'){
			order.state = Order.STATE_ACK;
		} else {
			console.error("orders-manage.service :: unknown message state");
			console.error("ORDER=",order,"       load.data=",data);
			order.state = "unknown";
		}
	}
	
	processOrder(load: any):void {
		this.orders.push(load);
		this.orders = Object.assign( this.orders );
	}
	
	// Returns true if this message is already known (thus an order of the
	// same id has been sent)
	isMessageKnown(msg: any) {
		var cmdId = msg.data.cmdId;
		return this.orders.filter(o => o.cmdId===cmdId).length>0;
	}
	
	// Returns true if we should process this message. False means that it's a RESULT message from a command
	// that was emitter by another client
	shouldMessageBeProcessed(msg: any) {
		if (msg.data['t']!='RESULT') return true;
		return this.isMessageKnown(msg);
	}
	
	// Not used : may be used to kill an order
	killOrder(order: Order) {
		var host =new Host();
		host.name = order['host-id'];
		host.client = order['client-id'];
		this.sendCommandService.sendKillOrder(host, order.cmdId);
	}	
}
