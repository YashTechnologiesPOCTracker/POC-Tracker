import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import userPTGName from '@salesforce/apex/taskController.getPTGNameForLoggedInUser';
import getTask from '@salesforce/apex/taskController.getTask';
import userId from "@salesforce/user/Id";

export default class AddDraggedDataToTask extends LightningElement {

    bShowModal = false;
    currentUserId = userId;
    competencyId;
    recordId;
    title = '';
    startDate;
    targetDate;
    subcompId;
    @track array = [];
    @track subtaskList;
    @track columns = [
        // {
        //     label: "ID",
        //     fieldName: "Name",
        //     initialWidth: 60
        // },
        {
            label: "Title",
            fieldName: "title",
            editable: true,
            initialWidth: 190
        },
        {
            label: "Program",
            fieldName: "Program",
            initialWidth: 120
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
    ];

    openModal() {
        this.bShowModal = true;
    }

    closeModal() {
        this.bShowModal = false;
    }

    connectedCallback() {
        this.array = [];
    }


    createTask(event) {
        this.recordId = event.detail.id;
        console.log("test" + this.recordId)
        const evt = new ShowToastEvent({
            title: 'Sucess',
            message: 'Task Successfully Created',
            variant: 'success',
        });
        this.dispatchEvent(evt);

        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
        this.bShowModal = false;
        console.log('In Add task before event');
        const customEvent = new CustomEvent("addevent");
        this.dispatchEvent(customEvent);
    }


    allowDrop(event) {
        event.preventDefault();
    }

    dropElement(event) {
        this.recordId = event.dataTransfer.getData('taskData');
        console.log('Data recordId:', JSON.stringify(this.recordId));

        //let array = [];
        getTask({ 'recordId': this.recordId })
            .then(data => {
                let obj = {}
                console.log('New Data: ', JSON.stringify(data));
                obj.title = data.Title__c;
                obj.subcompId = data.Subsidiary_CompetencyId__c;
                obj.startDate = data.Start_Date__c;
                obj.targetDate = data.Target_Date__c;
                obj.program = '';
                obj.Assigned_To = '';


                this.array.push(obj);
                console.log('Array ' + this.array);
                this.subtaskList = this.array;
                console.log('sub task list 1' + JSON.stringify(this.subtaskList));
            })
            .catch(error => {
                console.log('Error ' + error.message);
            });
    }
}