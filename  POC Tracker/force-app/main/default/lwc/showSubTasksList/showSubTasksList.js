import { LightningElement, track, wire, api } from "lwc";
import subtasks from "@salesforce/apex/taskController.listSubTask";
import delSelectedTask from "@salesforce/apex/taskController.deleteTasks";
import { updateRecord } from "lightning/uiRecordApi";
import { refreshApex } from "@salesforce/apex";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import TITLE_FIELD from "@salesforce/schema/Tracker__c.Title__c";
import PROGRAM_FIELD from "@salesforce/schema/Tracker__c.Program__c";
import ASSIGNED_TO_FIELD from "@salesforce/schema/Tracker__c.Assigned_To__c";
import ID_FIELD from "@salesforce/schema/Tracker__c.Id";
import { CurrentPageReference } from "lightning/navigation";
import { fireEvent, registerListener, unregisterAllListeners } from "c/pubsub";

const actions = [
    { label: "View", name: "view" },
    { label: "Edit", name: "edit" },
    { label: "Delete", name: "delete" }
];

export default class ShowSubTasksList extends LightningElement {
    @api parentId;
    //parentId;
    recordId;
    showEditTask = false;
    showMessage = false;
    showSubTaskDetail = false;
    @track subtaskList;
    refreshTable;
    error;
    @track draftValues = [];
    @wire(CurrentPageReference) pageRef;
    @track columns = [{
            label: "ID",
            fieldName: "Name"
        },
        {
            label: "Title",
            fieldName: "Title",
            editable: true
        },
        {
            label: "Program",
            fieldName: "Program"
        },
        {
            label: "Start Date",
            fieldName: "startDate"
        },
        {
            label: "Target Date",
            fieldName: "targetDate"
        },
        {
            label: "Assigned To",
            fieldName: "Assigned_To"
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
        fields[PROGRAM_FIELD.fieldApiName] = event.detail.draftValues[0].Program;
        fields[ASSIGNED_TO_FIELD.fieldApiName] =
            event.detail.draftValues[0].Assigned_To;

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
        fireEvent(this.pageRef, 'subTaskReportChart', this.parentId);
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
        this.recordId = event.detail.row.Id;
        console.log("Id " + this.recordId);
        switch (actionName) {
            case "view":
                console.log("Record Id from subtask " + this.recordId);
                this.showSubTaskDetail = true;
                // fireEvent(this.pageRef, "passEventFromSubtaskList", this.recordId);
                break;
            case "edit":
                this.showEditTask = true;
                this.showSubTaskDetail = false;
                console.log("Record Id from subtask " + this.recordId);
                break;
            case "delete":
                this.deleteTask(row);
                break;

            default:
        }
    }

    deleteTask(currentRow) {
        let currentRecord = [];
        console.log("In delete task");
        currentRecord = currentRow.Id;
        console.log("currentRecord " + currentRecord);
        delSelectedTask({ recordId: currentRow.Id })
            .then((result) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Success!!",
                        message: "Record Deleted Successfully",
                        variant: "success"
                    })
                );
                fireEvent(this.pageRef, "deleteReportUpdate", 'update sub report');
                return refreshApex(this.refreshTable);
            })
            .catch((error) => {
                console.log("Error ====> " + error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error!!",
                        message: error.message,
                        variant: "error"
                    })
                );
            });
    }

    handleCloseModal() {
        this.showEditTask = false;
    }

    handleUpdateTask() {
        this.showEditTask = false;
        fireEvent(this.pageRef, "editReportUpdate", 'update sub report');
        return refreshApex(this.refreshTable);
    }

    handleCloseSubTask() {
        this.showSubTaskDetail = false;
    }

    handleSubListClose() {
        const customEvent = new CustomEvent('sublistclose');
        this.dispatchEvent(customEvent);
    }
}