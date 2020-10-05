import { LightningElement, wire, track } from "lwc";
import getCompetency from "@salesforce/apex/taskController.getPTGNameForLoggedInUser";
import getSubsidiary from "@salesforce/apex/taskController.getSubsidiaryByCompitencyId";
import userId from "@salesforce/user/Id";
import { CurrentPageReference, NavigationMixin } from "lightning/navigation";

export default class ShowSubsidiaryForLoggedInUser extends NavigationMixin(LightningElement) {
    selectedSubComp;
    competencyId;
    leadName;
    competencyName;
    currentUserId = userId;
    selectedSubsidiaryName = '';
    selectedCompetencyName = '';
    isTaskTrue = false;
    isSubsidiaryTrue = true;
    isCompetencyTrue = false;
    isDataAvailable = false;
    @track refreshTable;
    @track subsidiaryList;
    @track competencyList;
    @wire(CurrentPageReference) pageRef;


    connectedCallback() {
        let backValue = sessionStorage.getItem('epicbackclicked');
        if (backValue != null) {
            this.handleBackCompetency(backValue);
        }
    }


    @wire(getCompetency, { currentUserId: "$currentUserId" }) getCompetencyList(
        result
    ) {
        this.refreshTable = result;
        if (result.data) {
            let newData;
            newData = result.data;
            this.competencyId = newData[0].Id;
            this.error = undefined;
            let newArray = [];
            newData.forEach((element) => {
                let newObject = {};
                newObject.competencyId = element.Id;
                newObject.competencyName = element.Name;
                newObject.leadName = element.Lead_Name__r.Name;
                newArray.push(newObject);
            });
            if (newArray.length) {
                this.competencyList = newArray;
                this.getSubsidiaryDetails();
                this.isDataAvailable = true;
            } else {
                this.compitancyList = [];
                this.isDataAvailable = false;
            }
            //  console.log("competency " + JSON.stringify(this.competencyList));
        } else if (result.error) {
            this.error = result.error;
            this.competencyList = undefined;
        }
    }

    handleCompetencyClick(event) {

        this.selectedCompetencyName = event.target.dataset.name;

        let taskData = {};
        taskData.subcompId = this.selectedSubComp;
        taskData.compId = this.competencyId;
        taskData.currentUserId = this.currentUserId;
        taskData.subName = this.selectedSubsidiaryName;
        taskData.compName = this.selectedCompetencyName;

        console.log('task detail ' + taskData)
        sessionStorage.setItem('taskData', JSON.stringify(taskData));

        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'taskList__c'
            }
        });

    }

    handleCompetencyBack(event) {
        this.isCompetencyTrue = false;
        this.isSubsidiaryTrue = true;
        // const customEvent = new CustomEvent("backsubsidiaryevent");
        // this.dispatchEvent(customEvent);
    }

    handleBackCompetency(value) {
        let data = JSON.parse(value);
        this.isCompetencyTrue = true;
        this.isSubsidiaryTrue = false;
        this.isTaskTrue = false;

        this.selectedSubsidiaryName = data.subName;
        this.selectedSubComp = data.subcompId;

        sessionStorage.removeItem('epicbackclicked');
        console.log('selectedSubsidiaryName ' + this.selectedSubsidiaryName + ' subcompId ' + this.selectedSubComp)
    }

    getSubsidiaryDetails() {
        // console.log("Here in getSubsidiary " + this.competencyId);
        getSubsidiary({ competencyId: this.competencyId })
            .then((data) => {
                let newArray = [];
                data.forEach((element) => {
                    let newObj = {};
                    newObj.SCId = element.Id;
                    newObj.SCName = element.Name;
                    newObj.subsidiaryId = element.Subsidiary_Name__r.Id;
                    newObj.subsidiaryName = element.Subsidiary_Name__r.Name;
                    newArray.push(newObj);
                });
                this.subsidiaryList = newArray;
                // console.log(
                //     "get Subsidiary Result " + JSON.stringify(this.subsidiaryList)
                // );
            })
            .catch((err) => {
                console.log("Error " + err);
            });
    }

    handleClick(event) {
        event.preventDefault();
        this.selectedSubComp = event.target.dataset.id;
        this.selectedSubsidiaryName = event.target.dataset.name;
        // console.log(
        //     "selectedSubComp " +
        //     this.selectedSubComp +
        //     "selectedSubsidiaryName " +
        //     this.selectedSubsidiaryName
        // );
        this.isCompetencyTrue = true;
        this.isSubsidiaryTrue = false;
        this.isDataAvailable = true;
        //fireEvent(this.pageRef, 'selectedSubIdForReport', this.selectedSubComp);
    }
}