import { LightningElement, api, wire, track } from "lwc";
import { CurrentPageReference, NavigationMixin } from "lightning/navigation";
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { updateRecord } from "lightning/uiRecordApi";
import ID_FIELD from "@salesforce/schema/Tracker__c.Id";
import STATE_FIELD from "@salesforce/schema/Tracker__c.State__c";
import PROGRESS_FIELD from "@salesforce/schema/Tracker__c.Progress__c";
import IS_ESCALATED_FIELD from "@salesforce/schema/Tracker__c.isEscalated__c";
import getTask from '@salesforce/apex/taskController.getCurrentTask';
import subtasks from "@salesforce/apex/taskController.listSubTask";
import getProfile from '@salesforce/apex/taskController.getUserProfile';

// import initFiles from "@salesforce/apex/taskController.initFiles";
// import queryFiles from "@salesforce/apex/taskController.queryFiles";
// import loadFiles from "@salesforce/apex/taskController.loadFiles";

export default class ShowTaskDetail extends NavigationMixin(LightningElement) {
    @wire(CurrentPageReference) pageRef;
    profileName;
    @api recordId;
    userSubCompId;
    // competencyId;
    recordData;
    showTask = false;
    showEdit = false;
    showSubEpic = false;
    addSubEpic = false;
    showReassigForm = false;
    isDisabled = false;
    confirmation = false;
    isLead;
    title;
    state;
    progress;
    program;
    hasSubTasks = false;
    refreshData;
    Completed;
    NotCompleted;
    subName;
    compName;

    connectedCallback() {
        //this.userProfile();
        //console.log('Profile Name' + JSON.stringify(this.profileName));
        let subdata = sessionStorage.getItem('updateSubTaskList');
        // console.log('SUBDATA ' + subdata);
        if (subdata != null) {
            this.refreshPage();
        }

        this.recordData = sessionStorage.getItem('recordData');
        let recordState = JSON.parse(this.recordData);

        //  console.log('RecordData: state ' + recordState);
        this.recordId = recordState.recordId;
        this.userSubCompId = recordState.userSubCompId;
        this.subName = recordState.subName;
        this.compName = recordState.compName;
        this.getCurrentTask(this.recordId);
        // console.log('recordId: ' + this.recordId + ' userSubCompId: ' + this.userSubCompId);
        // this.getSubTask(this.recordId);
    }

    refreshPage() {
        console.log('in refresh page');
        sessionStorage.removeItem('updateSubTaskList');

        // return refreshApex(this.refreshTable);
        window.location.reload()
    }

    getCurrentTask(recId) {
        getTask({ recordId: recId })
            .then(data => {
                console.log('Data getTask ' + JSON.stringify(data));
                this.title = data.Title__c;
                this.state = data.State__c;
                this.progress = data.Progress__c;
                this.program = data.Program__c;
                this.getSubTask(this.recordId);
                if (this.state === 'Completed') {
                    this.isDisabled = true;
                } else {
                    this.isDisabled = false;
                }
                fireEvent(this.pageRef, 'programNameForProgramGeneralEpics', this.program);
                fireEvent(this.pageRef, 'refreshList', this.program);
                // fireEvent(this.pageRef, 'programNameForProgramGeneralEpicsReport', this.program);
            })
            .catch()
    }

    getSubTask(recId) {
        subtasks({ parentId: recId })
            .then(data => {
                if (Array.isArray(data) && data.length) {
                    console.log('Non-Empty Sub Task')
                    this.hasSubTasks = true;
                } else {
                    this.hasSubTasks = false;
                    console.log('Empty Sub Task')
                }
            })
            .catch(error => {
                console.log('Error ' + error.message);
            });
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
        // console.log("selectedItemValue " + selectedItemValue);
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
            fields[IS_ESCALATED_FIELD.fieldApiName] = true;
            const recordInput = { fields };
            console.log("Field " + JSON.stringify(fields));
            updateRecord(recordInput)
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: "Success",
                            message: "Escalation Notification Sent!",
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
                    message: 'Cannot send Escalation Notification for Completed Epic !',
                    variant: "error"
                })
            );
        }

    }

    onClose() {
        //console.log('this.hasSubTasks ' + this.hasSubTasks)
        if (!(this.hasSubTasks)) {
            this.closeRecordViaUpdate();
        } else if (this.hasSubTasks && this.progress === 100) {
            this.closeRecordViaUpdate();
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Error",
                    message: 'Cannot Close Epic untill all Sub Epics are Completed !',
                    variant: "error"
                })
            );
        }
    }

    closeRecordViaUpdate() {
        const fields = {};
        // console.log("Field close " + JSON.stringify(fields));
        // console.log("Field close " + this.recordId);
        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[STATE_FIELD.fieldApiName] = "Completed";
        fields[PROGRESS_FIELD.fieldApiName] = 100;
        const recordInput = { fields };
        //console.log("Field close " + JSON.stringify(fields));
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
                        title: "Epic cannot be closed",
                        message: error.body.message,
                        variant: "error"
                    })
                );
            });
    }

    handleEpicBack() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'taskList__c'
            }
        });
        sessionStorage.setItem('updateSubTaskList', 'updatefromsubdetail');
        //console.log('Back Clicked')
    }

    closeModal() {
        this.showTask = false;
        this.showReassigForm = false;
    }

    handleSubUpdate() {
        this.getCurrentTask(this.recordId);
    }
    handleShowSubEpic() {
        //console.log("handlesubshow" + JSON.stringify(this.recordData));
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
        this.template.querySelector("c-create-sub-tasks").checkConfirmationNeccessity();
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
        // this.getSubTaskForProgress()
        this.addSubEpic = false;
    }

    subListCloseHandler() {
        this.showSubEpic = false;
    }

    // subListCloseHandlerH() {
    //     this.showSubEpicH = false;
    // }

}