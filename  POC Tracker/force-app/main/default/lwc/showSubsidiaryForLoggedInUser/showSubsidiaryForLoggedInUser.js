import { LightningElement, wire, track } from "lwc";
import getCompetency from "@salesforce/apex/taskController.getPTGNameForLoggedInUser";
import getSubsidiary from "@salesforce/apex/taskController.getSubsidiaryByCompitencyId";
import userId from "@salesforce/user/Id";
import { CurrentPageReference } from "lightning/navigation";
import { fireEvent } from "c/pubsub";


export default class ShowSubsidiaryForLoggedInUser extends LightningElement {
    selectedSubComp;
    competencyId;
    leadName;
    competencyName;
    isTrue = false;
    currentUserId = userId;
    @track subsidiaryList;
    @wire(CurrentPageReference) pageRef;
    // @wire(getSubsidiary) subsidiaryList;

    handleClick(event) {
        event.preventDefault();
        this.selectedSubComp = event.target.dataset.id;
        this.isTrue = true;
        console.log("##### Selected subsidiary id in show subsidiary for user #####- " + this.selectedSubComp);
        // let resultObject = this.search(this.selectedSubComp, this.subsidiaryList);
        fireEvent(this.pageRef, 'selectedSubIdForReport', this.selectedSubComp);
    }

    search(IdKey, myArray) {
        for (var i = 0; i < myArray.length; i++) {
            if (myArray[i].SCId === IdKey) {
                console.log('Found ' + JSON.stringify(myArray[i]));
                return myArray[i];
            }
        }
    }

    connectedCallback() {
        console.log("currentUserId " + this.currentUserId);
        this.getCompetencyDetails();
    }

    getCompetencyDetails() {
        getCompetency({ currentUserId: this.currentUserId })
            .then((data) => {
                this.competencyId = data[0].Id;
                this.competencyName = data[0].Name;
                this.leadName = data[0].Lead_Name__r.Name;
                console.log(
                    "get Competency Result " + JSON.stringify(this.competencyId + ' ' + this.competencyName + ' ' + this.leadName)
                );
                this.getSubsidiaryDetails();
            })
            .catch((err) => {
                console.log("Error " + err);
            });

    }

    getSubsidiaryDetails() {
        console.log('Here in getSubsidiary ' + this.competencyId);
        getSubsidiary({ competencyId: this.competencyId })
            .then((data) => {
                let newArray = [];
                data.forEach((element) => {
                    let newObj = {};
                    newObj.SCId = element.Id;
                    newObj.SCName = element.Name;
                    newObj.subsidiaryId = element.Subsidiary_Name__r.Id;
                    newObj.subsidiaryName = element.Subsidiary_Name__r.Name;
                    console.log("Subsidiary details: newObj " + JSON.stringify(newObj));
                    newArray.push(newObj);
                });
                this.subsidiaryList = newArray;
                console.log(
                    "get Subsidiary Result " + JSON.stringify(this.subsidiaryList)
                );
            })
            .catch((err) => {
                console.log("Error " + err);
            });

    }
}