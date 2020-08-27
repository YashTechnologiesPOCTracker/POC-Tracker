import { LightningElement, wire, track } from 'lwc';
import getSubsidiary from '@salesforce/apex/taskController.getSubsidiary';


export default class ShowSubsidiaryList extends LightningElement {
    selectedSubsidiary;
    isTrue = false;
    @wire(getSubsidiary) subsidiaryList;
    @track name;

    handleClick(event) {

        event.preventDefault();

        this.selectedSubsidiary = event.target.dataset.id;
        this.isTrue = true;
        console.log("test subsidiary id - " + this.selectedSubsidiary);

    }

}