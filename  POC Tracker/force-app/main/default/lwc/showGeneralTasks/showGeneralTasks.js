import { LightningElement, track, api, wire } from 'lwc';
import generalTasks from '@salesforce/apex/taskController.getGeneralTasks'

export default class ShowGeneralTasks extends LightningElement {
    @track taskList;
    @api recordId;
    @wire(generalTasks) taskList;
    showTasks = false;

    handleDragStart(event) {
        console.log('task list ' + JSON.stringify(this.taskList));
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