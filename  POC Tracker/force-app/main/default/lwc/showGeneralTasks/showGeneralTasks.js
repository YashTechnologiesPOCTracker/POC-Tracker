import { LightningElement, track, api, wire } from 'lwc';
import generalTasks from '@salesforce/apex/taskController.getGeneralTasks'
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners } from "c/pubsub";

export default class ShowGeneralTasks extends LightningElement {
    //@track taskList;


    @track acceleratorList;
    @track deliverySupportList;
    @track hiringList;
    @track labList;
    @track researchList;
    @track serviceLineSupportList;
    @track trainingList;


    @track isDataAvilableAcceleratorList = false;
    @track isDataAvilableDeliverySupportList = false;
    @track isDataAvilableHiringList = false;
    @track isDataAvilableLabList = false;
    @track isDataAvilableserviceResearchList = false;
    @track isDataAvilableserviceLineSupport = false;
    @track isDataAvilableTrainingList = false;



    @track ProgramAcceleratorList;
    @api recordId;
    @wire(CurrentPageReference) pageRef;
    showTasks = false;
    viewButton = false;

    connectedCallback() {
        registerListener("viewGeneralEpics", this.handleCall, this);
    }

    handleCall(detail) {
        console.log("in handleCallback " + detail);
        this.viewButton = true;
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    @wire(generalTasks) getTaskList(result) {
        var acceleratorArray = [];
        var deliverySupportArray = [];
        var hiringArray = [];
        var labArray = [];
        var researchArray = [];
        var serviceLineSupportArray = [];
        var trainingArray = [];


        if (result.data) {
            let newData;
            newData = result.data;
            console.log('Task Data:::::: ----- ' + JSON.stringify(newData));
            newData.forEach(element => {


                var programStatus = element.Program__c;

                console.log(' programStatus TYPE TYPE:::::: ----- ' + programStatus);

                if (element.Program__c === 'Accelerator') {
                    let newObject = {};
                    newObject.Id = element.Id;
                    newObject.Name = element.Name;
                    newObject.Title = element.Title__c;
                    newObject.Program = element.Program__c;
                    newObject.Start_Date = element.Start_Date__c;
                    newObject.Target_Date = element.Target_Date__c;
                    acceleratorArray.push(newObject);


                    if (acceleratorArray.length) {

                        this.isDataAvilableAcceleratorList = true;
                    } else {

                        this.isDataAvilableAcceleratorList = false;
                    }


                } else if (element.Program__c === 'Hiring') {
                    let newObject = {};
                    newObject.Id = element.Id;
                    newObject.Name = element.Name;
                    newObject.Title = element.Title__c;
                    newObject.Program = element.Program__c;
                    newObject.Start_Date = element.Start_Date__c;
                    newObject.Target_Date = element.Target_Date__c;
                    hiringArray.push(newObject);

                    if (hiringArray.length) {

                        this.isDataAvilableHiringList = true;
                    } else {

                        this.isDataAvilableHiringList = false;
                    }

                } else if (element.Program__c === 'Delivery Support') {
                    let newObject = {};
                    newObject.Id = element.Id;
                    newObject.Name = element.Name;
                    newObject.Title = element.Title__c;
                    newObject.Program = element.Program__c;
                    newObject.Start_Date = element.Start_Date__c;
                    newObject.Target_Date = element.Target_Date__c;
                    deliverySupportArray.push(newObject);

                    if (deliverySupportArray.length) {

                        this.isDataAvilableDeliverySupportList = true;
                    } else {

                        this.isDataAvilableDeliverySupportList = false;
                    }


                } else if (element.Program__c === 'Lab') {
                    let newObject = {};
                    newObject.Id = element.Id;
                    newObject.Name = element.Name;
                    newObject.Title = element.Title__c;
                    newObject.Program = element.Program__c;
                    newObject.Start_Date = element.Start_Date__c;
                    newObject.Target_Date = element.Target_Date__c;
                    labArray.push(newObject);

                    if (labArray.length) {

                        this.isDataAvilableLabList = true;
                    } else {

                        this.isDataAvilableLabList = false;
                    }


                } else if (element.Program__c === 'Research') {
                    let newObject = {};
                    newObject.Id = element.Id;
                    newObject.Name = element.Name;
                    newObject.Title = element.Title__c;
                    newObject.Program = element.Program__c;
                    newObject.Start_Date = element.Start_Date__c;
                    newObject.Target_Date = element.Target_Date__c;
                    researchArray.push(newObject);

                    if (researchArray.length) {

                        this.isDataAvilableserviceResearchList = true;
                    } else {

                        this.isDataAvilableserviceResearchList = false;
                    }


                } else if (element.Program__c === 'ServiceLine Support') {
                    let newObject = {};
                    newObject.Id = element.Id;
                    newObject.Name = element.Name;
                    newObject.Title = element.Title__c;
                    newObject.Program = element.Program__c;
                    newObject.Start_Date = element.Start_Date__c;
                    newObject.Target_Date = element.Target_Date__c;
                    serviceLineSupportArray.push(newObject);

                    if (serviceLineSupportArray.length) {

                        this.isDataAvilableserviceLineSupport = true;
                    } else {

                        this.isDataAvilableserviceLineSupport = false;
                    }



                } else if (element.Program__c === 'Training') {
                    console.log('INSIDE MOVE TRINING');
                    let newObject = {};
                    newObject.Id = element.Id;
                    newObject.Name = element.Name;
                    newObject.Title = element.Title__c;
                    newObject.Program = element.Program__c;
                    newObject.Start_Date = element.Start_Date__c;
                    newObject.Target_Date = element.Target_Date__c;
                    trainingArray.push(newObject);

                    if (trainingArray.length) {

                        this.isDataAvilableTraining = true;
                    } else {

                        this.isDataAvilableTraining = false;
                    }

                }
            })
        }

        this.acceleratorList = acceleratorArray;
        this.hiringList = hiringArray;
        this.deliverySupportList = deliverySupportArray;
        this.labList = labArray;
        this.researchList = researchArray;
        this.serviceLineSupportList = serviceLineSupportArray;
        this.trainingList = trainingArray;


    }

    handleDragStart(event) {
        console.log('task list ======== ' + JSON.stringify(this.taskList));
        let newData = event.target.dataset.item;
        console.log('Id: ' + JSON.stringify(newData));
        event.dataTransfer.setData('taskData', newData);
    }

    showGeneralTasks() {
        this.showTasks = true;
    }

    closeGeneralTasks() {
        this.showTasks = false;
    }

}