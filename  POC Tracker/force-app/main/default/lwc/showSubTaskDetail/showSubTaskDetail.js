import { LightningElement, wire, api } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import getTask from '@salesforce/apex/taskController.getCurrentTask';
import { fireEvent } from 'c/pubsub';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { updateRecord } from "lightning/uiRecordApi";
import ID_FIELD from "@salesforce/schema/Tracker__c.Id";
import STATE_FIELD from "@salesforce/schema/Tracker__c.State__c";
import PROGRESS_FIELD from "@salesforce/schema/Tracker__c.Progress__c";
import IS_OVERDUE_FIELD from "@salesforce/schema/Tracker__c.isOverdue__c";

export default class ShowSubTaskDetail extends NavigationMixin(LightningElement) {

    @wire(CurrentPageReference) pageRef;
    //@api recordId;
    recordId;
    recordData;
    showEdit = false;
    showReassigForm = false;
    isDisabledReassign = false;
    isDisabledOverdue = false;
    isDisabledClose = false;
    state;
    progress;
    title;
    subName;
    compName;
    epic;

    connectedCallback() {
        let data = sessionStorage.getItem('subRecordData');
        let recordData = JSON.parse(data);
        this.recordId = recordData.recordId;
        this.subName = recordData.subName;
        this.compName = recordData.compName;
        this.epic = recordData.title;
        console.log('Sub task detail record Id ' + this.recordId);
        console.log('Sub name ' + this.subName);
        console.log('comp name ' + this.compName);
        this.getCurrentTask(this.recordId);
    }

    getCurrentTask(recId) {
        getTask({ recordId: recId })
            .then(data => {
                console.log('Data getTask ' + JSON.stringify(data));
                this.title = data.Title__c;
                this.state = data.State__c;
                this.progress = data.Progress__c;
                console.log('state:' + this.state + 'progress ' + this.progress);
                if (this.state === 'Completed') {
                    this.isDisabledReassign = true;
                    this.isDisabledOverdue = true;
                    this.isDisabledClose = true;
                } else {
                    this.isDisabledReassign = false;
                    this.isDisabledOverdue = false;
                    this.isDisabledClose = false;
                }
            })
            .catch()
    }

    // handleSelect(event) {
    //     const selectedItemValue = event.detail.value;
    //     if (selectedItemValue === "reassign") {
    //         this.showReassigForm = true;
    //     } else if (selectedItemValue === "overdue") {
    //         this.onOverdue();
    //     } else {
    //         this.onClose();
    //     }
    //     console.log("selectedItemValue " + selectedItemValue);
    // }

    onReassign() {
        this.showReassigForm = false;
        fireEvent(this.pageRef, "updateSubTask", "update");
        this.dispatchEvent(
            new ShowToastEvent({
                title: "Success",
                message: "Epic Reassigned Successfully!",
                variant: "Success"
            })
        );
    }

    onOverdue() {
        //this.getCurrentTask(this.recordId);
        console.log('state:' + this.state);
        if (!(this.state === 'Completed')) {
            const fields = {};
            fields[ID_FIELD.fieldApiName] = this.recordId;
            fields[IS_OVERDUE_FIELD.fieldApiName] = true;
            const recordInput = { fields };
            console.log("Field " + JSON.stringify(fields));
            updateRecord(recordInput)
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: "Success",
                            message: "Overdue Notification Sent!",
                            variant: "Info"
                        })
                    );
                    this.draftValues = [];
                })
                .catch((error) => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: "Error creating record",
                            message: error.body.message,
                            variant: "error"
                        })
                    );
                });
        }

    }

    onClose() {
        const fields = {};
        console.log("Field close " + JSON.stringify(fields));
        console.log("Field close " + this.recordId);
        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[STATE_FIELD.fieldApiName] = "Completed";
        fields[PROGRESS_FIELD.fieldApiName] = 100;
        const recordInput = { fields };
        console.log("Field close " + JSON.stringify(fields));
        updateRecord(recordInput)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Success",
                        message: "Epic Closed",
                        variant: "success"
                    })
                );
                this.draftValues = [];
                this.handleUpdateTask();
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error creating record",
                        message: error.body.message,
                        variant: "error"
                    })
                );
            });
    }

    handleUpdateTask() {
        this.showEdit = false;
        console.log('here in edit ' + this.recordId);
        this.getCurrentTask(this.recordId);
        //fireEvent(this.pageRef, "updateReportChart", "Updated");
        // fireEvent(this.pageRef, "updateEpicTable", "Updated");
    }

    handleEdit() {
        this.showEdit = true;
    }

    handleReassign() {
        if (!(this.state === 'Completed')) {
            this.showReassigForm = true;
        }
    }

    handleCloseModal() {
        this.showEdit = false;
        this.showReassigForm = false;
    }

    // closeModal() {
    //     const customEvent = new CustomEvent('closesubtaskdetail');
    //     this.dispatchEvent(customEvent);
    // }

    handleSubEpicBack() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'taskDetail__c'
            }
        });
        console.log('Back Clicked')
    }
}