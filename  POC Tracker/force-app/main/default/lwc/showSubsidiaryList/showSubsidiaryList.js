import { LightningElement, wire, track, api } from 'lwc';
import getSubsidiary from '@salesforce/apex/taskController.getSubsidiary';


export default class ShowSubsidiaryList extends LightningElement {
    @wire(getSubsidiary) subsidiaryList;
    selectedSubsidiary;
    isCompetencyTrue = false;
    isSubsidiaryTrue = true;
    selectedSubsidiaryName;


    handleSubsidiaryClick(event) {
        event.preventDefault();
        this.selectedSubsidiary = event.target.dataset.id;
        this.selectedSubsidiaryName = event.target.dataset.name;
        this.isCompetencyTrue = true;
        this.isSubsidiaryTrue = false;
    }

    handleBackSubsidiary() {
        this.isSubsidiaryTrue = true;
        this.isCompetencyTrue = false;
    }
}