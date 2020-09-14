import { LightningElement, wire, track } from "lwc";
import getTasks from "@salesforce/apex/taskController.getTasksByEmployee";
import PROGRESS_FIELD from "@salesforce/schema/Tracker__c.Progress__c";
import userId from "@salesforce/user/Id";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { updateRecord } from "lightning/uiRecordApi";
import ID_FIELD from "@salesforce/schema/Tracker__c.Id";
import STATE_FIELD from "@salesforce/schema/Tracker__c.State__c";
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { fireEvent, registerListener, unregisterAllListeners } from "c/pubsub";



const actions = [
    { label: "View", name: "view" },
    { label: "Edit", name: "edit" },

];

const completedActions = [
    { label: "View", name: "view" }
];

export default class EmployeeTaskList extends NavigationMixin(LightningElement) {
    // currentUserId = userId;

    // showEditTask = false;
    // showViewTask = false;

    // @track recordId;
    // @track PTGName;
    // @track taskList;
    // @track isDataAvilable = false;
    // progress;
    // refreshTable;
    // error;
    // @wire(CurrentPageReference) pageRef;
    // @track columns = [
    //     // {
    //     //     label: "ID",
    //     //     fieldName: "Name",
    //     //     initialWidth: 80
    //     // },
    //     {
    //         label: "Subsidiary Name",
    //         fieldName: "subsidiaryName",

    //     },
    //     {
    //         label: "Competency Name",
    //         fieldName: "competencyName",

    //     },
    //     {
    //         label: "Title",
    //         fieldName: "Title",

    //     },
    //     {
    //         label: "Progress",
    //         fieldName: "Progress",
    //         editable: true,
    //         initialWidth: 100
    //     },
    //     {
    //         label: "Program",
    //         fieldName: "Program",
    //         initialWidth: 120

    //     },
    //     // {
    //     //     label: "Start_Date",
    //     //     fieldName: "Start_Date",

    //     // },
    //     // {
    //     //     label: "Target_Date",
    //     //     fieldName: "Target_Date",

    //     // },
    //     // {
    //     //     label: "Assigned To",
    //     //     fieldName: "Assigned_To",
    //     // },
    //     {
    //         type: "action",
    //         typeAttributes: { rowActions: actions }
    //     }
    // ];

    // @wire(getTasks, { currentUserId: "$currentUserId" }) getTaskList(result) {
    //     // alert('user id ====', this.currentUserId);
    //     console.log('Task Data: ' + JSON.stringify(result));
    //     this.refreshTable = result;
    //     if (result.data) {
    //         let newData;
    //         newData = result.data;
    //         this.error = undefined;
    //         let newArray = [];
    //         newData.forEach((element) => {
    //             let newObject = {};
    //             newObject.Id = element.Id;
    //             newObject.Name = element.Name;
    //             newObject.Title = element.Title__c;
    //             newObject.Progress = element.Progress__c;
    //             newObject.Program = element.Program__c;
    //             newObject.Start_Date = element.Start_Date__c;
    //             newObject.Target_Date = element.Target_Date__c;
    //             newObject.subsidiaryName = element.Subsidiary_CompetencyId__r.Subsidiary_Name__r.Name;
    //             newObject.competencyName = element.Subsidiary_CompetencyId__r.Competency_Name__r.Name;
    //             newObject.Assigned_To = null;
    //             if (element.Assigned_To__r.Name) {
    //                 newObject.Assigned_To = element.Assigned_To__r.Name;
    //             }
    //             newArray.push(newObject);
    //         });
    //         //this.taskList = newArray;
    //         if (newArray.length) {
    //             this.taskList = newArray;
    //             this.isDataAvilable = true;
    //         } else {
    //             this.taskList = [];
    //             this.isDataAvilable = false;
    //         }

