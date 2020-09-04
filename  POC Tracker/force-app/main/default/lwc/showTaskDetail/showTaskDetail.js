import { LightningElement, api, wire, track } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { fireEvent } from 'c/pubsub';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { updateRecord } from "lightning/uiRecordApi";
import ID_FIELD from "@salesforce/schema/Tracker__c.Id";
import STATE_FIELD from "@salesforce/schema/Tracker__c.State__c";
import PROGRESS_FIELD from "@salesforce/schema/Tracker__c.Progress__c";
import IS_OVERDUE_FIELD from "@salesforce/schema/Tracker__c.isOverdue__c";
import getTask from '@salesforce/apex/taskController.getCurrentTask';
import getProfile from '@salesforce/apex/taskController.getUserProfile';

export default class ShowTaskDetail extends LightningElement {
    @wire(CurrentPageReference) pageRef;
    profileName;
    recordId;
    userSubCompId;
    // competencyId;
    recordData;
    showTask = false;
    showEdit = false;
    showSubEpic = false;
    showSubEpicH = false;
    addSubEpic = false;
    showReassigForm = false;
    isDisabled = false;
    isLead;
    state;
    progress;
    refreshData;

    connectedCallback() {
        //this.userProfile();
        //console.log('Profile Name' + JSON.stringify(this.profileName));
        //this.competencyId = recordState.competencyId;
        //this.state = recordState.state;
        this.recordData = sessionStorage.getItem('recordData');
        let recordState = JSON.parse(this.recordData);

        console.log('RecordData: state ' + recordState);
        this.recordId = recordState.recordId;
        this.userSubCompId = recordState.userSubCompId;
        this.getCurrentTask(this.recordId);
        console.log('recordId: ' + this.recordId + ' userSubCompId: ' + this.userSubCompId);
        //this.getCurrentTask(this.recordId);
    }

    //     userProfile() {
    //         getProfile().then(data => {
    //                 console.log('Data Profile' + JSON.stringify(data));
    //                 // this.profileName = data;
    //                 // console.log('Profile Name' + JSON.stringify(this.profileName));
    //                 // if (this.profileName === 'Lead') {
    //                 // this.isLead = true;
    //                 // this.recordData = sessionStorage.getItem('recordData');
    //                 // let recordState = JSON.parse(this.recordData);

    //                 // console.log('RecordData: state ' + recordState);
    //                 // this.recordId = recordState.recordId;
    //                 // this.userSubCompId = recordState.userSubCompId;
    //                 // this.getCurrentTask(this.recordId);
    //                 // } else {
    //                 // this.isLead = false;
    //                 // this.recordId = sessionStorage.getItem('rowId');
    //                 // console.log('rowId: state ' + this.recordId);
    //                 // this.getCurrentTask(this.recordId);
    //             }

    //         }).catch(error => {
    //         console.log('Error ' + error.message);
    //     });
    // }

    getCurrentTask(recId) {
        getTask({ recordId: recId })
            .then(data => {
                console.log('Data getTask ' + JSON.stringify(data));
                this.state = data.State__c;
                this.progress = data.Progress__c;
                console.log('state:' + this.state + 'progress ' + this.progress);
                if (this.state === 'Completed') {
                    this.isDisabled = true;
                } else {
                    this.isDisabled = false;
                }
            })
            .catch()
    }

    handleSelect(event) {
        const selectedItemValue = event.detail.value;
        if (selectedItemValue === "reassign") {
            this.showReassigForm = true;
        } else if (selectedItemValue === "overdue") {
            this.onOverdue();
        } else {
            this.onClose();
        }
        console.log("selectedItemValue " + selectedItemValue);
    }

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

        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
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
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Error",
                    message: 'Cannot send Overdue Notification for Completed Epic !',
                    variant: "error"
                })
            );
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

    closeModal() {
        this.showTask = false;
        this.showReassigForm = false;
    }

    handleShowSubEpic() {
        console.log("handlesubshow" + JSON.stringify(this.recordData));
        // this.showEdit = false;
        // if (this.profileName === 'Lead') {
        //     this.showSubEpicL = true;
        // } else {
        //     this.showSubEpicH = true;
        // }
        this.showSubEpic = true;
    }

    handleAddSubEpic() {
        this.addSubEpic = true;
    }

    handleEdit() {
        this.showEdit = true;
    }

    handleCloseModal() {
        this.showEdit = false;
    }

    handleUpdateTask() {
        this.showEdit = false;
        console.log('here in edit');
        this.getCurrentTask(this.recordId);
        fireEvent(this.pageRef, "updateReportChart", "Updated");
        fireEvent(this.pageRef, "updateEpicTable", "Updated");
    }

    handleCancel() {
        this.addSubEpic = false;
    }

    handleAdd() {
        console.log("Saved Success");
        fireEvent(this.pageRef, "subTaskAddedEvent", "Refresh Apex");
        this.addSubEpic = false;
    }

    subListCloseHandler() {
        this.showSubEpic = false;
    }

    // subListCloseHandlerH() {
    //     this.showSubEpicH = false;
    // }
}