import { LightningElement, track, api, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import Client from '@salesforce/schema/Tracker__c.Client__c';



const fields = [Client];

export default class EditTask extends LightningElement {
    @api recordId;
    @api isEmpty;

    @wire(getRecord, { recordId: '$recordId', fields })
    tracker;

    get client() {
        return getFieldValue(this.tracker.data, Client);
    }


    connectedCallback() {
        console.log("recordId " + this.recordId);
        console.log("hasSubTask " + this.isEmpty);
    }
    closeModal() {
        const customEvent = new CustomEvent("closemodalevent");
        this.dispatchEvent(customEvent);
    }


    handleSuccess(event) {
        console.log("recordId" + this.recordId);
        const evt = new ShowToastEvent({
            title: "Sucess",
            message: "Task Updated Successfully!",
            variant: "success"
        });
        this.dispatchEvent(evt);

        const inputFields = this.template.querySelectorAll("lightning-input-field");
        if (inputFields) {
            inputFields.forEach((field) => {
                field.reset();
            });
        }

        const customEvent = new CustomEvent("updateevent");
        this.dispatchEvent(customEvent);
    }

}