    //         console.log(
    //             "taskList from task user list" + JSON.stringify(this.taskList)
    //         );
    //     } else if (result.error) {
    //         this.error = result.error;
    //         this.taskList = undefined;
    //     }
    // }



    // handleRowAction(event) {
    //     let actionName = event.detail.action.name;
    //     console.log("actionName ====> " + actionName);
    //     let row = event.detail.row;
    //     this.recordId = event.detail.row.Id;
    //     this.progress = event.detail.row.Progress;

    //     console.log("Row " + JSON.stringify(row));
    //     console.log("Id " + this.recordId);

    //     switch (actionName) {
    //         case "view":
    //             this.showViewTask = true;
    //             break;

    //         case "edit":
    //             this.showEditTask = true;
    //             console.log('Record Id in from list by user ' + this.recordId);
    //             break;

    //         default:
    //     }
    // }


    // handleSave(event) {
    //     const fields = {};
    //     fields[ID_FIELD.fieldApiName] = event.detail.draftValues[0].Id;
    //     fields[PROGRESS_FIELD.fieldApiName] = event.detail.draftValues[0].Progress;
    //     const recordInput = { fields };
    //     updateRecord(recordInput)
    //         .then(() => {
    //             this.dispatchEvent(
    //                 new ShowToastEvent({
    //                     title: "Success",
    //                     message: "Task Updated",
    //                     variant: "success"
    //                 })
    //             );
    //             this.draftValues = [];
    //             return refreshApex(this.refreshTable);
    //         })
    //         .catch((error) => {
    //             this.dispatchEvent(
    //                 new ShowToastEvent({
    //                     title: "Error creating record",
    //                     message: error.body.message,
    //                     variant: "error"
    //                 })
    //             );
    //         });
    // }

    // handleCloseModal() {
    //     this.showEditTask = false;
    //     this.showViewTask = false;

    // }

    // handleUpdateTask() {
    //     this.showEditTask = false;
    //     this.showViewTask = false;
    //     return refreshApex(this.refreshTable);
    // }

    currentUserId = userId;
    showEditTask = false;
    showViewTask = false;

    page = 1;
    items = [];
    startingRecord = 1;
    endingRecord = 0;
    pageSize = 5;
    totalRecountCount = 0;
    totalPage = 0;
    page1 = 1;
    items1 = [];
    startingRecord1 = 1;
    endingRecord1 = 0;
    pageSize1 = 5;
    totalRecountCount1 = 0;
    totalPage1 = 0;

    @track recordId;
    @track PTGName;
    @track taskList;
    @track completedTaskList;
    @track isDataAvilable = false;
    @track isCompletedTaskDataAvilable = false;
    progress;
    refreshTable;
    error;
    @wire(CurrentPageReference) pageRef;
    @track columns = [
        // {
        //     label: "ID",
        //     fieldName: "Name",
        //     initialWidth: 80
        // },
        {
            label: "Subsidiary Name",
            fieldName: "subsidiaryName",

        },
        {
            label: "Competency Name",
            fieldName: "competencyName",

        },
        {
            label: "Title",
            fieldName: "Title",

        },
        // {
        //     label: "Progress",
        //     fieldName: "Progress",
        //     editable: true,
        //     initialWidth: 100
        // },
        {
            label: "Program",
            fieldName: "Program",
            initialWidth: 120

        },
        {
            label: "State",
            fieldName: "State",
            initialWidth: 100
        },
        // {
        //     label: "Start_Date",
        //     fieldName: "Start_Date",

        // },
        // {
        //     label: "Target_Date",
        //     fieldName: "Target_Date",

        // },
        // {
        //     label: "Assigned To",
        //     fieldName: "Assigned_To",
        // },
        {
            type: "action",
            typeAttributes: { rowActions: actions }
        }
    ];


