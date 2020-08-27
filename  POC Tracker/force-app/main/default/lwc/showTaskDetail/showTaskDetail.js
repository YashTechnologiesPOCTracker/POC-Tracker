import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/pubsub';

export default class ShowTaskDetail extends LightningElement {
    @wire(CurrentPageReference) pageRef;
    recordId;
    showTask = false;

    connectedCallback() {
        registerListener('detailTaskListEvent', this.handler, this)
    }

    handler(payload) {
        this.recordId = payload;
        this.showTask = true;
        console.log("handle task Id - " + this.recordId);

    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    closeModal() {
        this.showTask = false;
    }
}