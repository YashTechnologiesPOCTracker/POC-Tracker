import { LightningElement, wire, track, api } from 'lwc';
import getTasks from '@salesforce/apex/taskController.getTasks';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { fireEvent } from "c/pubsub";

const actions = [
    { label: "View", name: "view" },
];

const columns = [
    // {
    //     label: 'Id',
    //     fieldName: 'Name',
    //     initialWidth: 60
    // },
    {
        label: 'Title',
        fieldName: 'Title',
        initialWidth: 220
    },
    {
        label: 'Program',
        fieldName: 'Program',
        initialWidth: 120
    },
    {
        label: 'Progress',
        fieldName: 'progress',
        initialWidth: 110
    },
    {
        label: 'Start Date',
        fieldName: 'startDate',
        initialWidth: 120
    },
    {
        label: 'Target Date',
        fieldName: 'targetDate',
        initialWidth: 120
    },
    {
        label: 'Assigned To',
        fieldName: 'Assigned_To',
        initialWidth: 130
    },
    {
        type: "action",
        typeAttributes: { rowActions: actions }
    }
];

export default class ShowTaskList extends NavigationMixin(LightningElement) {

    @track columns = columns;
    taskList;
    @api recordId;
    isTaskDataAvilable = false;
    @api selectedCompetencyName;
    @api selectedSubsidiaryName;
    @wire(CurrentPageReference) pageRef;


    @wire(getTasks, { recordId: "$recordId" }) getTasks(result) {
        console.log("selectedCompitancyIdShowTask - " + this.recordId);
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
                newObject.progress = element.Progress__c;
                newObject.startDate = element.Start_Date__c;
                newObject.targetDate = element.Target_Date__c;
                if (element.Assigned_To__r.Name) {
                    newObject.Assigned_To = element.Assigned_To__r.Name;
                } else {
                    newObject.Assigned_To = '';
                }
                newArray.push(newObject);
            });
            if (newArray.length) {
                this.taskList = newArray;
                this.isTaskDataAvilable = true;
                this.isTaskTrue = true;
                fireEvent(this.pageRef, "SCIdFormShowCompList", this.recordId);

            } else {
                this.taskList = [];
                this.isTaskDataAvilable = false;
                this.isTaskTrue = true;
            }

            console.log(
                "task " + JSON.stringify(this.taskList)
            );
        } else if (result.error) {
            this.error = result.error;
            this.taskList = undefined;
        }
    }

    handleTaskBack(event) {
        this.isTaskTrue = false;
        const customEvent = new CustomEvent("backcompetencyevent");
        this.dispatchEvent(customEvent);
    }

    handleRowAction(event) {
        let actionName = event.detail.action.name;
        console.log("actionName in tasklist ====> " + actionName);
        let rowId = event.detail.row.Id;
        console.log("Id " + rowId);

        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'taskDetail__c'
            }
        });
        sessionStorage.setItem('rowId', rowId);
    }
}