    @track completedColumns = [
        // {
        //     label: "ID",
        //     fieldName: "Name",
        //     initialWidth: 80
        // },
        {
            label: "Subsidiary Name",
            fieldName: "subsidiaryName",

        },
        {
            label: "Competency Name",
            fieldName: "competencyName",

        },
        {
            label: "Title",
            fieldName: "Title",

        },
        // {
        //     label: "Progress",
        //     fieldName: "Progress",
        //     initialWidth: 100
        // },
        {
            label: "Program",
            fieldName: "Program",
            initialWidth: 120

        },
        {
            label: "State",
            fieldName: "State",
            initialWidth: 100
        },
        // {
        //     label: "Target_Date",
        //     fieldName: "Target_Date",

        // },
        // {
        //     label: "Assigned To",
        //     fieldName: "Assigned_To",
        // },
        {
            type: "action",
            typeAttributes: { rowActions: completedActions }
        }
    ];

    connectedCallback() {
        // registerListener("updateEmployeeStatusChart", this.handleCall, this);
        let subdata = sessionStorage.getItem('updateSubTaskList');
        console.log('SUBDATA ' + subdata);
        if (subdata != null) {
            this.refreshPage();
        }
    }

    handleCall(detail) {
        console.log(' detail' + detail);
        this.handleUpdateTask();
        return refreshApex(this.refreshTable);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }


    refreshPage() {
        console.log('in refresh page');
        sessionStorage.removeItem('updateSubTaskList');
        window.location.reload()
    }

