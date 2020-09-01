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
    currentUserId = userId;
    selectedSubsidiaryName = '';
    selectedCompetencyName = '';
    isTaskTrue = false;
    isSubsidiaryTrue = true;
    isCompetencyTrue = false;
    isDataAvailable = false;
    @track subsidiaryList;
    @track competencyList;
    @wire(CurrentPageReference) pageRef;
    // @wire(getSubsidiary) subsidiaryList;

    // search(IdKey, myArray) {
    //     for (var i = 0; i < myArray.length; i++) {
    //         if (myArray[i].SCId === IdKey) {
    //             console.log('Found ' + JSON.stringify(myArray[i]));
    //             return myArray[i];
    //         }
    //     }
    // }

    // connectedCallback() {
    //     console.log("currentUserId " + this.currentUserId);
    //     this.getCompetencyDetails();
    // }

    // getCompetencyDetails() {
    //     getCompetency({ currentUserId: this.currentUserId })
    //         .then((data) => {
    //             this.competencyId = data[0].Id;
    //             this.competencyName = data[0].Name;
    //             this.leadName = data[0].Lead_Name__r.Name;
    //             console.log(
    //                 "get Competency Result " + JSON.stringify(this.competencyId + ' ' + this.competencyName + ' ' + this.leadName)
    //             );
    //             this.competencyList = data;
    //             this.getSubsidiaryDetails();
    //         })
    //         .catch((err) => {
    //             console.log("Error " + err);
    //         });

    // }

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
            console.log("competency " + JSON.stringify(this.competencyList));
        } else if (result.error) {
            this.error = result.error;
            this.competencyList = undefined;
        }
    }

    handleCompetencyClick(event) {
        event.preventDefault();
        // this.selectedCompetencyId = event.target.dataset.id;
        this.selectedCompetencyName = event.target.dataset.name;
        console.log('selectedCompetencyName ' + this.selectedCompetencyName);
        this.isTaskTrue = true;
        this.isCompetencyTrue = false;
        //fireEvent(this.pageRef, "selectedSubIdForReport", this.selectedSubComp);
    }

    handleCompetencyBack(event) {
        this.isCompetencyTrue = false;
        this.isSubsidiaryTrue = true;
        // const customEvent = new CustomEvent("backsubsidiaryevent");
        // this.dispatchEvent(customEvent);
    }

    handleBackCompetency() {
        this.isCompetencyTrue = true;
        this.isTaskTrue = false;
    }

    getSubsidiaryDetails() {
        console.log("Here in getSubsidiary " + this.competencyId);
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
                console.log(
                    "get Subsidiary Result " + JSON.stringify(this.subsidiaryList)
                );
            })
            .catch((err) => {
                console.log("Error " + err);
            });
    }

    handleClick(event) {
        event.preventDefault();
        this.selectedSubComp = event.target.dataset.id;
        this.selectedSubsidiaryName = event.target.dataset.name;
        console.log(
            "selectedSubComp " +
            this.selectedSubComp +
            "selectedSubsidiaryName " +
            this.selectedSubsidiaryName
        );
        this.isCompetencyTrue = true;
        this.isSubsidiaryTrue = false;
        this.isDataAvailable = true;
        //fireEvent(this.pageRef, 'selectedSubIdForReport', this.selectedSubComp);
    }
}