import { LightningElement, wire, track, api } from "lwc";
import getTasks from "@salesforce/apex/taskController.getTasksByUser";
import userPTGName from "@salesforce/apex/taskController.getPTGNameForLoggedInUser";
import delSelectedTask from "@salesforce/apex/taskController.deleteTasks";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { CurrentPageReference } from "lightning/navigation";
import { fireEvent } from "c/pubsub";
import { updateRecord } from "lightning/uiRecordApi";
import ID_FIELD from "@salesforce/schema/Tracker__c.Id";
import TITLE_FIELD from "@salesforce/schema/Tracker__c.Title__c";
import PROGRAM_FIELD from "@salesforce/schema/Tracker__c.Program__c";
import ASSIGNED_TO_FIELD from "@salesforce/schema/Tracker__c.Assigned_To__c";

const actions = [
    { label: "Add Sub-Task", name: "add_sub_task" },
    { label: "Show Sub-Tasks", name: "show_sub_tasks" },
    { label: "View Details", name: "view" },
    { label: "Edit", name: "edit" },
    { label: "Delete", name: "delete" }
];

export default class ShowTaskListByUser extends LightningElement {
    @api currentUserId;
    @api subsidiaryId;
    @api competencyId;
    @api subcompId;
    showEditTask = false;
    showTaskDetail = false;
    recordId;
    refreshTable;
    error;
    message;
    showMessage = false;
    //@track competencyDetail;
    @track taskList;
    @wire(CurrentPageReference) pageRef;
    @track columns = [{
            label: "ID",
            fieldName: "Name",
            initialWidth: 80
        },
        {
            label: "Title",
            fieldName: "Title",
            editable: true,
            initialWidth: 180,
        },
        {
            label: "Program",
            fieldName: "Program",
            initialWidth: 100,
            //editable: true
        },
        {
            label: "Start Date",
            fieldName: "startDate",
            initialWidth: 110,
            //editable: true
        },
        {
            label: "Target Date",
            fieldName: "targetDate",
            initialWidth: 110,
            //editable: true
        },
        {
            label: "Assigned To",
            fieldName: "Assigned_To",
            initialWidth: 110,
            // editable: true
        },
        {
            type: "action",
            typeAttributes: { rowActions: actions }
        }
    ];

    @wire(getTasks, { currentUserId: "$currentUserId", subcompId: '$subcompId' }) getTaskList(result) {
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
                if (element.Assigned_To__r.Name) {
                    newObject.Assigned_To = element.Assigned_To__r.Name;
                }
                newArray.push(newObject);
            });

            if (Array.isArray(newArray) && newArray.length) {
                this.taskList = newArray;
                this.showMessage = false;
                // this.showDataReport();
            } else {
                this.message = 'Could Not find any Task for the Requested Competency';
                this.showMessage = true;
                this.taskList = undefined;
            }
            // console.log("taskList from task user list" + JSON.stringify(this.taskList));
        } else if (result.error) {
            this.error = result.error;
            this.taskList = undefined;
        }

    }

    connectedCallback() {
        console.log("currentUserId " + this.currentUserId);
        console.log("subId " + this.subcompId);
    }

    handleRowAction(event) {
        let actionName = event.detail.action.name;
        // console.log("actionName ====> " + actionName);
        let row = event.detail.row;
        this.recordId = event.detail.row.Id;
        //  console.log("Id " + this.recordId);
        switch (actionName) {
            case "add_sub_task":
                this.showEditTask = false;
                let newData = {};
                console.log(
                    "competency Id " + JSON.stringify(this.recordId) +
                    "userSubCompId Id " + JSON.stringify(this.subcompId)
                );
                newData.recordId = this.recordId;
                newData.userSubCompId = this.subcompId;
                fireEvent(this.pageRef, "addSubTaskEvent", newData);
                break;
            case "show_sub_tasks":
                this.showEditTask = false;
                fireEvent(this.pageRef, "showSubTaskEvent", this.recordId);
                break;
            case "view":
                this.showEditTask = false;
                console.log("Record Id in from view detail " + this.recordId);
                fireEvent(this.pageRef, "detailTaskListEvent", this.recordId);
                break;
            case "edit":
                this.showEditTask = true;
                console.log("Record Id in from edit record " + this.recordId);
                break;
            case "delete":
                this.showEditTask = false;
                this.deleteTask(row);
                break;

            default:
        }
    }

    deleteTask(currentRow) {
        let currentRecord;
        console.log("In delete task");

        currentRecord = currentRow.Id;
        console.log("currentRecord " + JSON.stringify(currentRecord));
        delSelectedTask({ recordId: currentRow.Id })
            .then((result) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Success!!",
                        message: "Deleted",
                        variant: "success"
                    })
                );
                fireEvent(this.pageRef, "parentTaskDeleteEvent", 'Parent Task Deleted');
                fireEvent(this.pageRef, 'updateReportChart', 'Updated');
                return refreshApex(this.refreshTable);
            })
            .catch((error) => {
                window.console.log("Error ====> " + JSON.stringify(error));
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error!!",
                        message: error.message,
                        variant: "error"
                    })
                );
            });
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
                        message: "Task Updated",
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

    handleCloseModal() {
        this.showEditTask = false;
    }

    handleUpdateTask() {
        this.showEditTask = false;
        fireEvent(this.pageRef, 'updateReportChart', 'Updated');
        return refreshApex(this.refreshTable);
    }

    handleAddTask() {
        return refreshApex(this.refreshTable);
    }

    handleClose() {
        this.showTaskDetail = false;
    }


}