import { LightningElement, wire, api, track } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import getTask from '@salesforce/apex/taskController.getCurrentTask';
import getSubsidiaryCompetencyDetail from '@salesforce/apex/taskController.getSubsidiaryCompitancyDetail';
import { fireEvent } from 'c/pubsub';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { updateRecord } from "lightning/uiRecordApi";
import ID_FIELD from "@salesforce/schema/Tracker__c.Id";
import STATE_FIELD from "@salesforce/schema/Tracker__c.State__c";
import PROGRESS_FIELD from "@salesforce/schema/Tracker__c.Progress__c";
import IS_ESCALATED_FIELD from "@salesforce/schema/Tracker__c.isEscalated__c";
import subtasks from "@salesforce/apex/taskController.listSubTask";
import getSubTask from "@salesforce/apex/taskController.getSubTask";
import getProfile from '@salesforce/apex/taskController.getUserProfile';

export default class ShowSubTaskDetail extends NavigationMixin(LightningElement) {

    @wire(CurrentPageReference) pageRef;

    @api recordId;
    recordData;
    showEdit = false;
    showReassigForm = false;
    // isDisabledReassign = false;
    // isDisabledOverdue = false;
    // isDisabledClose = false;
    isDisabled = false;
    addSubEpic = false;
    showSubEpic = false;
    hasSubTasks = false;
    state;
    progress;
    program;
    title;
    subName;
    compName;
    parentTitle;
    epic;
    Completed;
    NotCompleted;
    total;
    parentId;
    subcompId;
    recordIdArray = [];
    parentIdArray = [];
    completedArray = [];
    notCompletedArray = [];
    index;
    backClicked = 0;
    markedAsComplete = false;

    connectedCallback() {
        this.index = 0;

        let data = sessionStorage.getItem('subRecordData');
        let recordData = JSON.parse(data);
        this.recordId = recordData.recordId;
        this.Completed = recordData.completed;
        this.NotCompleted = recordData.notCompleted;
        this.parentId = recordData.parentId;
        //console.log('this.Completed:cccc ' + this.Completed)
        //console.log('this.NotCompleted:cc ' + this.NotCompleted)
        //this.total = (this.Completed + this.NotCompleted);

        this.recordIdArray.push(this.recordId);
        this.parentIdArray.push(this.parentId);
        this.completedArray.push(this.Completed);
        this.notCompletedArray.push(this.NotCompleted)
            //this.subTaskForProgressUpdate(this.recordId);
        this.getCurrentTask(this.recordId);
        this.getProfileData();
    }

    handleSelect(event) {
        const selectedItemValue = event.detail.value;
        if (selectedItemValue === "reassign") {
            this.handleReassign();
        } else if (selectedItemValue === "escalate") {
            this.onOverdue();
        } else {
            this.onClose();
        }
        // console.log("selectedItemValue " + selectedItemValue);
    }

    getCurrentTask(recId) {
        getTask({ recordId: recId })
            .then(data => {
                // console.log('Data getTask ' + JSON.stringify(data));
                this.title = data.Title__c;
                this.state = data.State__c;
                this.progress = data.Progress__c;
                this.program = data.Program__c;
                this.subcompId = data.Subsidiary_CompetencyId__c;
                this.parentTitle = data.Parent_Task__r.Title__c;
                // console.log('state:' + this.state + ' progress ' + this.progress + ' subcomp ' + this.subcompId);
                if (this.state === 'Completed') {
                    // this.isDisabledReassign = true;
                    // this.isDisabledOverdue = true;
                    // this.isDisabledClose = true;
                    this.isDisabled = true;
                } else {
                    // this.isDisabledReassign = false;
                    // this.isDisabledOverdue = false;
                    // this.isDisabledClose = false;
                    this.isDisabled = false;
                }
                // console.log('CURRENT COMPLETED TASKS ^^^^ ' + this.Completed + 'INDEX: ' + this.index);
                // if (this.markedAsComplete == true && this.backClicked > 0) {
                //     console.log('INCREMENTING PROGRESS');
                //     this.Completed++;
                //     this.markedAsComplete = false;
                //     this.updateParent();
                // }
                this.subTaskForProgressUpdate(this.recordId);
                fireEvent(this.pageRef, 'programNameForProgramGeneralEpics', this.program);
                this.getSubsidiaryCompetency(this.subcompId);
                //this.getSubTask(this.recordId);
                //this.onClose();
                //const promise = this.template.querySelector("c-recursive-task-list").childCall();
            })
            .catch()
    }