    @wire(getTasks, { currentUserId: "$currentUserId" }) getTaskList(result) {

        var taskArray = [];
        var completedTaskArray = [];
        this.refreshTable = result;

        if (result.data) {
            let newData;
            newData = result.data;
            console.log('Task Data:::::: ----- ' + JSON.stringify(newData));
            newData.forEach(element => {
                var State = element.State__c;
                if (element.State__c == 'Completed') {
                    let newObject = {};
                    newObject.Id = element.Id;
                    newObject.Name = element.Name;
                    newObject.Title = element.Title__c;
                    newObject.Progress = element.Progress__c;
                    newObject.Program = element.Program__c;
                    newObject.State = element.State__c;
                    newObject.Start_Date = element.Start_Date__c;
                    newObject.Target_Date = element.Target_Date__c;
                    newObject.subsidiaryName = element.Subsidiary_CompetencyId__r.Subsidiary_Name__r.Name;
                    newObject.competencyName = element.Subsidiary_CompetencyId__r.Competency_Name__r.Name;
                    newObject.Assigned_To = null;
                    if (element.Assigned_To__r.Name) {
                        newObject.Assigned_To = element.Assigned_To__r.Name;
                    }

                    completedTaskArray.push(newObject);

                } else {
                    let newObject = {};
                    newObject.Id = element.Id;
                    newObject.Name = element.Name;
                    newObject.Title = element.Title__c;
                    newObject.Progress = element.Progress__c;
                    newObject.Program = element.Program__c;
                    newObject.State = element.State__c;
                    newObject.Start_Date = element.Start_Date__c;
                    newObject.Target_Date = element.Target_Date__c;
                    newObject.subsidiaryName = element.Subsidiary_CompetencyId__r.Subsidiary_Name__r.Name;
                    newObject.competencyName = element.Subsidiary_CompetencyId__r.Competency_Name__r.Name;
                    newObject.Assigned_To = null;
                    if (element.Assigned_To__r.Name) {
                        newObject.Assigned_To = element.Assigned_To__r.Name;
                    }

                    taskArray.push(newObject);
                }
            })
            if (taskArray.length) {
                // this.taskList = taskArray;
                this.isDataAvilable = true;

                this.items = taskArray;
                this.totalRecountCount = taskArray.length;
                this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);
                this.taskList = this.items.slice(0, this.pageSize);
                this.endingRecord = this.pageSize;
            } else {
                this.taskList = [];
                this.isDataAvilable = false;
            }

            if (completedTaskArray.length) {
                // this.completedTaskList = completedTaskArray;
                this.isCompletedTaskDataAvilable = true;

                this.items1 = completedTaskArray;
                this.totalRecountCount1 = completedTaskArray.length;
                this.totalPage1 = Math.ceil(this.totalRecountCount1 / this.pageSize1);
                this.completedTaskList = this.items1.slice(0, this.pageSize1);
                this.endingRecord1 = this.pageSize1;
            } else {
                this.completedTaskList = [];
                this.isCompletedTaskDataAvilable = false;
            }
        } else if (result.error) {
            this.error = result.error;
            this.taskList = undefined;
        }

    }

    handleRowAction(event) {
        let actionName = event.detail.action.name;
        console.log("actionName ====> " + actionName);
        let row = event.detail.row;
        this.recordId = event.detail.row.Id;
        this.progress = event.detail.row.Progress;

        console.log("Row " + JSON.stringify(row));
        console.log("Id " + this.recordId);

        switch (actionName) {
            case "view":
                sessionStorage.setItem('recordId', this.recordId);

                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        name: 'testPalashEmpTaskDetail__c'
                    }
                });
                break;

            case "edit":
                this.showEditTask = true;
                console.log('Record Id in from list by user ' + this.recordId);
                break;

            default:
        }
    }


    handleSave(event) {
        const fields = {};

        if (event.detail.draftValues[0].Progress > 90) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Error",
                    message: "You cannot update Epic to more than 90%",
                    variant: "error"
                })
            );
        } else {
            if (event.detail.draftValues[0].Progress == 90) {
                fields[ID_FIELD.fieldApiName] = event.detail.draftValues[0].Id;
                fields[PROGRESS_FIELD.fieldApiName] = event.detail.draftValues[0].Progress;
                fields[STATE_FIELD.fieldApiName] = 'On hold';
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
                        //  fireEvent(this.pageRef, "updateEmployeeReportChart", "Updated");
                        return refreshApex(this.refreshTable);
                    })
                    .catch((error) => {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: "Error updating Epic",
                                message: error.body.message,
                                variant: "error"
                            })
                        );
                    });
            } else {
                fields[ID_FIELD.fieldApiName] = event.detail.draftValues[0].Id;
                fields[PROGRESS_FIELD.fieldApiName] = event.detail.draftValues[0].Progress;
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
                        // fireEvent(this.pageRef, "updateEmployeeReportChart", "Updated");
                        return refreshApex(this.refreshTable);
                    })
                    .catch((error) => {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: "Error updating Epic",
                                message: error.body.message,
                                variant: "error"
                            })
                        );
                    });
            }

        }
    }

    handleCloseModal() {
        this.showEditTask = false;
        this.showViewTask = false;

    }

    handleUpdateTask() {
        this.showEditTask = false;
        this.showViewTask = false;
        return refreshApex(this.refreshTable);
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

        this.taskList = this.items.slice(this.startingRecord, this.endingRecord);
        this.completedTaskList = this.items1.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    }

    previousHandler1() {
        if (this.page1 > 1) {
            this.page1 = this.page1 - 1;
            this.displayRecordPerPage1(this.page1);
        }
    }

    nextHandler1() {
        if ((this.page1 < this.totalPage1) && this.page1 !== this.totalPage1) {
            this.page1 = this.page1 + 1;
            this.displayRecordPerPage1(this.page1);
        }
    }

    displayRecordPerPage1(page1) {
        this.startingRecord1 = ((page1 - 1) * this.pageSize1);
        this.endingRecord1 = (this.pageSize1 * page1);
        this.endingRecord1 = (this.endingRecord1 > this.totalRecountCount1) ?
            this.totalRecountCount1 : this.endingRecord1;

        //this.taskList = this.items.slice(this.startingRecord, this.endingRecord);
        this.completedTaskList = this.items1.slice(this.startingRecord1, this.endingRecord1);
        this.startingRecord1 = this.startingRecord1 + 1;
    }
}