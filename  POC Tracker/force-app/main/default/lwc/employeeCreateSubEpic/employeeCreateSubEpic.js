import { LightningElement, wire, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import Program from '@salesforce/schema/Tracker__c.Program__c';


const fields = [Program];

export default class EmployeeCreateSubEpic extends LightningElement {
    @api parentTaskRecordId;
    @api userSubCompId;
    @api showAllowEpic
    @wire(CurrentPageReference) pageRef;

    @wire(getRecord, { recordId: '$parentTaskRecordId', fields })
    tracker;

    get program() {
        return getFieldValue(this.tracker.data, Program);
    }


    handleSuccess(event) {
        this.subTaskRecordId = event.detail.value;
        console.log("Child Record Id " + this.subTaskRecordId);
        const inputFields = this.template.querySelectorAll("lightning-input-field");
        if (inputFields) {
            inputFields.forEach((element) => {
                element.reset();
            });
        }
        this.showSuccessToast();
        console.log('before subtaskaddedevent')
            //fireEvent(this.pageRef, "subTaskAddedEvent", 'Refresh Apex');
        const customEvent = new CustomEvent("addeventsuccess");
        this.dispatchEvent(customEvent);
    }

    showSuccessToast() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: "Success",
                variant: "success",
                mode: "dismissable",
                message: "Sub-Task Created Successfully"
            })
        );
    }

    closeForm() {
        const inputFields = this.template.querySelectorAll("lightning-input-field");
        if (inputFields) {
            inputFields.forEach((element) => {
                element.reset();
            });
        }

        const customEvent = new CustomEvent("cancelevent");
        this.dispatchEvent(customEvent);

    }


    connectedCallback() {
        //registerListener("addSubTaskEvent", this.handleCallback, this);
        if (this.parentTaskRecordId && this.userSubCompId) {
            this.enableSubTask = true;
        }
        console.log('check ' + JSON.stringify(this.parentTaskRecordId + ' ' + this.userSubCompId));

        console.log('check wire - ' + this.objectInfo);

    }
}