    getSubsidiaryCompetency(subcompId) {
        getSubsidiaryCompetencyDetail({ subcompId: subcompId }).then(data => {
            //console.log("subcomp data " + JSON.stringify(data));
            this.subName = data[0].Subsidiary_Name__r.Name;
            this.compName = data[0].Competency_Name__r.Name;
        }).catch()
    }

    // getSubTask(recId) {
    //     subtasks({ parentId: recId })
    //         .then(data => {
    //             if (Array.isArray(data) && data.length) {
    //                 console.log('Non-Empty Sub Task')
    //                 this.hasSubTasks = true;
    //             } else {
    //                 this.hasSubTasks = false;
    //                 console.log('Empty Sub Task')
    //             }
    //         })
    //         .catch(error => {
    //             console.log('Error ' + error.message);
    //         });
    // }

    subTaskForProgressUpdate(recId) {
        this.Completed = 0;
        this.NotCompleted = 0;
        getSubTask({ parentId: recId })
            .then(data => {
                data.forEach(element => {
                    if (element.State__c === 'Completed') {
                        this.Completed++;
                    } else {
                        this.NotCompleted++;
                    }
                });

                if (Array.isArray(data) && data.length) {
                    //  console.log('Non-Empty Sub Task')
                    this.hasSubTasks = true;
                    // console.log('Completed: ' + this.Completed);
                    // console.log('NotCompleted: ' + this.NotCompleted);

                    let total = (this.Completed + this.NotCompleted);
                    let aggPercentage = (this.Completed / total) * 100;

                    const fields = {};
                    fields[ID_FIELD.fieldApiName] = this.recordId;
                    fields[PROGRESS_FIELD.fieldApiName] = aggPercentage;

                    const recordInput = { fields };
                    updateRecord(recordInput)
                        .then(() => {
                            //  console.log('Progress Updated: Progress for RECORD ' + aggPercentage);
                        })
                        .catch((error) => {});
                } else {
                    this.hasSubTasks = false;
                    // console.log('Empty Sub Task')
                }

            })
            .catch(error => {
                console.log('Error ' + error.message);
            });
    }

    handleRecursiveListCall(event) {
        //  console.log('event details ' + event.detail);
        let recordDetail = event.detail;
        //  console.log('Recursive record details ' + recordDetail);

        this.recordIdArray.push(recordDetail.recordId);
        this.parentIdArray.push(recordDetail.parentId);
        this.completedArray.push(recordDetail.Completed);
        this.notCompletedArray.push(recordDetail.NotCompleted);
        this.index++;
        // console.log('Recursive record details: recordIdArray Array Values ' + JSON.stringify(this.recordIdArray));
        // console.log('Recursive record details: parentIdArray Array Values ' + JSON.stringify(this.parentIdArray));
        // console.log('Recursive record details: CompletedArray Array Values ' + JSON.stringify(this.completedArray));
        // console.log('Recursive record details: notCompletedArray Array Values ' + JSON.stringify(this.notCompletedArray) +
        //     ' index%%%%%%%%%%%%%% ' + this.index);

        this.recordId = recordDetail.recordId;
        this.parentId = recordDetail.parentId;
        this.Completed = recordDetail.Completed;
        this.NotCompleted = recordDetail.NotCompleted;

        // console.log('Current Recursive record details: Completed Value ' + this.Completed);
        // console.log('Current Recursive record details: NotCompleted Value ' + this.NotCompleted);
        this.total = this.Completed + this.NotCompleted;
        //console.log(this.total);
        this.showSubEpic = false;
        this.getCurrentTask(this.recordId);
    }

