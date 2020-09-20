import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import Program from '@salesforce/schema/Tracker__c.Program__c';
import subProgram from '@salesforce/schema/Tracker__c.SubProgarms__c';



const fields = [Program, subProgram];


export default class EditSubTask extends LightningElement {
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
        // get progress() {
        //     let a = getFieldValue(this.tracker.data, Progress);
        //     console.log('AAAAAAAAAAAAAAAAAAAAA ' + a);
        // }

    progressOnChange(event) {
        this.progress = event.target.value;
        //this.userEnteredProgressValue = event.target.value;
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