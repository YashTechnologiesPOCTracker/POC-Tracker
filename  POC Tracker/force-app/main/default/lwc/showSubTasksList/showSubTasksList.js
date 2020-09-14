import { LightningElement, track, wire, api } from "lwc";
import subtasks from "@salesforce/apex/TestFinalShowTaskList.listSubTask";
import delSelectedTask from "@salesforce/apex/taskController.deleteTasks";
import { updateRecord, createRecord } from "lightning/uiRecordApi";
import { refreshApex } from "@salesforce/apex";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import TITLE_FIELD from "@salesforce/schema/Tracker__c.Title__c";
import PROGRAM_FIELD from "@salesforce/schema/Tracker__c.Program__c";
import PROGRESS_FIELD from "@salesforce/schema/Tracker__c.Progress__c";
import ASSIGNED_TO_FIELD from "@salesforce/schema/Tracker__c.Assigned_To__c";
import PARENT_FIELD from "@salesforce/schema/Tracker__c.Parent_Task__c";
import ID_FIELD from "@salesforce/schema/Tracker__c.Id";
import { CurrentPageReference, NavigationMixin } from "lightning/navigation";
import { fireEvent, registerListener, unregisterAllListeners } from "c/pubsub";
import TRACKER_OBJECT from '@salesforce/schema/Tracker__c';
import SUBCOMPID_FIELD from "@salesforce/schema/Tracker__c.Subsidiary_CompetencyId__c";
import START_DATE_FIELD from "@salesforce/schema/Tracker__c.Start_Date__c";
import TARGET_DATE_FIELD from "@salesforce/schema/Tracker__c.Target_Date__c";

import getTask from '@salesforce/apex/taskController.getTask';

const actions = [
    { label: "View", name: "view" },
    { label: "Edit", name: "edit" },
    { label: "Delete", name: "delete" }
];

export default class ShowSubTasksList extends NavigationMixin(LightningElement) {
    @api parentId;
    //@api profileName;
    //parentId;
    @api subcompId;
    recordId;
    showEditTask = false;
    showMessage = false;
    showMessage1 = false;
    showSubTaskDetail = false;
    //isLead;
    @track subtaskList;
    @track completedSubtaskList;
    refreshTable;
    error;
    aggregateProgress
    Completed;
    NotCompleted;
    @track draftValues = [];
    @wire(CurrentPageReference) pageRef;
    @api subName;
    @api compName;
    message;
    message1;
    taskArray = [];
    completedTaskArray = [];

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

    @track columns = [{
            label: "ID",
            fieldName: "Name",
            initialWidth: 60
        },
        {
            label: "Title",
            fieldName: "Title",
            editable: true,
            initialWidth: 220
        },
        {
            label: "Program",
            fieldName: "Program",
            initialWidth: 125
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
            initialWidth: 115,
            editable: true,
        },
        {
            label: "Target Date",
            fieldName: "targetDate",
            initialWidth: 115,
            editable: true,
        },
        // {
        //     label: "Assigned To",
        //     fieldName: "Assigned_To",
        //     initialWidth: 120
        // },
        {
            type: "action",
            typeAttributes: { rowActions: actions }
        }
    ];

    connectedCallback() {
        console.log('connected callback called in sublist')
        registerListener("updateSubTask", this.handleCall, this);
        registerListener("subTaskAddedEvent", this.handleCall, this);
        registerListener("parentTaskDeleteEvent", this.handleCall, this);
        // registerListener("refreshSubEpicApex", this.handleCallback, this);
        fireEvent(this.pageRef, 'subTaskReportChart', this.parentId);
        // console.log('Profile Name ' + this.profileName);

    }

    handleCall(detail) {
        console.log("in handleCall " + detail);
        return refreshApex(this.refreshTable);
    }

    // handleCallback(detail) {
    //     console.log("in handleCallback " + detail);
    //     return refreshApex(this.refreshTable);
    // }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    @wire(subtasks, { parentId: "$parentId" }) getSubTaskList(result) {
        this.refreshTable = result;
        this.subtaskList = null;
        this.completedSubtaskList = null;
        this.Completed = 0;
        this.NotCompleted = 0;
        this.taskArray = [];
        this.completedTaskArray = [];

