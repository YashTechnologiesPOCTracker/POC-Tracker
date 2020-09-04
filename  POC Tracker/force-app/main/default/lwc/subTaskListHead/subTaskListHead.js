import { LightningElement, track, wire, api } from "lwc";
import subtasks from "@salesforce/apex/taskController.listSubTask";
import delSelectedTask from "@salesforce/apex/taskController.deleteTasks";
import { updateRecord } from "lightning/uiRecordApi";
import { refreshApex } from "@salesforce/apex";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import TITLE_FIELD from "@salesforce/schema/Tracker__c.Title__c";
import PROGRAM_FIELD from "@salesforce/schema/Tracker__c.Program__c";
import PROGRESS_FIELD from "@salesforce/schema/Tracker__c.Progress__c";
import ASSIGNED_TO_FIELD from "@salesforce/schema/Tracker__c.Assigned_To__c";
import ID_FIELD from "@salesforce/schema/Tracker__c.Id";
import { CurrentPageReference, NavigationMixin } from "lightning/navigation";
import { fireEvent, registerListener, unregisterAllListeners } from "c/pubsub";

const actions = [
    { label: "View", name: "view" },
    // { label: "Edit", name: "edit" },
    // { label: "Delete", name: "delete" }
];

export default class SubTaskListHead extends NavigationMixin(LightningElement) {
    @api parentId;
    @api profileName;
    //parentId;
    recordId;
    //showEditTask = false;
    showMessage = false;
    showSubTaskDetail = false;
    isLead;
    progress
    @track subtaskList;
    refreshTable;
    error;
    @track draftValues = [];
    @wire(CurrentPageReference) pageRef;
    @track columns = [
        // {
        //     label: "ID",
        //     fieldName: "Name",
        //     initialWidth: 60
        // },
        {
            label: "Title",
            fieldName: "Title",
            editable: true,
            initialWidth: 190
        },
        {
            label: "Program",
            fieldName: "Program",
            initialWidth: 120
        },
        {
            label: "Progress",
            fieldName: "progress",
            initialWidth: 100
        },
        {
            label: "Start Date",
            fieldName: "startDate",
            initialWidth: 105
        },
        {
            label: "Target Date",
            fieldName: "targetDate",
            initialWidth: 105
        },
        {
            label: "Assigned To",
            fieldName: "Assigned_To",
            initialWidth: 110
        },
        {
            type: "action",
            typeAttributes: { rowActions: actions }
        }
    ];

    @wire(subtasks, { parentId: "$parentId" }) getSubTaskList(result) {
        this.refreshTable = result;
        if (result.data) {
            let newData;
            newData = result.data;
            this.error = undefined;
            let newArray = [];
            newData.forEach((element) => {
                let newObject = {};
                newObject.Id = element.Id;
                newObject.Name = element.Name;
                newObject.Title = element.Title__c;
                newObject.Program = element.Program__c;
                newObject.progress = element.Progress__c
                newObject.startDate = element.Start_Date__c;
                newObject.targetDate = element.Target_Date__c;
                newObject.Assigned_To = null;
                if (element.Assigned_To__r.Name) {
                    newObject.Assigned_To = element.Assigned_To__r.Name;
                }
                newArray.push(newObject);
            });
            console.log("Parent Id: " + this.parentId);
            if (Array.isArray(newArray) && newArray.length) {
                this.subtaskList = newArray;
                this.showMessage = false;
                //  console.log('subtaskList ' + this.subtaskList);
            }
            //else if ((this.parentId) && !(Array.isArray(newArray) && newArray.length)) {

            //     this.message = 'Could Not find any Sub-Task Under this Task';
            //     this.showMessage = true;
            //     this.subtaskList = undefined;

            // }
            else {
                this.message = "No Data";
                this.showMessage = true;
                this.subtaskList = undefined;
            }
            console.log(
                "taskList from task user list" + JSON.stringify(this.subtaskList)
            );
        } else if (result.error) {
            this.error = result.error;
            this.subtaskList = undefined;
        }
    }

