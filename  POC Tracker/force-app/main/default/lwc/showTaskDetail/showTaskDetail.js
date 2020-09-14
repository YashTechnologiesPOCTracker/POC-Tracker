import { LightningElement, api, wire, track } from "lwc";
import { CurrentPageReference, NavigationMixin } from "lightning/navigation";
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { updateRecord } from "lightning/uiRecordApi";
import ID_FIELD from "@salesforce/schema/Tracker__c.Id";
import STATE_FIELD from "@salesforce/schema/Tracker__c.State__c";
import PROGRESS_FIELD from "@salesforce/schema/Tracker__c.Progress__c";
import IS_OVERDUE_FIELD from "@salesforce/schema/Tracker__c.isOverdue__c";
import getTask from '@salesforce/apex/taskController.getCurrentTask';
import subtasks from "@salesforce/apex/taskController.listSubTask";
import getProfile from '@salesforce/apex/taskController.getUserProfile';
import initFiles from "@salesforce/apex/TestFinalShowTaskList.initFiles";
import queryFiles from "@salesforce/apex/TestFinalShowTaskList.queryFiles";
import loadFiles from "@salesforce/apex/TestFinalShowTaskList.loadFiles";

export default class ShowTaskDetail extends NavigationMixin(LightningElement) {
    @wire(CurrentPageReference) pageRef;
    profileName;
    recordId;
    userSubCompId;
    // competencyId;
    recordData;
    showTask = false;
    showEdit = false;
    showSubEpic = false;
    addSubEpic = false;
    showReassigForm = false;
    isDisabled = false;
    //isEmpty = false;
    isLead;
    title;
    state;
    progress;
    isEmpty = false;
    refreshData;
    Completed;
    NotCompleted;
    subName;
    compName;

    connectedCallback() {
        //this.userProfile();
        //console.log('Profile Name' + JSON.stringify(this.profileName));
        let subdata = sessionStorage.getItem('updateSubTaskList');
        console.log('SUBDATA ' + subdata);
        if (subdata != null) {
            this.refreshPage();
        }


        this.recordData = sessionStorage.getItem('recordData');
        let recordState = JSON.parse(this.recordData);

        console.log('RecordData: state ' + recordState);
        this.recordId = recordState.recordId;
        this.userSubCompId = recordState.userSubCompId;
        this.subName = recordState.subName;
        this.compName = recordState.compName;
        this.getCurrentTask(this.recordId);
        console.log('recordId: ' + this.recordId + ' userSubCompId: ' + this.userSubCompId);
        this.getSubTask(this.recordId);
        registerListener('EmptySubList', this.handleCallback, this);
    }

    handleCallback(detail) {
        console.log('handle call back taskdetail ' + detail)
        this.isEmpty = true;
    }

    refreshPage() {
        console.log('in refresh page');
        sessionStorage.removeItem('updateSubTaskList');
        window.location.reload()
    }

    getCurrentTask(recId) {
        getTask({ recordId: recId })
            .then(data => {
                console.log('Data getTask ' + JSON.stringify(data));
                this.title = data.Title__c;
                this.state = data.State__c;
                this.progress = data.Progress__c;

                //this.getSubTask(this.recordId);
                if (this.state === 'Completed') {
                    this.isDisabled = true;
                } else {
                    this.isDisabled = false;
                }
            })
            .catch()
    }

    getSubTask(recId) {
        this.Completed = 0;
        this.NotCompleted = 0;
        subtasks({ parentId: recId })
            .then(data => {

                console.log("data in sub task " + JSON.stringify(data));
                data.forEach(element => {
                    // if (element.State__c === 'Completed') {
                    //     this.Completed++;
                    //     console.log('this.Completed ' + this.Completed)
                    // } else {
                    //     this.NotCompleted++;
                    //     console.log('this.NotCompleted ' + this.NotCompleted)
                    // }
                })
                if (Array.isArray(data) && data.length) {
                    console.log('Non-Empty Sub Task')
                    this.isEmpty = false;
                    // this.hasSubTasks = true;
                    // let p = (this.Completed / (this.Completed + this.NotCompleted)) * 100;
                    // this.progress = p.toFixed(2);
                    // console.log('Progress ' + this.progress);
                } else {
                    this.isEmpty = true;
                    console.log('Empty Sub Task')
                }

            })
            .catch(error => {
                console.log('Error ' + error.message);
            });
    }

    handleSelect(event) {
        const selectedItemValue = event.detail.value;
        if (selectedItemValue === "reassign") {
            this.showReassigForm = true;
        } else if (selectedItemValue === "overdue") {
            this.onOverdue();
        } else {
            this.onClose();
        }
        console.log("selectedItemValue " + selectedItemValue);
    }

    onReassign() {
        this.showReassigForm = false;
        fireEvent(this.pageRef, "updateSubTask", "update");
        this.dispatchEvent(
            new ShowToastEvent({
                title: "Success",
                message: "Epic Reassigned Successfully!",
                variant: "Success"
            })
        );

        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
    }

