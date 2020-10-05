import { LightningElement, wire, track, api } from "lwc";
import getTasks from "@salesforce/apex/TestFinalShowTaskList.getTasksByUser";
import delSelectedTask from "@salesforce/apex/taskController.deleteTasks";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { CurrentPageReference, NavigationMixin } from "lightning/navigation";
import { fireEvent, registerListener, unregisterAllListeners } from "c/pubsub";
import { updateRecord, createRecord } from "lightning/uiRecordApi";
import ID_FIELD from "@salesforce/schema/Tracker__c.Id";
import TITLE_FIELD from "@salesforce/schema/Tracker__c.Title__c";
import PROGRAM_FIELD from "@salesforce/schema/Tracker__c.Program__c";
import ASSIGNED_TO_FIELD from "@salesforce/schema/Tracker__c.Assigned_To__c";
import PROGRESS_FIELD from "@salesforce/schema/Tracker__c.Progress__c";
import START_DATE_FIELD from "@salesforce/schema/Tracker__c.Start_Date__c";
import TARGET_DATE_FIELD from "@salesforce/schema/Tracker__c.Target_Date__c";
import SUBCOMPID_FIELD from "@salesforce/schema/Tracker__c.Subsidiary_CompetencyId__c";
import TRACKER_OBJECT from '@salesforce/schema/Tracker__c';
import getTask from '@salesforce/apex/taskController.getTask';

const actions = [
    { label: "View", name: "view" },
    { label: "Edit", name: "edit" },
    // { label: "Delete", name: "delete" }
];

export default class ShowTaskListByUser extends NavigationMixin(LightningElement) {
    //@api 
    currentUserId;
    // @api subsidiaryId;
    //@api 
    competencyId;
    //@api 
    subcompId;
    showEditTask = false;
    showTaskDetail = false;
    isDrop = false;
    recordId = '';
    refreshTable;
    error;
    message;
    showMessage = false;
    showMessage1 = false;
    isAddEpic = false;
    isEmpty = false;
    //@track competencyDetail;
    //@api 
    selectedSubName;
    //@api 
    selectedCompName;
    @track taskList;
    @track completedTaskList;
    @wire(CurrentPageReference) pageRef;
    //search = '';

    page = 1;
    items = [];
    items1 = [];
    startingRecord = 1;
    endingRecord = 0;
    pageSize = 5;
    totalRecountCount = 0;
    totalPage = 1;
    page1 = 1;
    items1 = [];
    items1 = [];
    startingRecord1 = 1;
    endingRecord1 = 0;
    pageSize1 = 5;
    totalRecountCount1 = 0;
    totalPage1 = 1;
    taskArray = [];
    disablePrevious = false;
    disableNext = false;
    @track columns = [{
            label: "ID",
            fieldName: "Name",
            initialWidth: 60,
            sortable: "true",
        },
        {
            label: "Title",
            fieldName: "Title",
            editable: true,
            initialWidth: 260,
            sortable: "true",
        },
        {
            label: "Program",
            fieldName: "Program",
            initialWidth: 120,
            sortable: "true",
            //editable: true
        },
        {
            label: "Progress",
            fieldName: "progress",
            initialWidth: 100,
            sortable: "true",
            // editable: true
        },
        {
            label: "Start Date",
            fieldName: "startDate",
            initialWidth: 110,
            editable: true,
            sortable: "true",
        },
        {
            label: "Target Date",
            fieldName: "targetDate",
            initialWidth: 110,
            editable: true,
            sortable: "true",
        },
        // {
        //     label: "Assigned To",
        //     fieldName: "Assigned_To",
        //     initialWidth: 110,
        //     // editable: true
        // },
        {
            type: "action",
            typeAttributes: { rowActions: actions }
        }
    ];

    connectedCallback() {
        // console.log("currentUserId " + this.currentUserId);
        // console.log("subId " + this.subcompId);
        // console.log("selectedSubName " + this.selectedSubName);
        // console.log("selectedCompName " + this.selectedCompName);
        // console.log("competencyId " + this.competencyId);
        // console.log("SEARCH TEXT " + this.search);

        let taskData = sessionStorage.getItem('taskData');
        let newData = JSON.parse(taskData);
        this.subcompId = newData.subcompId;
        this.competencyId = newData.compId;
        this.currentUserId = newData.currentUserId;
        this.selectedSubName = newData.subName;
        this.selectedCompName = newData.compName;
        //console.log('new Data: ' + JSON.stringify(newData));

        let subdata = sessionStorage.getItem('updateSubTaskList');
        // console.log('SUBDATA ' + subdata);
        if (subdata != null) {
            this.refreshPage();
        }
        registerListener("updateEpicTable", this.handle, this);
    }

