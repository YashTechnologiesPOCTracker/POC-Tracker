import { LightningElement, wire, track } from "lwc";
import getTasks from "@salesforce/apex/taskController.getTasksByEmployee";
import PROGRESS_FIELD from "@salesforce/schema/Tracker__c.Progress__c";
import userId from "@salesforce/user/Id";

import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { CurrentPageReference } from "lightning/navigation";

import { updateRecord } from "lightning/uiRecordApi";
import ID_FIELD from "@salesforce/schema/Tracker__c.Id";


const actions = [
    { label: "Edit", name: "edit" },
];

export default class EmployeeTaskList extends LightningElement {
    currentUserId = userId;
    showEditTask = false;
    @track recordId;
    progress;
    @track PTGName;
    @track taskList;
    @track isDataAvilable = false;
    refreshTable;
    error;
    @wire(CurrentPageReference) pageRef;
    @track columns = [{
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
        {
            label: "Program",
            fieldName: "Program",
        },
        {
            label: "Progress",
            fieldName: "Progress",
            editable: true
        },
        // {
        //     label: "Start_Date",
        //     fieldName: "Start_Date",
        // },
        // {
        //     label: "Target_Date",
        //     fieldName: "Target_Date",
        // },
        {
            type: "action",
            typeAttributes: { rowActions: actions }
        }
    ];

    @wire(getTasks, { currentUserId: "$currentUserId" }) getTaskList(result) {
        this.refreshTable = result;
        if (result.data) {
            let newData;
            newData = result.data;
            this.error = undefined;
            let newArray = [];
            newData.forEach((element) => {
                let newObject = {};
                newObject.Id = element.Id;
                // newObject.Name = element.Name;
                newObject.Title = element.Title__c;
                newObject.Progress = element.Progress__c;
                newObject.Program = element.Program__c;
                newObject.Start_Date = element.Start_Date__c;
                newObject.Target_Date = element.Target_Date__c;
                newObject.State = element.State__c;
                newObject.subsidiaryName = element.Subsidiary_CompetencyId__r.Subsidiary_Name__r.Name;
                newObject.competencyName = element.Subsidiary_CompetencyId__r.Competency_Name__r.Name;
                newArray.push(newObject);
            });
            console.log('employee task array-->>> ' + newArray);
            if (newArray.length) {
                this.taskList = newArray;
                this.isDataAvilable = true;
            } else {
                this.taskList = [];
                this.isDataAvilable = false;
            }

            console.log(
                "taskList from task user list" + JSON.stringify(this.taskList)
            );
        } else if (result.error) {
            this.error = result.error;
            this.taskList = undefined;
        }
    }

    handleRowAction(event) {
        let actionName = event.detail.action.name;
        console.log("actionName " + actionName);
        let row = event.detail.row;
        this.recordId = event.detail.row.Id;
        this.progress = event.detail.row.Progress;
        console.log("Id " + this.recordId);
        switch (actionName) {

            case "edit":
                this.showEditTask = true;
                console.log('Record Id ' + this.recordId);
                break;
            default:
        }
    }


    handleSave(event) {
        const fields = {};
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
        return refreshApex(this.refreshTable);
    }

}