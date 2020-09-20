import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import Program from '@salesforce/schema/Tracker__c.Program__c';
import subProgram from '@salesforce/schema/Tracker__c.SubProgarms__c';

const fields = [Program, subProgram];

export default class EditSubEpicRowAction extends LightningElement {
    @api recordId;
    @api hasSubTasks;
    progress;


    @wire(getRecord, { recordId: '$recordId', fields })
    tracker;

    get program() {
        return getFieldValue(this.tracker.data, Program);
    }

    get subprogram() {
        return getFieldValue(this.tracker.data, subProgram);
    }

    progressOnChange(event) {
        this.progress = event.target.value;
    }

    closeModal() {
        const customEvent = new CustomEvent("closemodalevent");
        this.dispatchEvent(customEvent);
    }

    handleSuccess(event) {
        console.log("recordId" + this.recordId);
        const evt = new ShowToastEvent({
            title: "Sucess",
            message: "Epic Updated Successfully!",
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