    refreshPage() {
        // console.log('in refresh page');
        sessionStorage.removeItem('updateSubTaskList');

        // return refreshApex(this.refreshTable);
        window.location.reload()
    }

    @wire(getTasks, { currentUserId: "$currentUserId", subcompId: '$subcompId' }) getTaskList(result) {
        this.taskArray = [];
        var completedTaskArray = [];
        this.refreshTable = result;
        fireEvent(this.pageRef, "viewGeneralEpics", true);
        if (result.data) {
            let newData;
            newData = result.data;
            //console.log('Task Data:::::: ----- ' + JSON.stringify(newData));
            newData.forEach(element => {
                // var State = element.State__c;
                if (element.State__c == 'Completed') {
                    let newObject = {};
                    newObject.Id = element.Id;
                    newObject.Name = element.Name;
                    newObject.Title = element.Title__c;
                    newObject.Program = element.Program__c;
                    newObject.startDate = element.Start_Date__c;
                    newObject.targetDate = element.Target_Date__c;
                    newObject.progress = element.Progress__c;
                    newObject.state = element.State__c;
                    // if (element.Assigned_To__r.Name) {
                    //     newObject.Assigned_To = element.Assigned_To__r.Name;
                    // }
                    completedTaskArray.push(newObject);
                } else {
                    let newObject = {};
                    newObject.Id = element.Id;
                    newObject.Name = element.Name;
                    newObject.Title = element.Title__c;
                    newObject.Program = element.Program__c;
                    newObject.startDate = element.Start_Date__c;
                    newObject.targetDate = element.Target_Date__c;
                    newObject.progress = element.Progress__c;
                    newObject.state = element.State__c;
                    // if (element.Assigned_To__r.Name) {
                    //     newObject.Assigned_To = element.Assigned_To__r.Name;
                    // }
                    this.taskArray.push(newObject);
                }
            });

            if (Array.isArray(this.taskArray) && this.taskArray.length) {
                this.taskList = this.taskArray;
                //console.log('task list ' + JSON.stringify(this.taskList));
                this.showMessage = false;
                //console.log('this.subcompId ' + this.subcompId);
                fireEvent(this.pageRef, "selectedSubIdForReport", this.subcompId);

                this.items = this.taskArray;
                this.totalRecountCount = this.taskArray.length;
                this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);
                this.taskList = this.items.slice(0, this.pageSize);
                //disable previous
                this.disablePrevious = true;
                //console.log('disable previous ' + this.disablePrevious)
                this.ALL_CASES = this.items.slice(0, this.pageSize);
                this.endingRecord = this.pageSize;
                console.log('this.totalPage ' + this.totalPage)
                    // if (this.totalPage === 1) {
                    //     this.disableNext = true;
                    // }
                this.error = undefined;
                // this.showDataReport();
            } else {
                this.message = 'Could Not find any Epic for the Requested Competency';
                this.showMessage = true;
                this.taskList = undefined;
            }

            if (Array.isArray(completedTaskArray) && completedTaskArray.length) {
                this.completedTaskList = completedTaskArray;
                this.showMessage = false;
                //console.log('task list ' + JSON.stringify(this.completedTaskList))
                //fireEvent(this.pageRef, "selectedSubIdForReport", this.subcompId);

                this.items1 = completedTaskArray;
                this.totalRecountCount1 = completedTaskArray.length;
                this.totalPage1 = Math.ceil(this.totalRecountCount1 / this.pageSize1);
                this.completedTaskList = this.items1.slice(0, this.pageSize1);
                //disable previous
                this.disablePrevious = true;
                console.log('this.totalPage1 ' + this.totalPage1)
                    // if (this.totalPage1 === 1) {
                    //     this.disableNext = true;
                    // }
                this.endingRecord1 = this.pageSize1;

                this.error = undefined;
                // this.showDataReport();
            } else {
                this.message = 'Could Not find any Completed Epic for the Requested Competency';
                this.showMessage1 = true;
                this.completedTaskList = undefined;
            }
        } else if (result.error) {
            this.error = result.error;
            this.taskList = undefined;
            this.completedTaskList = undefined;
        }
    }


    handle() {
        return refreshApex(this.refreshTable);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    //code for sorting and filter //
    @track sortBy;
    @track sortDirection;
    ALL_CASES = [];
    value = 'all';


    get options() {
        return [
            { label: 'All', value: 'All' },
            { label: 'Not Started', value: 'Not Started' },
            { label: 'In-Progress', value: 'In-Progress' },
            { label: 'On hold', value: 'On hold' },
        ];
    }

    handleChange(event) {
        // alert('in handle change')
        const inputValue = event.detail.value;
        // console.log('inputValue', inputValue);
        const regex = new RegExp(`^${inputValue}`, 'i');
        this.taskList = this.ALL_CASES.filter(row => regex.test(row.state));
        if (!event.target.value) {
            this.taskList = [...this.ALL_CASES];
        } else if (inputValue === 'All') {
            this.taskList = this.ALL_CASES;
        }
    }


    updateColumnSorting(event) {
        let fieldName = event.detail.fieldName;
        let sortDirection = event.detail.sortDirection;
        //assign the values
        this.sortBy = fieldName;
        this.sortDirection = sortDirection;
        //call the custom sort method.
        this.sortData(fieldName, sortDirection);
    }


    handleSortdata(event) {
        // field name
        this.sortBy = event.detail.fieldName;

        // sort direction
        this.sortDirection = event.detail.sortDirection;

        // calling sortdata function to sort the data based on direction and selected field
        // console.log('DAtA RAVISH DATA DATA =========');
        this.sortData(event.detail.fieldName, event.detail.sortDirection);


    }


    sortData(fieldname, direction) {
        // console.log('DAtA RAVISH DATA DATA =========' + JSON.parse(JSON.stringify(this.taskList)));
        let parseData = JSON.parse(JSON.stringify(this.taskList));


        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction 
        let isReverse = direction === 'asc' ? 1 : -1;
        // sorting data 
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';

            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        // set the sorted data to data table data
        this.taskList = parseData;
    }

    // sorting and filter code ends here //

    handleRowAction(event) {
        let actionName = event.detail.action.name;
        // console.log("actionName ====> " + actionName);
        let row = event.detail.row;
        // console.log('Row Data ' + JSON.stringify(row));
        this.recordId = event.detail.row.Id;
        //console.log("Id " + this.recordId);

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
                // console.log("Record data in from view detail " + JSON.stringify(recordData));
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
                // console.log("Record Id in from edit record " + this.recordId);
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
        //console.log("In delete task");

        currentRecord = currentRow.Id;
        // console.log("currentRecord " + JSON.stringify(currentRecord));
        delSelectedTask({ recordId: currentRow.Id })
            .then((result) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Success!!",
                        message: "Deleted Successfully",
                        variant: "success"
                    })
                );
                fireEvent(this.pageRef, "parentTaskDeleteEvent", 'Parent Task Deleted');
                fireEvent(this.pageRef, 'updateReportChart', 'Updated');
                return refreshApex(this.refreshTable);
            })
            .catch((error) => {
                // console.log("Error ====> " + JSON.stringify(error));
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error!!",
                        message: error.message,
                        variant: "error"
                    })
                );
            });
    }

    @track array = [];
    dropRecordId;
    offset;

    allowDrop(event) {
        this.offset = 0;
        event.preventDefault();
        this.isDrop = true;
        this.array = this.taskArray;
        // console.log('Array in taskArray ' + JSON.stringify(this.taskArray));

        this.taskArray.forEach(ele => {
            if (ele.Id) {
                this.offset++;
            }
        });
        console.log('Offset ' + this.offset);
        //console.log('Array in allowdrop ' + JSON.stringify(this.array));
    }

    dropElement(event) {
        this.taskList = null;
        let recordId = event.dataTransfer.getData('taskData');
        //  console.log('Data recordId:', JSON.stringify(recordId));
        getTask({ 'recordId': recordId })
            .then(data => {
                let obj = {}
                console.log('New Data: ', JSON.stringify(data));
                obj.Title = data.Title__c;
                obj.startDate = data.Start_Date__c;
                obj.targetDate = data.Target_Date__c;
                obj.Program = data.Program__c;

                this.array.push(obj);
                //console.log('Array ' + JSON.stringify(this.array));
                this.taskList = this.array;
                //console.log('sub task list 1' + JSON.stringify(this.taskList));

            })
            .catch(error => {
                console.log('Error ' + error.message);
            });

    }

    search(Id, myArray) {
        //console.log('Id ' + Id + ', Array: ' + JSON.stringify(myArray));
        for (var i = 0; i < myArray.length; i++) {
            //console.log('Here')
            if (i == Id) {
                console.log('Found ' + JSON.stringify(myArray[i]));
                return myArray[i];
            }
        }
    }

    handleSave(event) {
        // console.log('save clicked');
        if (this.isDrop) {
            const recordInputs = event.detail.draftValues.slice().map(draft => {
                const editedfields = Object.assign({}, draft);

                let index = parseInt(editedfields.Id.slice(4, 5));
                // console.log('Index JSON----' + JSON.stringify(index));

                let searchIndex = index + this.offset;
                // console.log('Search at: ' + searchIndex);
                var result = this.search(searchIndex, this.taskList);

                editedfields.subcompId = this.subcompId;
                editedfields.Title = result.Title;
                editedfields.Program = result.Program;
                if (!(editedfields.startDate)) {
                    editedfields.startDate = result.startDate;
                }
                if (!(editedfields.targetDate)) {
                    editedfields.targetDate = result.targetDate;
                }

                //console.log('Result' + JSON.stringify(result));
                return { editedfields };
            });

            Promise.all(
                recordInputs.map(recordInput => {
                    const fields = {};

                    fields[SUBCOMPID_FIELD.fieldApiName] = this.subcompId;
                    fields[TITLE_FIELD.fieldApiName] = recordInput.editedfields.Title;
                    fields[START_DATE_FIELD.fieldApiName] = recordInput.editedfields.startDate;
                    fields[TARGET_DATE_FIELD.fieldApiName] = recordInput.editedfields.targetDate;
                    fields[PROGRAM_FIELD.fieldApiName] = recordInput.editedfields.Program;

                    // console.log('FIELDS : ' + JSON.stringify(fields));
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
                fireEvent(this.pageRef, 'updateReportChart', 'Updated');
                this.draftValues = [];
                this.isDrop = false;
                return refreshApex(this.refreshTable);
            }).catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating Epic record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
            //return refreshApex(this.refreshTable);
        } else if (!(this.isDrop)) {
            //  console.log('In else if')

            const recordInputs = event.detail.draftValues.slice().map(draft => {
                const fields = Object.assign({}, draft);
                //console.log('update record1 value ' + JSON.stringify(fields));
                return { fields };
            });

            Promise.all(
                recordInputs.map(recordInput => {
                    const fields = {};
                    fields[ID_FIELD.fieldApiName] = recordInput.fields.Id;
                    fields[TITLE_FIELD.fieldApiName] = recordInput.fields.Title;
                    fields[START_DATE_FIELD.fieldApiName] = recordInput.fields.startDate;
                    fields[TARGET_DATE_FIELD.fieldApiName] = recordInput.fields.targetDate;
                    const record = { fields };
                    // console.log('update record value ' + JSON.stringify(fields));
                    return updateRecord(record)
                })
            ).then(data => {
                fireEvent(this.pageRef, 'updateReportChart', 'Updated');
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Epics Updated',
                        variant: 'success'
                    })
                );
                this.draftValues = [];

                return refreshApex(this.refreshTable);
            }).catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error Updating Epics",
                        message: error.body.message,
                        variant: "error"
                    })
                );
            });
        }
    }


    previousHandler() {
        this.disableNext = false;
        if (this.page > 1) {
            this.disablePrevious = false;
            //console.log('disable previous: not equal' + this.disablePrevious)
            this.page = this.page - 1;
            this.displayRecordPerPage(this.page);
        }
    }

    nextHandler() {
        this.disablePrevious = false;
        if ((this.page < this.totalPage) && this.page !== this.totalPage) {
            this.page = this.page + 1;
            this.disableNext = false;
            console.log('disable next: not equal' + this.disableNext + this.page + this.totalPage)
            this.displayRecordPerPage(this.page);
        }
    }

    displayRecordPerPage(page) {
        if (this.page == 1) {
            this.disablePrevious = true;
            //console.log('disable previous: equal' + this.disablePrevious)
        }
        if (this.page === this.totalPage) {
            this.disableNext = true;
            console.log('disable next: equal' + this.disableNext)
        }

        this.startingRecord = ((page - 1) * this.pageSize);
        this.endingRecord = (this.pageSize * page);
        this.endingRecord = (this.endingRecord > this.totalRecountCount) ?
            this.totalRecountCount : this.endingRecord;

        this.taskList = this.items.slice(this.startingRecord, this.endingRecord);
        this.ALL_CASES = this.items.slice(this.startingRecord, this.endingRecord);

        //this.completedTaskList = this.items1.slice(this.startingRecord, this.endingRecord);
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
        if (this.page1 == 1) {
            this.disablePrevious = true;
            //console.log('disable previous: equal' + this.disablePrevious)
        }
        if (this.page1 === this.totalPage1) {
            this.disableNext = true;
            //console.log('disable next: equal' + this.disableNext)
        }

        this.startingRecord1 = ((page1 - 1) * this.pageSize1);
        this.endingRecord1 = (this.pageSize1 * page1);
        this.endingRecord1 = (this.endingRecord1 > this.totalRecountCount1) ?
            this.totalRecountCount1 : this.endingRecord1;

        //this.taskList = this.items.slice(this.startingRecord, this.endingRecord);
        this.completedTaskList = this.items1.slice(this.startingRecord1, this.endingRecord1);
        this.startingRecord1 = this.startingRecord1 + 1;
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
        // const customEvent = new CustomEvent("backcompetencyevent");
        // this.dispatchEvent(customEvent);
        let backData = {};
        backData.subName = this.selectedSubName;
        backData.subcompId = this.subcompId;
        sessionStorage.setItem('epicbackclicked', JSON.stringify(backData));

        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Home'
            }
        });
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