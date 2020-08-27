import { LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';

export default class CreateSubTasks extends LightningElement {
    enableSubTask = false;
    parentTaskRecordId;
    userSubCompId;
    @wire(CurrentPageReference) pageRef;

    handleButtonClick() {
        this.enableSubTask = true;
    }

    handleSuccess(event) {
        // this.subTaskRecordId = event.detail.value;
        console.log("Child Record Id " + this.subTaskRecordId);
        const inputFields = this.template.querySelectorAll("lightning-input-field");
        if (inputFields) {
            inputFields.forEach((element) => {
                element.reset();
            });
        }
        this.showSuccessToast();
        this.enableSubTask = false;
        console.log('before subtaskaddedevent')
        fireEvent(this.pageRef, "subTaskAddedEvent", 'Refresh Apex');
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

    handleCancel() {
        this.enableSubTask = false;
    }

    closeForm() {
        this.enableSubTask = false;
    }

    renderedCallback() {
        registerListener("addSubTaskEvent", this.handleCallback, this);
    }

    handleCallback(detail) {
        console.log('detail callback' + JSON.stringify(detail));
        this.parentTaskRecordId = detail.recordId;
        this.userSubCompId = detail.userSubCompId;
        console.log('check ' + JSON.stringify(this.parentTaskRecordId + ' ' + this.userSubCompId));
        this.enableSubTask = true;
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }
}