    onOverdue() {
        //this.getCurrentTask(this.recordId);
        console.log('state:' + this.state);
        if (!(this.state === 'Completed')) {
            const fields = {};
            fields[ID_FIELD.fieldApiName] = this.recordId;
            fields[IS_OVERDUE_FIELD.fieldApiName] = true;
            const recordInput = { fields };
            console.log("Field " + JSON.stringify(fields));
            updateRecord(recordInput)
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: "Success",
                            message: "Overdue Notification Sent!",
                            variant: "Info"
                        })
                    );
                    this.draftValues = [];
                })
                .catch((error) => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: "Error creating record",
                            message: error.body.message,
                            variant: "error"
                        })
                    );
                });
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Error",
                    message: 'Cannot send Overdue Notification for Completed Epic !',
                    variant: "error"
                })
            );
        }

    }

    onClose() {
        console.log('this.isEmpty ' + this.isEmpty)
        if (this.isEmpty) {
            this.closeRecordViaUpdate();
        } else if (!(this.isEmpty) && this.progress === 100) {
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
        console.log("Field close " + JSON.stringify(fields));
        updateRecord(recordInput)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Success",
                        message: "Epic Closed",
                        variant: "success"
                    })
                );
                this.draftValues = [];
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

    handleEpicBack() {
        console.log('back clicked')
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Home'
            }
        });
        sessionStorage.setItem('updateSubTaskList', 'updatefromsubdetail');
    }

    closeModal() {
        this.showTask = false;
        this.showReassigForm = false;
    }

    handleSubUpdate() {
        this.getCurrentTask(this.recordId);
    }
    handleShowSubEpic() {
        console.log("handlesubshow" + JSON.stringify(this.recordData));
        // this.showEdit = false;
        // if (this.profileName === 'Lead') {
        //     this.showSubEpicL = true;
        // } else {
        //     this.showSubEpicH = true;
        // }
        fireEvent(this.pageRef, "refreshSubEpicApex", "Refresh Apex");
        this.showSubEpic = true;
    }

    handleAddSubEpic() {
        this.addSubEpic = true;
    }

    handleEdit() {
        this.showEdit = true;
    }

    handleCloseModal() {
        this.showEdit = false;
    }

    handleUpdateTask() {
        this.showEdit = false;
        console.log('here in edit');
        this.getCurrentTask(this.recordId);
        fireEvent(this.pageRef, "updateReportChart", "Updated");
        fireEvent(this.pageRef, "updateEpicTable", "Updated");
    }

    handleCancel() {
        this.addSubEpic = false;
    }

    handleAdd() {
        console.log("Saved Success");
        this.addSubEpic = false;
        fireEvent(this.pageRef, "subTaskAddedEvent", "Refresh Apex");
        this.getSubTaskForProgress()
        this.isEmpty = false;
    }

    subListCloseHandler() {
        this.showSubEpic = false;
    }

    // subListCloseHandlerH() {
    //     this.showSubEpicH = false;
    // }


    //File Js


    @api defaultNbFileDisplayed;
    @api limitRows;

    @track moreLoaded = true;
    @track loaded = false;
    @track attachments;
    @track totalFiles;
    @track moreRecords;
    @track offset = 0;
    @track fids = '';
    @track sortIcon = 'utility:arrowdown';
    @track sortOrder = 'DESC';
    @track sortField = 'ContentDocument.CreatedDate';
    @track disabled = true;


    title;
    conditions;
    documentForceUrl;

    get DateSorted() {
        return this.sortField == 'ContentDocument.CreatedDate';
    }
    get NameSorted() {
        return this.sortField == 'ContentDocument.Title';
    }
    get SizeSorted() {
        return this.sortField == 'ContentDocument.ContentSize';
    }
    get noRecords() {
        return this.totalFiles == 0;
    }

    // Initialize component

    initRecords() {
        initFiles({ recordId: this.recordId, defaultLimit: this.defaultNbFileDisplayed, sortField: this.sortField, sortOrder: this.sortOrder })
            .then(result => {
                this.fids = '';
                let listAttachments = new Array();
                let contentDocumentLinks = result.contentDocumentLinks;
                this.documentForceUrl = result.documentForceUrl;

                for (var item of contentDocumentLinks) {
                    listAttachments.push(this.calculateFileAttributes(item));
                    if (this.fids != '') this.fids += ',';
                    this.fids += item.ContentDocumentId;
                }

                this.attachments = listAttachments;
                this.totalFiles = result.totalCount;
                this.moreRecords = result.totalCount > 3 ? true : false;

                let nbFiles = listAttachments.length;
                if (this.defaultNbFileDisplayed === undefined) {
                    this.defaultNbFileDisplayed = 3;
                }
                if (this.limitRows === undefined) {
                    this.limitRows = 3;
                }

                this.offset = this.defaultNbFileDisplayed;

                if (result.totalCount > this.defaultNbFileDisplayed) {
                    nbFiles = this.defaultNbFileDisplayed + '+';
                }
                this.title = 'Files (' + nbFiles + ')';

                this.disabled = false;
                this.loaded = true;

            })
            .catch(error => {
                this.showNotification("", "Error", "error");
            });
    }

    calculateFileAttributes(item) {
        let imageExtensions = ['png', 'jpg', 'gif'];
        let supportedIconExtensions = ['ai', 'attachment', 'audio', 'box_notes', 'csv', 'eps', 'excel', 'exe', 'flash', 'folder', 'gdoc', 'gdocs', 'gform', 'gpres', 'gsheet', 'html', 'image', 'keynote', 'library_folder', 'link', 'mp4', 'overlay', 'pack', 'pages', 'pdf', 'ppt', 'psd', 'quip_doc', 'quip_sheet', 'quip_slide', 'rtf', 'slide', 'stypi', 'txt', 'unknown', 'video', 'visio', 'webex', 'word', 'xml', 'zip'];
        item.src = this.documentForceUrl + '/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB120BY90&versionId=' + item.ContentDocument.LatestPublishedVersionId;
        item.size = this.formatBytes(item.ContentDocument.ContentSize, 2);
        item.icon = 'doctype:attachment';

        let fileType = item.ContentDocument.FileType.toLowerCase();
        if (imageExtensions.includes(fileType)) {
            item.icon = 'doctype:image';
        } else {
            if (supportedIconExtensions.includes(fileType)) {
                item.icon = 'doctype:' + fileType;
            }
        }

        return item;
    }

    // Manage Image Preview display if the image is loaded (so File rendition is generated)
    handleLoad(event) {
        let elementId = event.currentTarget.dataset.id;
        console.log("element load id - " + this.elementId);
        const eventElement = event.currentTarget;
        eventElement.classList.remove('slds-hide');
        let dataId = 'lightning-icon[data-id="' + elementId + '"]';

        console.log("element id - " + this.elementId);

        this.template.querySelector(dataId).classList.add('slds-hide');
    }

    openPreview(event) {
        let elementId = event.currentTarget.dataset.id;
        console.log("element preview id - " + this.elementId);

        this[NavigationMixin.Navigate]({
            type: 'standard_namedPage',
            attributes: {
                pageName: 'filePreview'
            },
            state: {
                selectedRecordId: elementId,
                recordIds: this.fids
            }
        })
    }

    openFileRelatedList() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordRelationshipPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'Tracker__c',
                relationshipApiName: 'AttachedContentDocuments',
                actionName: 'view'
            },
        });
    }

    handleUploadFinished(event) {
        var self = this;
        // Get the list of uploaded files
        const uploadedFiles = event.detail.files;
        var contentDocumentIds = new Array();
        for (var file of uploadedFiles) {
            contentDocumentIds.push(file.documentId);
        }
        queryFiles({ recordId: this.recordId, contentDocumentIds: contentDocumentIds })
            .then(result => {
                for (var cdl of result) {
                    self.attachments.unshift(self.calculateFileAttributes(cdl));
                    self.fileCreated = true;
                    this.fids = cdl.ContentDocumentId + (this.fids == '' ? '' : ',' + this.fids);
                }

                self.updateCounters(result.length);
                this.totalFiles += result.length;
            });

    }

    loadMore() {
        this.moreLoaded = false;
        var self = this;
        loadFiles({ recordId: this.recordId, defaultLimit: this.defaultNbFileDisplayed, offset: this.offset, sortField: this.sortField, sortOrder: this.sortOrder })
            .then(result => {
                for (var cdl of result) {
                    self.attachments.push(self.calculateFileAttributes(cdl));
                    self.fileCreated = true;
                    if (this.fids != '') this.fids += ',';
                    this.fids += cdl.ContentDocumentId;
                }

                self.updateCounters(result.length);
                self.moreLoaded = true;
            });
    }

    updateCounters(recordCount) {
        this.offset += recordCount;
        this.moreRecords = this.offset < this.totalFiles;
    }



    handleSort(event) {
        this.disabled = true;

        let selectedValue = event.currentTarget.value;
        if (this.sortField === selectedValue) {
            this.toggleSortOrder();
        }
        this.sortField = selectedValue;
        this.initRecords();
    }

    toggleSortOrder() {
        if (this.sortOrder == 'ASC') {
            this.sortOrder = 'DESC';
            this.sortIcon = 'utility:arrowdown';
        } else {
            this.sortOrder = 'ASC';
            this.sortIcon = 'utility:arrowup';
        }
    }

    formatBytes(bytes, decimals) {
        if (bytes == 0) return '0 Bytes';
        var k = 1024,
            dm = decimals || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    showNotification(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }

}