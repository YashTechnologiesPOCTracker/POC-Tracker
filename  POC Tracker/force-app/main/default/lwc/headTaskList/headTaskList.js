import { LightningElement, wire } from 'lwc';
import getProfile from '@salesforce/apex/taskController.getUserProfile';

export default class HeadTaskList extends LightningElement {

    showSubEpic = false;
    recordId;

    @wire(getProfile) profileName;

    connectedCallback() {
        this.recordId = sessionStorage.getItem('rowId');
    }

    handleShowSubEpic() {
        console.log("handlesubshow" + JSON.stringify(this.recordData));
        this.showEdit = false;
        this.showSubEpic = true;
    }

    subListCloseHandler() {
        this.showSubEpic = false;
    }
}