import { LightningElement } from 'lwc';
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

    openModal() {
        this.bShowModal = true;
    }

    closeModal() {
        this.bShowModal = false;
    }

    connectedCallback() {
        userPTGName({ 'currentUserId': this.currentUserId })
            .then(data => {
                console.log('Data in add task-->>>>>> ' + JSON.stringify(data));
                this.competencyId = data[0].Id;
            })
            .catch(err => {
                console.log('Error ' + error);
            })
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
        getTask({ 'recordId': this.recordId })
            .then(data => {
                console.log('New Data: ', JSON.stringify(data));
                this.title = data.Title__c;
                this.subcompId = data.Subsidiary_CompetencyId__c;
                this.startDate = data.Start_Date__c;
                this.targetDate = data.Target_Date__c;
            })
            .catch(error => {
                console.log('Error ' + error.message);
            });
    }

}