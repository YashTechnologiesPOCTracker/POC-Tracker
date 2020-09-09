import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getTask from '@salesforce/apex/taskController.getTask';
import userId from "@salesforce/user/Id";
import { createRecord } from 'lightning/uiRecordApi'
import TRACKER_OBJECT from '@salesforce/schema/Tracker__c';
import TITLE_FIELD from "@salesforce/schema/Tracker__c.Title__c";
import PROGRAM_FIELD from "@salesforce/schema/Tracker__c.Program__c";
import ASSIGNED_TO_FIELD from "@salesforce/schema/Tracker__c.Assigned_To__c";
import SUBCOMPID_FIELD from "@salesforce/schema/Tracker__c.Subsidiary_CompetencyId__c";
import START_DATE_FIELD from "@salesforce/schema/Tracker__c.Start_Date__c";
import TARGET_DATE_FIELD from "@salesforce/schema/Tracker__c.Target_Date__c";

export default class AddDraggedDataToTask extends LightningElement {

    subcompId = 'a032w000006e5InAAI';
    assignedTo = '0052w000005yTaM'
    tempId;
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
            label: "Start Date",
            fieldName: "startDate",
            editable: true,
            initialWidth: 105
        },
        {
            label: "Target Date",
            fieldName: "targetDate",
            editable: true,
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
        this.subtaskList = null;
        this.tempId = 0;
        this.recordId = event.dataTransfer.getData('taskData');
        console.log('Data recordId:', JSON.stringify(this.recordId));

        //let array = []; row no and index
        getTask({ 'recordId': this.recordId })
            .then(data => {
                let obj = {}
                console.log('New Data: ', JSON.stringify(data));
                obj.title = data.Title__c;
                obj.subcompId = data.Subsidiary_CompetencyId__c;
                obj.startDate = data.Start_Date__c;
                obj.targetDate = data.Target_Date__c;
                obj.Program = data.Program__c;
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

    search(Id, myArray) {
        console.log('Id ' + Id + ', Array: ' + JSON.stringify(myArray));
        for (var i = 0; i < myArray.length; i++) {
            if (i == Id) {
                console.log('Found ' + JSON.stringify(myArray[i]));
                return myArray[i];
            }
        }
    }

    // newArray = [];
    handleSave(event) {
        console.log('save clicked');
        const recordInputs = event.detail.draftValues.slice().map(draft => {
            const editedfields = Object.assign({}, draft);

            let index = parseInt(editedfields.Id.slice(4, 5));
            console.log('Index JSON----' + JSON.stringify(index));

            var result = this.search(index, this.subtaskList);
            editedfields.subcompId = this.subcompId;
            editedfields.title = result.title;
            //console.log('Result' + JSON.stringify(result));


            //this.newArray.push(fields);
            // console.log('newArray ' + JSON.stringify(this.newArray));
            return { editedfields };
        });

        //console.log('record input%%%%%%%%%', recordInputs)
        // const promises = recordInputs.map(recordInput => {
        //     console.log('record input: &&&&', recordInput);
        //     this.createRecords(recordInput);

        // });

        recordInputs.forEach(recordInput => {
            console.log('record input: &&&&', recordInput);
            // this.createRecords(recordInput);
            console.log('DONE!!!');
        })


        Promise.all(promises).then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Epics Created',
                    variant: 'success'
                })
            );
            this.draftValues = [];

        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });

    }

    createRecords(fieldValue) {
        const fields = {};

        // console.log('FIELDS IN SAVE RECORDS: : ' + fields);
        console.log('NEW FIELDS IN SAVE RECORDS: : ' + JSON.stringify(fieldValue));
        console.log('NEW FIELDS TITLE IN SAVE RECORDS: : ' + fieldValue.editedfields.title);
        console.log('NEW FIELDS START DATE IN SAVE RECORDS: : ' + fieldValue.editedfields.startDate);
        console.log('NEW FIELDS START DATE IN SAVE RECORDS: : ' + fieldValue.editedfields.targetDate);

        fields[SUBCOMPID_FIELD.fieldApiName] = fieldValue.editedfields.subcompId;
        fields[TITLE_FIELD.fieldApiName] = fieldValue.editedfields.title;
        fields[START_DATE_FIELD.fieldApiName] = fieldValue.editedfields.startDate;
        fields[TARGET_DATE_FIELD.fieldApiName] = fieldValue.editedfields.targetDate;
        fields[PROGRAM_FIELD.fieldApiName] = 'Hiring';
        fields[ASSIGNED_TO_FIELD.fieldApiName] = this.assignedTo;

        console.log('FIELDS : ' + JSON.stringify(fields));

        const record = { apiName: TRACKER_OBJECT.objectApiName, fields };
        createRecord(record)
            .then(data => {
                console.log('Created RECORD ID: ');
            })
            .catch(error => {
                console.log('Error : ' + JSON.stringify(error));
            });
    }
}