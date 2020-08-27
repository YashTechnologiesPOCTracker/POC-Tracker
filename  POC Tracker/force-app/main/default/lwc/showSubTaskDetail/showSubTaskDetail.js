import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
export default class ShowSubTaskDetail extends LightningElement {

    @wire(CurrentPageReference) pageRef;
    recordId;
    showDetail = false;

    connectedCallback() {
        registerListener('passEventFromSubtaskList', this.handler, this)
    }

    handler(payload) {
        this.recordId = payload;
        this.showDetail = true;
        console.log("handle Id - " + this.recordId);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    closeModal() {
        this.showDetail = false;
    }
}