    handleRecursiveBack() {
        this.index--;
        //console.log('back clicked handle recursive back ???????? ' + this.backClicked);
        // console.log('Recursive record details: recordIdArray Array Values ' + JSON.stringify(this.recordIdArray));
        // console.log('Recursive record details: parentIdArray Array Values ' + JSON.stringify(this.parentIdArray));
        // console.log('Recursive record details: CompletedArray Array Values ' + JSON.stringify(this.completedArray));
        // console.log('Recursive record details: notCompletedArray Array Values ' + JSON.stringify(this.notCompletedArray) + ' index%% ' + this.index);

        if (this.backClicked == 0) {
            this.recordIdArray.pop();
            this.parentIdArray.pop();
            this.completedArray.pop();
            this.notCompletedArray.pop();
            this.backClicked++;
        }
        // console.log('back clicked ' + this.backClicked);

        this.recordId = this.recordIdArray.pop();
        this.parentId = this.parentIdArray.pop();
        this.Completed = this.completedArray.pop();
        this.NotCompleted = this.notCompletedArray.pop();
        this.showSubEpic = false;
        this.total = this.Completed + this.NotCompleted;
        //console.log('r id: ' + this.recordId + ', p id: ' + this.parentId + 'Total ' + this.total);

        // console.log('Recursive record details: recordIdArray Array Values after ' + JSON.stringify(this.recordIdArray));
        // console.log('Recursive record details: parentIdArray Array Values after ' + JSON.stringify(this.parentIdArray));
        // console.log('Recursive record details: CompletedArray Array Values after ' + JSON.stringify(this.completedArray));
        // console.log('Recursive record details: notCompletedArray Array Values after ' + JSON.stringify(this.notCompletedArray) + ' index%% ' + this.index);

        // console.log('Current Recursive record details: Completed Value ' + this.Completed);
        // console.log('Current Recursive record details: NotCompleted Value ' + this.NotCompleted);

        this.getCurrentTask(this.recordId);
    }

    handleAddSubEpic() {
        this.addSubEpic = true;
        this.template.querySelector("c-create-sub-tasks").checkConfirmationNeccessity();
    }

    handleAdd() {
        //  console.log("Saved Success");
        fireEvent(this.pageRef, 'recSubTaskAdded', 'Refresh Apex in rec. list')
        this.addSubEpic = false;
    }

    handleCancel() {
        this.addSubEpic = false;
    }

    handleSubUpdate() {
        fireEvent(this.pageRef, "refreshApexBackClicked", "back clicked from sub task detail");
        this.getCurrentTask(this.recordId);
    }

    handleShowSubEpic() {
        this.showSubEpic = true;
    }

    subListCloseHandler() {
        this.showSubEpic = false;
    }

    onReassign() {
        this.showReassigForm = false;
        fireEvent(this.pageRef, "updateSubTask", "update");
    }