    handleSave(event) {
        const fields = {};
        fields[ID_FIELD.fieldApiName] = event.detail.draftValues[0].Id;
        fields[TITLE_FIELD.fieldApiName] = event.detail.draftValues[0].Title;
        // fields[PROGRAM_FIELD.fieldApiName] = event.detail.draftValues[0].Program;
        fields[PROGRESS_FIELD.fieldApiName] = event.detail.draftValues[0].progress;
        // fields[ASSIGNED_TO_FIELD.fieldApiName] =
        //     event.detail.draftValues[0].Assigned_To;

        const recordInput = { fields };
        updateRecord(recordInput)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Success",
                        message: "Task updated",
                        variant: "success"
                    })
                );
                fireEvent(this.pageRef, "editReportUpdate", 'update sub report');
                this.draftValues = [];
                return refreshApex(this.refreshTable);
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

    connectedCallback() {
        registerListener("updateSubTask", this.handleCall, this);
        registerListener("subTaskAddedEvent", this.handleCall, this);
        registerListener("parentTaskDeleteEvent", this.handleCall, this);
        let forReportData = {};
        forReportData.parentId = this.parentId;
        forReportData.profileName = this.profileName
        fireEvent(this.pageRef, 'subTaskReportChart', forReportData);
        console.log('Profile Name ' + this.profileName);

    }

    // handleCallback(detail) {
    //     console.log('details in sub task ' + detail);
    //     this.parentId = detail;
    // }

    handleCall(detail) {
        console.log("in handleCall " + detail);
        return refreshApex(this.refreshTable);
    }
    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    handleRowAction(event) {
        let actionName = event.detail.action.name;
        console.log("actionName ====> " + actionName);
        let row = event.detail.row;
        console.log("ROW ====> " + JSON.stringify(row));
        this.recordId = event.detail.row.Id;
        this.progress = event.detail.row.progress;
        console.log("Id " + this.recordId);
        switch (actionName) {
            case "view":
                this.showSubTaskDetail = true;
                console.log("Record Id from subtask " + this.recordId);
                //this.showSubTaskDetail = true;
                // fireEvent(this.pageRef, "passEventFromSubtaskList", this.recordId);
                // if (this.profileName === 'Lead') {
                //     this.isLead = true;
                //     this[NavigationMixin.Navigate]({
                //         type: 'comm__namedPage',
                //         attributes: {
                //             name: 'subTaskDetail__c'
                //         }
                //     });
                //     sessionStorage.setItem('subRecordData', this.recordId);
                // } else {
                //     this.isLead = false;
                // }


                break;
                // case "edit":
                //     this.showEditTask = true;
                //     this.showSubTaskDetail = false;
                //     console.log("Record Id from subtask " + this.recordId);
                //     break;
                // case "delete":
                //     this.deleteTask(row);
                //     break;

            default:
        }
    }

    // deleteTask(currentRow) {
    //     let currentRecord = [];
    //     console.log("In delete task");
    //     currentRecord = currentRow.Id;
    //     console.log("currentRecord " + currentRecord);
    //     delSelectedTask({ recordId: currentRow.Id })
    //         .then((result) => {
    //             this.dispatchEvent(
    //                 new ShowToastEvent({
    //                     title: "Success!!",
    //                     message: "Record Deleted Successfully",
    //                     variant: "success"
    //                 })
    //             );
    //             fireEvent(this.pageRef, "deleteReportUpdate", 'update sub report');
    //             return refreshApex(this.refreshTable);
    //         })
    //         .catch((error) => {
    //             console.log("Error ====> " + error);
    //             this.dispatchEvent(
    //                 new ShowToastEvent({
    //                     title: "Error!!",
    //                     message: error.message,
    //                     variant: "error"
    //                 })
    //             );
    //         });
    // }


    handleCloseSubTask() {
        this.showSubTaskDetail = false;
    }


    handleSubListClose() {
        const customEvent = new CustomEvent('sublistclose');
        this.dispatchEvent(customEvent);
    }
}