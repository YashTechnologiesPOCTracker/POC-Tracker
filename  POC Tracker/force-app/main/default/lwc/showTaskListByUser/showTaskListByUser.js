import { LightningElement, wire, track, api } from "lwc";
import getTasks from "@salesforce/apex/taskController.getTasksByUser";
import delSelectedTask from "@salesforce/apex/taskController.deleteTasks";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { CurrentPageReference, NavigationMixin } from "lightning/navigation";
import { fireEvent, registerListener, unregisterAllListeners } from "c/pubsub";
import { updateRecord } from "lightning/uiRecordApi";
import ID_FIELD from "@salesforce/schema/Tracker__c.Id";
import TITLE_FIELD from "@salesforce/schema/Tracker__c.Title__c";
import PROGRAM_FIELD from "@salesforce/schema/Tracker__c.Program__c";
import ASSIGNED_TO_FIELD from "@salesforce/schema/Tracker__c.Assigned_To__c";
import PROGRESS_FIELD from "@salesforce/schema/Tracker__c.Progress__c";
import searchEpic from "@salesforce/apex/taskController.searchEpic";

const actions = [
    // { label: "Add Sub-Task", name: "add_sub_task" },
    // { label: "Show Sub-Tasks", name: "show_sub_tasks" },
    { label: "View", name: "view" },
    { label: "Edit", name: "edit" },
    { label: "Delete", name: "delete" }
];

export default class ShowTaskListByUser extends NavigationMixin(LightningElement) {
    @api currentUserId;
    // @api subsidiaryId;
    @api competencyId;
    @api subcompId;
    showEditTask = false;
    showTaskDetail = false;
    recordId = '';
    refreshTable;
    error;
    message;
    showMessage = false;
    isAddEpic = false;
    //@track competencyDetail;
    @api selectedSubName;
    @api selectedCompName;
    @track taskList;
    @wire(CurrentPageReference) pageRef;
    search = '';

    page = 1;
    items = [];
    startingRecord = 1;
    endingRecord = 0;
    pageSize = 5;
    totalRecountCount = 0;
    totalPage = 0;

    @track columns = [{
            label: "ID",
            fieldName: "Name",
            initialWidth: 60
        },
        {
            label: "Title",
            fieldName: "Title",
            editable: true,
            initialWidth: 260,
        },
        {
            label: "Program",
            fieldName: "Program",
            initialWidth: 120,
            //editable: true
        },
        {
            label: "Progress",
            fieldName: "progress",
            initialWidth: 100,
            // editable: true
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
                if (element.State__c != 'Completed') {
                    let newObject = {};
                    newObject.Id = element.Id;
                    newObject.Name = element.Name;
                    newObject.Title = element.Title__c;
                    newObject.Program = element.Program__c;
                    newObject.startDate = element.Start_Date__c;
                    newObject.targetDate = element.Target_Date__c;
                    newObject.progress = element.Progress__c;
                    newObject.state = element.State__c;
                    if (element.Assigned_To__r.Name) {
                        newObject.Assigned_To = element.Assigned_To__r.Name;
                    }
                    newArray.push(newObject);
                }
            });

            if (Array.isArray(newArray) && newArray.length) {
                //this.taskList = newArray;
                this.showMessage = false;
                fireEvent(this.pageRef, "selectedSubIdForReport", this.subcompId);

                this.items = newArray;
                this.totalRecountCount = newArray.length;
                this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);
                this.taskList = this.items.slice(0, this.pageSize);
                this.endingRecord = this.pageSize;

                this.error = undefined;
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
        console.log("selectedSubName " + this.selectedSubName);
        console.log("selectedCompName " + this.selectedCompName);
        console.log("competencyId " + this.competencyId);
        console.log("SEARCH TEXT " + this.search);
        registerListener("updateEpicTable", this.handle, this);
    }


    handle() {
        return refreshApex(this.refreshTable);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    handleRowAction(event) {
        let actionName = event.detail.action.name;
        // console.log("actionName ====> " + actionName);
        let row = event.detail.row;
        console.log('Row Data ' + JSON.stringify(row));
        this.recordId = event.detail.row.Id;
        console.log("Id " + this.recordId);

        let recordData = {};
        recordData.recordId = this.recordId;
        recordData.userSubCompId = this.subcompId;
        recordData.subName = this.selectedSubName;
        recordData.compName = this.selectedCompName;
        // recordData.competencyId = this.competencyId;
        // recordData.state = event.detail.row.state;
        // recordData.progress = event.detail.row.progress

        switch (actionName) {
            case "view":
                this.showEditTask = false;
                // fireEvent(this.pageRef, 'subTaskReportChart', this.recordId);; // event for sub tasks report
                console.log("Record data in from view detail " + JSON.stringify(recordData));
                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        name: 'taskDetail__c'
                    }
                });
                sessionStorage.setItem('recordData', JSON.stringify(recordData));
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
        fields[PROGRESS_FIELD.fieldApiName] = event.detail.draftValues[0].progress;
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
                fireEvent(this.pageRef, 'updateReportChart', 'Updated');
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

    // handleValue(event) {
    //     console.log('in handle value');
    //     this.search = event.target.value;
    // }

    // handleSearch() {
    //     console.log('in handle search ' + this.search);
    //     searchEpic({ search: this.search })
    //         .then(data => {
    //             console.log('Search Result: ' + JSON.stringify(data));
    //             this.taskList = data;
    //         })
    //         .catch(error => {
    //             console.log('Error ' + error.message);
    //         });

    // }

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

        this.taskList = this.items.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    }

    handleCloseModal() {
        this.showEditTask = false;
    }

    handleUpdateTask() {
        this.showEditTask = false;
        fireEvent(this.pageRef, 'updateReportChart', 'Updated');
        return refreshApex(this.refreshTable);
    }

    handleClose() {
        this.showTaskDetail = false;
    }

    handleTaskBack(event) {
        this.isTaskTrue = false;
        const customEvent = new CustomEvent("backcompetencyevent");
        this.dispatchEvent(customEvent);
    }

    addEpic() {
        console.log('Add Epic clicked ' + this.isAddEpic)
        this.isAddEpic = true;
    }

    handleAddTask() {
        this.isAddEpic = false;
        fireEvent(this.pageRef, 'updateReportChart', 'Updated');
        return refreshApex(this.refreshTable);
    }

    handleCloseTask() {
        this.isAddEpic = false;
    }
}