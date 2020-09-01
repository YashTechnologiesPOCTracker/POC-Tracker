import { LightningElement, track, wire, api } from 'lwc';
import getCompitancy from '@salesforce/apex/GetSubsidiaryList.getCompitancyBySubsidiaryId';
import getTasks from '@salesforce/apex/TestFinalShowTaskList.getTasks';
import { subscribe } from 'lightning/messageService';

export default class ShowCompetencyList extends LightningElement {
    selectedSubsidiary;
    competencyList;
    taskList;
    selectedCompetencyId;
    isTaskTrue = false;
    isDataAvilable = false;
    isTaskDataAvilable = false;
    isCompetencyTrue = true;
    isTaskTrue = false;
    @api recordId;
    @api selectedSubsidiaryName;
    @api selectedCompetencyName;



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
                this.competencyList = newArray;
                this.isDataAvilable = true;

            } else {
                this.compitancyList = [];
                this.isDataAvilable = false;

            }
            console.log(
                "competency " + JSON.stringify(this.competencyList)
            );
        } else if (result.error) {
            this.error = result.error;
            this.competencyList = undefined;
        }
    }

    handleCompetencyClick(event) {
        event.preventDefault();
        this.selectedCompetencyId = event.target.dataset.id;
        this.selectedCompetencyName = event.target.dataset.name;
        this.isTaskTrue = true;
        this.isCompetencyTrue = false;

    }


    handleCompetencyBack(event) {
        this.isCompetencyTrue = false;
        const customEvent = new CustomEvent("backsubsidiaryevent");
        this.dispatchEvent(customEvent);
    }

    handleBackCompetency() {
        this.isCompetencyTrue = true;
        this.isTaskTrue = false;
    }

}