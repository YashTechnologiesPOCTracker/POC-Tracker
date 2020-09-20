import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getTask from '@salesforce/apex/taskController.getTask';
import userId from "@salesforce/user/Id";
import { refreshApex } from "@salesforce/apex";
import { fireEvent } from 'c/pubsub';
import { CurrentPageReference } from "lightning/navigation";

export default class AddTask extends LightningElement {

    // bShowModal = false;
    currentUserId = userId;
    @api competencyId;
    @api subcompId;
    @wire(CurrentPageReference) pageRef;

    // openModal() {
    //     this.bShowModal = true;
    // }

    closeModal() {
        // const inputFields = this.template.querySelectorAll(
        //     'lightning-input-field'
        // );
        // if (inputFields) {
        //     inputFields.forEach(field => {
        //         field.reset();
        //     });
        // }
        // this.bShowModal = false;
        // return refreshApex(this.createTask());
        console.log('In Add task before close');
        const customEvent = new CustomEvent("closemodal");
        this.dispatchEvent(customEvent);
    }


    connectedCallback() {
        console.log('connected callback')
        console.log('competencyId: ' + this.competencyId + ' ' + 'subcompId: ' + this.subcompId);
    }

    createTask(event) {
        this.recordId = event.detail.id;
        console.log("test" + this.recordId)
        const evt = new ShowToastEvent({
            title: 'Sucess',
            message: 'Epic Successfully Created',
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

        //this.bShowModal = false;

        console.log('In Add task before event');
        const customEvent = new CustomEvent("addevent");
        this.dispatchEvent(customEvent);

        fireEvent(this.pageRef, 'updateReportChart', 'Updated');
    }

    // allowDrop(event) {
    //     event.preventDefault();
    // }

    // dropElement(event) {
    //     this.recordId = event.dataTransfer.getData('taskData');
    //     console.log('Data recordId:', JSON.stringify(this.recordId));
    //     getTask({ 'recordId': this.recordId })
    //         .then(data => {
    //             console.log('Data:', JSON.stringify(data));
    //             this.title = data.Title__c;
    //             this.startDate = data.Start_Date__c;
    //             this.targetDate = data.Target_Date__c;
    //         })
    //         .catch(error => {
    //             console.log('Error ' + error.message);
    //         });
    // }

}