    onOverdue() {
        //this.getCurrentTask(this.recordId);
        //  console.log('state:' + this.state);
        if (!(this.state === 'Completed')) {
            const fields = {};
            fields[ID_FIELD.fieldApiName] = this.recordId;
            fields[IS_ESCALATED_FIELD.fieldApiName] = true;
            const recordInput = { fields };
            console.log("Field " + JSON.stringify(fields));
            updateRecord(recordInput)
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: "Success",
                            message: "Escalation Notification Sent!",
                            variant: "Info"
                        })
                    );
                    this.draftValues = [];
                })
                .catch((error) => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: "Error Sending Escalation Notification",
                            message: error.body.message,
                            variant: "error"
                        })
                    );
                });
        }
    }

    onClose() {
        if (!(this.hasSubTasks)) {
            this.closeRecordViaUpdate();
        } else if (this.hasSubTasks && this.progress === 100) {
            this.closeRecordViaUpdate();
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Error",
                    message: 'Cannot Close Epic untill all Sub Epics are Completed !',
                    variant: "error"
                })
            );
        }
    }

    closeRecordViaUpdate() {
        const fields = {};
        // console.log("Field close " + JSON.stringify(fields));
        // console.log("Field close " + this.recordId);
        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[STATE_FIELD.fieldApiName] = "Completed";
        fields[PROGRESS_FIELD.fieldApiName] = 100;
        const recordInput = { fields };

        //console.log("Field close " + JSON.stringify(fields));
        updateRecord(recordInput)
            .then(() => {
                this.Completed++;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Success",
                        message: "Epic Closed",
                        variant: "success"
                    })
                );
                this.draftValues = [];
                this.updateParent();
                this.handleUpdateTask();
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Epic cannot be closed",
                        message: error.body.message,
                        variant: "error"
                    })
                );
            });
    }

    // updateEditProgress() {
    //     const fields = {};
    //     // console.log("Field close " + JSON.stringify(fields));
    //     // console.log("Field close " + this.recordId);
    //     fields[ID_FIELD.fieldApiName] = this.recordId;
    //     fields[STATE_FIELD.fieldApiName] = "Completed";
    //     fields[PROGRESS_FIELD.fieldApiName] = 100;
    //     const recordInput = { fields };
    //     console.log("Field close " + JSON.stringify(fields));
    //     updateRecord(recordInput)
    //         .then(() => {
    //             this.Completed++;
    //             console.log('this.Completed++: ' + this.Completed)
    //             this.dispatchEvent(
    //                 new ShowToastEvent({
    //                     title: "Success",
    //                     message: "Epic Closed",
    //                     variant: "success"
    //                 })
    //             );
    //             this.draftValues = [];
    //             this.updateParent();
    //         })
    //         .catch((error) => {
    //             this.dispatchEvent(
    //                 new ShowToastEvent({
    //                     title: "Error creating record",
    //                     message: error.body.message,
    //                     variant: "error"
    //                 })
    //             );
    //         });

    // }


    updateParent() {
        const fields = {};
        //let total = this.Completed + this.NotCompleted;
        let p = (this.Completed / (this.total)) * 100;
        let aggregateProgress = p.toFixed(2)
            // console.log('this.Completed: ' + this.Completed)
            // console.log('Total: ' + (this.total))
            // console.log('Agg Progress: ' + aggregateProgress)

        fields[ID_FIELD.fieldApiName] = this.parentId;
        fields[PROGRESS_FIELD.fieldApiName] = aggregateProgress;

        const recordInput = { fields };
        updateRecord(recordInput)
            .then(() => {
                this.markedAsComplete = true;
                //console.log('Parent Updated')
            })
            .catch((error) => {});
    }

    handleUpdateTask() {
        this.showEdit = false;
        //console.log('here in edit ' + this.recordId);
        this.getCurrentTask(this.recordId);
        //this.updateEditProgress();
        fireEvent(this.pageRef, "updateReportChart", "Updated");
        // fireEvent(this.pageRef, "updateSubTask", "update");
    }

    handleEdit() {
        this.showEdit = true;
    }

    handleReassign() {
        if (!(this.state === 'Completed')) {
            this.showReassigForm = true;
        }
    }

    handleCloseModal() {
        this.showEdit = false;
        this.showReassigForm = false;
    }

    // closeModal() {
    //     const customEvent = new CustomEvent('closesubtaskdetail');
    //     this.dispatchEvent(customEvent);
    // }
    profileName;

    getProfileData() {
        getProfile()
            .then(data => {
                this.profileName = data;
                //  console.log('profileName in subreport ' + this.profileName);
            })
            .catch(error => {
                console.log('Error ' + error);
            })
    }

    isLead = false;
    handleSubEpicBack() {
        // fireEvent(this.pageRef, "updateSubTask", "update");
        //console.log('Back clicked reload page')
        if (this.profileName === 'Lead') {
            this.isLead = true;
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'taskDetail__c'
                }
            });
        } else if ('Community Employee') {
            this.isLead = false;
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'Employee_Task_Detail__c'
                }
            });
        }

        sessionStorage.setItem('updateSubTaskList', 'updatefromsubdetail');
        // console.log('Back Clicked')
    }

}