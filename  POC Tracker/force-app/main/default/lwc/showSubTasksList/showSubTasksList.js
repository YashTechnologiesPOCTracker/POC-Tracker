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
    { label: "Edit", name: "edit" },
    { label: "Delete", name: "delete" }
];

export default class ShowSubTasksList extends NavigationMixin(LightningElement) {
    @api parentId;
    //@api profileName;
    //parentId;
    recordId;
    showEditTask = false;
    showMessage = false;
    showSubTaskDetail = false;
    isLead;
    @track subtaskList;
    refreshTable;
    error;
    aggregateProgress
    Completed;
    NotCompleted;
    @track draftValues = [];
    @wire(CurrentPageReference) pageRef;
    @api subName;
    @api compName;

    page = 1;
    items = [];
    startingRecord = 1;
    endingRecord = 0;
    pageSize = 5;
    totalRecountCount = 0;
    totalPage = 0;

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
            editable: true,
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
            initialWidth: 120
        },
        {
            type: "action",
            typeAttributes: { rowActions: actions }
        }
    ];

    connectedCallback() {
        registerListener("updateSubTask", this.handleCall, this);
        registerListener("subTaskAddedEvent", this.handleCall, this);
        registerListener("parentTaskDeleteEvent", this.handleCall, this);
        fireEvent(this.pageRef, 'subTaskReportChart', this.parentId);
        // console.log('Profile Name ' + this.profileName);

    }

    @wire(subtasks, { parentId: "$parentId" }) getSubTaskList(result) {
        this.refreshTable = result;
        this.Completed = 0;
        this.NotCompleted = 0;
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

                if (element.Progress__c === 100) {
                    this.Completed++;
                    console.log('Completed ' + this.Completed);
                } else if (element.Progress__c != 100) {
                    this.NotCompleted++;
                    console.log('NotCompleted ' + this.NotCompleted);
                }

                newArray.push(newObject);
            });
            console.log("Parent Id: " + this.parentId);
            if (Array.isArray(newArray) && newArray.length) {
                this.subtaskList = newArray;
                this.showMessage = false;
                //  console.log('subtaskList ' + this.subtaskList);
                this.items = newArray;
                this.totalRecountCount = newArray.length;
                this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); //here it is 5
                this.subtaskList = this.items.slice(0, this.pageSize);
                this.endingRecord = this.pageSize;

                this.updateProgress();
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

        let recordDetails = {};
        recordDetails.recordId = this.recordId;
        recordDetails.subName = this.subName;
        recordDetails.compName = this.compName;
        recordDetails.title = this.title;

        console.log("Id " + this.recordId);
        switch (actionName) {
            case "view":
                console.log("Record Id from subtask " + this.recordId);
                //this.showSubTaskDetail = true;
                // fireEvent(this.pageRef, "passEventFromSubtaskList", this.recordId);
                // if (this.profileName === 'Lead') {
                this.isLead = true;
                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        name: 'subTaskDetail__c'
                    }
                });
                sessionStorage.setItem('subRecordData', JSON.stringify(recordDetails));
                // } else {
                //     this.isLead = false;
                // }


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
                fireEvent(this.pageRef, "deleteSubUpdate", 'update detail');
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

    updateProgress() {
        const fields = {};

        let p = (this.Completed / (this.Completed + this.NotCompleted)) * 100;
        this.aggregateProgress = p.toFixed(2)
        console.log('P ' + p);
        console.log('Progress:%%%%%% ' + this.aggregateProgress);

        fields[ID_FIELD.fieldApiName] = this.parentId;
        fields[PROGRESS_FIELD.fieldApiName] = this.aggregateProgress;

        const recordInput = { fields };
        updateRecord(recordInput)
            .then(() => {
                const custEvent = new CustomEvent('progressupdated');
                this.dispatchEvent(custEvent)
                    // fireEvent(this.pageRef, "editReportUpdate", 'update sub report');
                    // this.draftValues = [];
                    // return refreshApex(this.refreshTable);
            })
            .catch((error) => {});

    }

    previousHandler() {
        if (this.page > 1) {
            this.page = this.page - 1;
            this.displayRecordPerPage(this.page);
        }
    }

    nextHandler() {
        if ((this.page < this.totalPage) && this.page !== this.totalPage) {
            this.page = this.page + 1;
            this.displayRecordPerPage(this.page);
        }
    }

    displayRecordPerPage(page) {
        this.startingRecord = ((page - 1) * this.pageSize);
        this.endingRecord = (this.pageSize * page);
        this.endingRecord = (this.endingRecord > this.totalRecountCount) ?
            this.totalRecountCount : this.endingRecord;

        this.subtaskList = this.items.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    }

    handleCloseModal() {
        this.showEditTask = false;
    }

    handleUpdateTask() {
        this.showEditTask = false;
        fireEvent(this.pageRef, "editReportUpdate", 'update sub report');
        fireEvent(this.pageRef, "editSubUpdate", 'update sub detail');
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