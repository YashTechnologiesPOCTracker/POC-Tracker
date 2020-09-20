import { LightningElement, wire, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { CurrentPageReference } from 'lightning/navigation';
//import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import Program from '@salesforce/schema/Tracker__c.Program__c';
import Client from '@salesforce/schema/Tracker__c.Client__c';
//import getProfile from '@salesforce/apex/taskController.getUserProfile';


const fields = [Program, Client];

export default class CreateSubTasks extends LightningElement {
    @api parentTaskRecordId;
    @api userSubCompId;
    @api hasSubTasks;
    @wire(CurrentPageReference) pageRef;
    profileName;
    enableSubTask = false;
    @api progress;
    //allowEpicCreation = false;
    @track originalMessage;
    @track isDialogVisible = false;

    @wire(getRecord, { recordId: '$parentTaskRecordId', fields })
    tracker;

    // @wire(getProfile) getProfileData(result, error) {
    //     if (result) {
    //         console.log('result.data ' + JSON.stringify(result));
    //         this.profileName = result.data;
    //     } else if (error) {
    //         console.log('Error ' + JSON.stringify(error.message));
    //     }
    // }

    connectedCallback() {
        //registerListener("addSubTaskEvent", this.handleCallback, this);
        console.log('check ' + JSON.stringify(this.parentTaskRecordId + ' ' + this.userSubCompId));
        this.checkConfirmationNeccessity();
    }

    @api checkConfirmationNeccessity() {
        console.log('hasSubTasks ' + this.hasSubTasks);
        console.log('Progress ' + this.progress);
        if (!(this.hasSubTasks) && (this.progress !== 0)) {
            console.log('has sub tasks')
            this.isDialogVisible = true;
        } else {
            this.enableSubTask = true;
        }
    }

    handleAddSubEpicDialogue(event) {
        if (event.target.name === 'confirmModal') {
            if (event.detail !== 1) {
                if (event.detail.status === 'confirm') {
                    this.enableSubTask = true;
                }
            }
            this.isDialogVisible = false;
        } else {
            this.isDialogVisible = false;
        }
    }

    get program() {
        return getFieldValue(this.tracker.data, Program);
    }

    get client() {
        return getFieldValue(this.tracker.data, Client);
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