        if (result.data) {
            let newData;
            newData = result.data;
            //console.log('Task Data:::::: ----- ' + JSON.stringify(newData));
            newData.forEach(element => {
                //var State = element.State__c;
                if (element.State__c === 'Completed') {
                    let newObject = {};
                    newObject.Id = element.Id;
                    newObject.Name = element.Name;
                    newObject.Title = element.Title__c;
                    newObject.Program = element.Program__c;
                    newObject.progress = element.Progress__c
                    newObject.startDate = element.Start_Date__c;
                    newObject.targetDate = element.Target_Date__c;
                    // newObject.Assigned_To = null;
                    // if (element.Assigned_To__r.Name) {
                    //     newObject.Assigned_To = element.Assigned_To__r.Name;
                    // }
                    // if (element.Progress__c === 100) {
                    //     this.Completed++;
                    //     console.log('Completed ' + this.Completed);
                    // } else if (element.Progress__c != 100) {
                    //     this.NotCompleted++;
                    //     console.log('NotCompleted ' + this.NotCompleted);
                    // }
                    this.completedTaskArray.push(newObject);

                } else {
                    let newObject = {};
                    newObject.Id = element.Id;
                    newObject.Name = element.Name;
                    newObject.Title = element.Title__c;
                    newObject.Program = element.Program__c;
                    newObject.progress = element.Progress__c
                    newObject.startDate = element.Start_Date__c;
                    newObject.targetDate = element.Target_Date__c;
                    // newObject.Assigned_To = null;
                    // if (element.Assigned_To__r.Name) {
                    //     newObject.Assigned_To = element.Assigned_To__r.Name;
                    // }
                    // if (element.Progress__c === 100) {
                    //     this.Completed++;
                    //     console.log('Completed ' + this.Completed);
                    // } else if (element.Progress__c != 100) {
                    //     this.NotCompleted++;
                    //     console.log('NotCompleted ' + this.NotCompleted);
                    // }
                    this.taskArray.push(newObject);
                }
            });
            // if data.length and taskArray.length are equal, all data is in taskarray, d
            if (Array.isArray(this.taskArray) && this.taskArray.length) {
                //console.log('task Array iffff' + JSON.stringify(taskArray));
                this.subtaskList = this.taskArray;
                //  console.log('subtaskList ' + JSON.stringify(this.subtaskList));
                this.NotCompleted = this.taskArray.length
                    //console.log('NotCompleted ' + this.NotCompleted);
                this.showMessage1 = false;
                this.showMessage = false;

                console.log('subtaskList ' + this.subtaskList);
                this.items = this.taskArray;
                this.totalRecountCount = this.taskArray.length;
                this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); //here it is 5
                this.subtaskList = this.items.slice(0, this.pageSize);
                this.endingRecord = this.pageSize;

                this.updateProgress();
            } else {
                this.message = "No Data";
                this.showMessage1 = false;
                this.showMessage = true;
                this.subtaskList = undefined;
                // console.log('else');
            }

