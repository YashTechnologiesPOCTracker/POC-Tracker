import { LightningElement, wire, track, api } from 'lwc';
import getTasks from '@salesforce/apex/taskController.getTasks';
import { refreshApex } from '@salesforce/apex';
import { CurrentPageReference } from 'lightning/navigation';

const columns = [{
        label: 'Id',
        fieldName: 'Id',
        initialWidth: 80
    },
    {
        label: 'Title',
        fieldName: 'Title',
        initialWidth: 240
    },
    {
        label: 'Program',
        fieldName: 'Program',
        initialWidth: 200
    },
    {
        label: 'Start Date',
        fieldName: 'startDate',
        initialWidth: 200
    },
    {
        label: 'Target Date',
        fieldName: 'targetDate',
        initialWidth: 200
    },
    {
        label: 'Assigned To',
        fieldName: 'Assigned_To',
        initialWidth: 200
    },
];



export default class ShowTaskList extends LightningElement {

    @track columns = columns;
    @track compitancyId = '';
    @track taskList;
    refreshTable;
    @api selectedCompitancyId;
    @wire(CurrentPageReference) pageRef;
    @api recordId;
    @api isTaskDataAvilable = false;


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
                newObject.Title = element.Title__c;
                newObject.Program = element.Program__c;
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
            } else {
                this.taskList = [];
                this.isTaskDataAvilable = false;
            }

            console.log(this.isTrue);
            console.log(
                "task " + JSON.stringify(this.taskList)
            );
        } else if (result.error) {
            this.error = result.error;
            this.taskList = undefined;
        }
    }


}