import { api, LightningElement, track, wire } from 'lwc';
import getGeneralProgramTasks from '@salesforce/apex/taskController.getGeneralProgramTasks';
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners } from "c/pubsub";

export default class ShowProgramGeneralEpics extends LightningElement {

    @track programEpicList;
    // @api recordId;
    @wire(CurrentPageReference) pageRef;
    // @wire(getGeneralProgramTasks) programEpicList;
    showTasks = false;
    title;
    program;

    connectedCallback() {
        registerListener("programNameForProgramGeneralEpics", this.handleCall, this);
    }

    handleCall(detail) {
        console.log("in handleCallback " + detail);
        this.program = detail;
        this.title = this.program + ' Epics';
        this.getEpics();
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    getEpics() {
        getGeneralProgramTasks({ program: this.program })
            .then(data => {
                this.programEpicList = data;
                console.log('Data pg epic ' + JSON.stringify(data));
            })
            .catch(error => {
                console.log('Error ' + error)
            })
    }

    handleDragStart(event) {
        console.log('task list ' + JSON.stringify(this.programEpicList));
        let newData = event.target.dataset.item;
        console.log('Id: ' + JSON.stringify(newData));
        event.dataTransfer.setData('taskDataSub ', newData);
    }

    showGeneralTasks() {
        this.showTasks = true;
    }

    closeGeneralTasks() {
        this.showTasks = false;
    }
}