            if (Array.isArray(this.completedTaskArray) && this.completedTaskArray.length) {
                // console.log('completedTaskArray  ' + JSON.stringify(completedTaskArray));
                this.completedSubtaskList = this.completedTaskArray;
                //  console.log('completedSubtaskList  ' + JSON.stringify(this.completedSubtaskList));
                this.Completed = this.completedTaskArray.length;
                //console.log('Completed  ' + this.Completed);
                this.showMessage1 = false;
                this.showMessage = false;
                //console.log('subtaskList ' + this.subtaskList)

                this.items1 = this.completedTaskArray;
                this.totalRecountCount1 = this.completedTaskArray.length;
                this.totalPage1 = Math.ceil(this.totalRecountCount1 / this.pageSize1);
                this.completedSubtaskList = this.items1.slice(0, this.pageSize1);
                this.endingRecord1 = this.pageSize1;

                this.updateProgress();
            } else {
                this.message1 = "No Data";
                this.showMessage = false;
                this.showMessage1 = true;
                this.completedSubtaskList = undefined;
                //console.log('else');
            }

        } else if (result.error) {
            this.error = result.error;
            this.subtaskList = undefined;
            this.completedSubtaskList = undefined;
        }
    }

    @track array = [];
    //@track subtaskList;
    isDrop = false;
    dropRecordId;
    offset;

    allowDrop(event) {
        this.offset = 0;
        event.preventDefault();
        this.isDrop = true;
        this.array = this.taskArray;
        console.log('Array in taskArray ' + JSON.stringify(this.taskArray));

        this.taskArray.forEach(ele => {
                if (ele.Id) {
                    this.offset++;
                }
            })
            //this.offset = this.taskArray.length;
        console.log('Offset ' + this.offset);
        console.log('Array in allowdrop ' + JSON.stringify(this.array));
    }

    dropElement(event) {
        this.subtaskList = null;
        let recordId = event.dataTransfer.getData('taskData');
        //  console.log('Data recordId:', JSON.stringify(recordId));
        getTask({ 'recordId': recordId })
            .then(data => {
                let obj = {}
                console.log('New Data: ', JSON.stringify(data));
                obj.Title = data.Title__c;
                obj.subcompId = data.Subsidiary_CompetencyId__c;
                obj.startDate = data.Start_Date__c;
                obj.targetDate = data.Target_Date__c;
                obj.Program = data.Program__c;
                obj.progress = data.Progress__c;
                //obj.Assigned_To = '0052w000005yTaM';

                this.array.push(obj);
                console.log('Array ' + JSON.stringify(this.array));
                this.subtaskList = this.array;
                console.log('sub task list 1' + JSON.stringify(this.subtaskList));

            })
            .catch(error => {
                console.log('Error ' + error.message);
            });

    }

    search(Id, myArray) {
        console.log('Id ' + Id + ', Array: ' + JSON.stringify(myArray));
        for (var i = 0; i < myArray.length; i++) {
            console.log('Here')
            if (i == Id) {
                console.log('Found ' + JSON.stringify(myArray[i]));
                return myArray[i];
            }
        }
    }

    handleSave(event) {
        console.log('save clicked');
        if (this.isDrop) {
            const recordInputs = event.detail.draftValues.slice().map(draft => {
                const editedfields = Object.assign({}, draft);

                let index = parseInt(editedfields.Id.slice(4, 5));
                console.log('Index JSON----' + JSON.stringify(index));

                let searchIndex = index + this.offset;
                console.log('Search at: ' + searchIndex);
                var result = this.search(searchIndex, this.subtaskList);

                editedfields.subcompId = this.subcompId;
                editedfields.Title = result.Title;
                editedfields.Program = result.Program;
                editedfields.progress = result.progress;
                //editedfields.Assigned_To = '0052w000005yTaM';
                //console.log('Result' + JSON.stringify(result));

                //this.newArray.push(fields);
                // console.log('newArray ' + JSON.stringify(this.newArray));
                return { editedfields };
            });

            Promise.all(
                recordInputs.map(recordInput => {
                    const fields = {};

                    // console.log('FIELDS IN SAVE RECORDS: : ' + fields);
                    // console.log('NEW FIELDS IN SAVE RECORDS: : ' + JSON.stringify(recordInput));
                    // console.log('NEW FIELDS TITLE IN SAVE RECORDS: : ' + recordInput.editedfields.Title);
                    // console.log('NEW FIELDS START DATE IN SAVE RECORDS: : ' + recordInput.editedfields.startDate);
                    // console.log('NEW FIELDS START DATE IN SAVE RECORDS: : ' + recordInput.editedfields.targetDate);
                    // console.log('NEW FIELDS this.parentId IN SAVE RECORDS: : ' + this.parentId);

                    fields[SUBCOMPID_FIELD.fieldApiName] = recordInput.editedfields.subcompId;
                    fields[TITLE_FIELD.fieldApiName] = recordInput.editedfields.Title;
                    fields[START_DATE_FIELD.fieldApiName] = recordInput.editedfields.startDate;
                    fields[TARGET_DATE_FIELD.fieldApiName] = recordInput.editedfields.targetDate;
                    fields[PROGRAM_FIELD.fieldApiName] = recordInput.editedfields.Program;
                    fields[PROGRESS_FIELD.fieldApiName] = recordInput.editedfields.progress;
                    // fields[ASSIGNED_TO_FIELD.fieldApiName] = recordInput.editedfields.Assigned_To;
                    fields[PARENT_FIELD.fieldApiName] = this.parentId;

                    console.log('FIELDS : ' + JSON.stringify(fields));
                    const record = { apiName: TRACKER_OBJECT.objectApiName, fields };
                    return createRecord(record);
                })).then(results => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Epics Created',
                        variant: 'success'
                    })
                );
                fireEvent(this.pageRef, "editReportUpdate", 'update sub report');
                //this.updateProgress();
                this.draftValues = [];
                this.isDrop = false;
                return refreshApex(this.refreshTable);
            }).catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
            //return refreshApex(this.refreshTable);
        } else if (!(this.isDrop)) {
            console.log('In else if')
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
                    //  this.updateProgress();
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
        recordDetails.completed = this.Completed;
        recordDetails.notCompleted = this.NotCompleted;
        recordDetails.parentId = this.parentId;

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
        console.log('completed ' + this.Completed);
        console.log('not completed ' + (this.Completed + this.NotCompleted));
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
                    //this.draftValues = [];
                console.log('Updated Progress')
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
        this.completedSubtaskList = this.items1.slice(this.startingRecord1, this.endingRecord1);
        this.startingRecord1 = this.startingRecord1 + 1;
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