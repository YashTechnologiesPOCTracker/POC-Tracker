import { LightningElement, wire, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';

export default class CreateSubTasks extends LightningElement {
    @api parentTaskRecordId;
    @api userSubCompId;
    @wire(CurrentPageReference) pageRef;


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
    }

    // handleCallback(detail) {
    //     console.log('detail callback' + JSON.stringify(detail));
    //     this.parentTaskRecordId = detail.recordId;
    //     this.userSubCompId = detail.userSubCompId;
    //     console.log('check ' + JSON.stringify(this.parentTaskRecordId + ' ' + this.userSubCompId));
    //     this.enableSubTask = true;
    // }

    // disconnectedCallback() {
    //     unregisterAllListeners(this);
    // }
}