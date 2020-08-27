import { LightningElement, track, wire, api } from 'lwc';
import getCompitancy from '@salesforce/apex/GetSubsidiaryList.getCompitancyBySubsidiaryId';
import { CurrentPageReference } from 'lightning/navigation';
import getTasks from '@salesforce/apex/TestFinalShowTaskList.getTasks';
import { fireEvent } from 'c/pubsub';

export default class ShowCompetencyList extends LightningElement {
    @track compitancyList = [];
    @track isDataAvilable = false;
    @wire(CurrentPageReference) pageRef;
    @api recordId;
    @track competencyId;
    @track displayDiv = false;
    @track selectedCompitancyId;
    isTrueTask = false;


    @wire(getCompitancy, { recordId: "$recordId" }) getCompitancyList(result) {
        this.refreshTable = result;
        if (result.data) {
            let newData;
            newData = result.data;
            this.error = undefined;
            let newArray = [];
            newData.forEach((element) => {
                let newObject = {};
                newObject.Id = element.Id;
                newObject.competencyId = element.Competency_Name__r.Id;
                newObject.Name = element.Name;
                newObject.CompetencyName = element.Competency_Name__r.Name;
                newArray.push(newObject);
            });
            if (newArray.length) {
                this.compitancyList = newArray;
                this.isDataAvilable = true;

            } else {
                this.compitancyList = [];
                this.isDataAvilable = false;
                this.isTrueTask = false;
            }
            console.log(this.isTrue);
            console.log(
                "compitancy " + JSON.stringify(this.compitancyList)
            );
        } else if (result.error) {
            this.error = result.error;
            this.compitancyList = undefined;
        }
    }

    handleClick(event) {
        event.preventDefault();
        this.selectedCompitancyId = event.target.dataset.id;
        console.log("SelectedCompetencyId = " + this.selectedCompitancyId);
        this.isTrueTask = true;
        if (this.competencyId) {
            fireEvent(this.pageRef, 'SCIdFormShowCompList', this.selectedCompitancyId);
        }
    }

}