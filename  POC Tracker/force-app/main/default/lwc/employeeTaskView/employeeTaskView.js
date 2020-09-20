import { LightningElement, api, wire, track } from "lwc";
import { CurrentPageReference, NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { updateRecord } from "lightning/uiRecordApi";
import ID_FIELD from "@salesforce/schema/Tracker__c.Id";
import STATE_FIELD from "@salesforce/schema/Tracker__c.State__c";
import PROGRESS_FIELD from "@salesforce/schema/Tracker__c.Progress__c";
import IS_OVERDUE_FIELD from "@salesforce/schema/Tracker__c.isOverdue__c";
import getTask from "@salesforce/apex/taskController.getCurrentTask";
import { fireEvent } from "c/pubsub";
import subtasks from "@salesforce/apex/taskController.listSubTask";
import getSubsidiaryCompetencyDetail from '@salesforce/apex/taskController.getSubsidiaryCompitancyDetail';
// import initFiles from "@salesforce/apex/TestFinalShowTaskList.initFiles";
// import queryFiles from "@salesforce/apex/TestFinalShowTaskList.queryFiles";
// import loadFiles from "@salesforce/apex/TestFinalShowTaskList.loadFiles";

export default class EmployeeTaskView extends NavigationMixin(LightningElement) {

    @wire(CurrentPageReference) pageRef;
    showTask = false;
    showEdit = false;
    addSubEpic = false;
    showSubEpic = false;
    //isEmployee = false;
    deactivate = false;
    hasSubTasks = false;
    isEpicCreationAllowed = false;
    isTaskCompleteButton = false;
    state;
    @api progress;
    program;
    refreshData;

    @api recordId;
    subcompId;
    subName;
    compName;
    title;
    parentTitle;

    connectedCallback() {
        this.recordId = sessionStorage.getItem("recordId");
        console.log("record id - " + this.recordId);
        //this.initRecords();
        this.getCurrentTask(this.recordId);
    }

    getCurrentTask(recId) {
        getTask({ recordId: recId })
            .then((data) => {
                console.log("Data getTask " + JSON.stringify(data));
                this.state = data.State__c;
                this.title = data.Title__c;
                this.progress = data.Progress__c;
                this.program = data.Program__c;
                this.subcompId = data.Subsidiary_CompetencyId__c;
                this.isEpicCreationAllowed = data.Allow_Epic_Creation__c;
                //this.parentTitle = data.Parent_Task__r.Title__c;

                if (this.progress < 90) {
                    this.deactivate = false;
                } else {
                    this.deactivate = true;
                }
                fireEvent(this.pageRef, 'programNameForProgramGeneralEpics', this.program);
                console.log("state:" + this.state + "progress " + this.progress);
                if (this.state === "Completed") {
                    this.isDisabled = true;
                    this.isTaskCompleteButton = true;
                    console.log("Edit Button - " + this.isTaskCompleteButton);
                } else {
                    this.isDisabled = false;
                    this.isTaskCompleteButton = false;
                    console.log("Edit Button - " + this.isTaskCompleteButton);
                }
                this.getSubsidiaryCompetency(this.subcompId);
                this.getSubTask(this.recordId);
                // this.template.querySelector("c-employee-sub-task-list").handleRefresh();
            })
            .catch();
    }

    getSubsidiaryCompetency(subcompId) {
        getSubsidiaryCompetencyDetail({ subcompId: subcompId }).then(data => {
            console.log("subcomp data " + JSON.stringify(data));
            this.subName = data[0].Subsidiary_Name__r.Name;
            this.compName = data[0].Competency_Name__r.Name;
        }).catch()
    }

    getSubTask(recId) {
        subtasks({ parentId: recId })
            .then(data => {
                if (Array.isArray(data) && data.length) {
                    console.log('Non-Empty Sub Task ' + this.hasSubTasks)
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

    closeModal() {
        this.showTask = false;
    }

    handleEdit() {
        this.isEmployee = true;
        this.showEdit = true;
    }

    handleCloseModal() {
        this.showEdit = false;
    }

    handleUpdateTask(event) {
        //console.log('In handleupdatetask empview');
        let progress = event.detail;
        console.log('Progress empview ' + progress);
        if (progress == 90) {
            this.handleTaskOnHold();
        }
        this.showEdit = false;
        //console.log("here in edit");
        this.getCurrentTask(this.recordId);
    }

    handleTaskOnHold() {
        if (!(this.hasSubTasks)) {
            const fields = {};
            fields[ID_FIELD.fieldApiName] = this.recordId;
            fields[STATE_FIELD.fieldApiName] = "On hold";
            fields[PROGRESS_FIELD.fieldApiName] = 90;

            const recordInput = { fields };
            // fireEvent(this.pageRef, "updateEmployeeStatus", "Update Chart");
            updateRecord(recordInput)
                .then(() => {
                    this.getCurrentTask(this.recordId);
                    this.deactivate = true;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: "Success",
                            message: "Epic updated ; Notification Sent !",
                            variant: "success"
                        })
                    );
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
        } else if (this.hasSubTasks) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Error",
                    message: "Cannot Submit Epic with Incomplete Sub-Epics!",
                    variant: "error"
                })
            );
        }

    }

    handleEpicBack() {
        console.log('back clicked')
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Home'
            }
        });
        sessionStorage.setItem('updateSubTaskList', 'updatefromsubdetail');
    }

    handleAddSubEpic() {
        this.addSubEpic = true;
    }

    handleAdd() {
        console.log("Saved Success");
        fireEvent(this.pageRef, "subTaskAddedEmpEvent", "Refresh Apex");
        this.addSubEpic = false;
    }

    handleCancel() {
        this.addSubEpic = false;
    }

    handleSubUpdate() {
        this.getCurrentTask(this.recordId);
    }

    handleShowSubEpic() {
        this.showSubEpic = true;
    }

    subListCloseHandler() {
        this.showSubEpic = false;
    }

}