import { LightningElement, wire, api, track } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import getTask from '@salesforce/apex/taskController.getCurrentTask';
import { fireEvent } from 'c/pubsub';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { updateRecord } from "lightning/uiRecordApi";
import ID_FIELD from "@salesforce/schema/Tracker__c.Id";
import STATE_FIELD from "@salesforce/schema/Tracker__c.State__c";
import PROGRESS_FIELD from "@salesforce/schema/Tracker__c.Progress__c";
import IS_OVERDUE_FIELD from "@salesforce/schema/Tracker__c.isOverdue__c";
import IS_REASSIGN_FIELD from "@salesforce/schema/Tracker__c.IsReassign__c";

import initFiles from "@salesforce/apex/TestFinalShowTaskList.initFiles";
import queryFiles from "@salesforce/apex/TestFinalShowTaskList.queryFiles";
import loadFiles from "@salesforce/apex/TestFinalShowTaskList.loadFiles";


export default class ShowSubTaskDetail extends NavigationMixin(LightningElement) {

    @wire(CurrentPageReference) pageRef;
    //@api recordId;
    recordId;
    recordData;
    showEdit = false;
    showReassigForm = false;
    isDisabledReassign = false;
    isDisabledOverdue = false;
    isDisabledClose = false;
    state;
    progress;
    title;
    subName;
    compName;
    epic;
    Completed;
    NotCompleted;
    total;
    parentId;

    connectedCallback() {
        let data = sessionStorage.getItem('subRecordData');
        let recordData = JSON.parse(data);
        this.recordId = recordData.recordId;
        this.subName = recordData.subName;
        this.compName = recordData.compName;
        this.epic = recordData.title;
        this.Completed = recordData.completed;
        this.NotCompleted = recordData.notCompleted;
        this.parentId = recordData.parentId
            // console.log('Sub task detail record Id ' + this.recordId);
            // console.log('Sub name ' + this.subName);
            // console.log('comp name ' + this.compName);
        console.log('this.Completed:cccc ' + this.Completed)
        console.log('this.NotCompleted:cc ' + this.NotCompleted)
        this.total = (this.Completed + this.NotCompleted);
        this.getCurrentTask(this.recordId);
    }

    getCurrentTask(recId) {
        getTask({ recordId: recId })
            .then(data => {
                console.log('Data getTask ' + JSON.stringify(data));
                this.title = data.Title__c;
                this.state = data.State__c;
                this.progress = data.Progress__c;
                console.log('state:' + this.state + 'progress ' + this.progress);
                if (this.state === 'Completed') {
                    this.isDisabledReassign = true;
                    this.isDisabledOverdue = true;
                    this.isDisabledClose = true;
                } else {
                    this.isDisabledReassign = false;
                    this.isDisabledOverdue = false;
                    this.isDisabledClose = false;
                }
            })
            .catch()
    }

    // handleSelect(event) {
    //     const selectedItemValue = event.detail.value;
    //     if (selectedItemValue === "reassign") {
    //         this.showReassigForm = true;
    //     } else if (selectedItemValue === "overdue") {
    //         this.onOverdue();
    //     } else {
    //         this.onClose();
    //     }
    //     console.log("selectedItemValue " + selectedItemValue);
    // }

    onReassign() {
        this.showReassigForm = false;
        fireEvent(this.pageRef, "updateSubTask", "update");


        // const fields = {};
        // fields[ID_FIELD.fieldApiName] = this.recordId;
        // fields[IS_REASSIGN_FIELD.fieldApiName] = true;
        // const recordInput = { fields };
        // console.log("Field " + JSON.stringify(fields));
        // updateRecord(recordInput)
        //     .then(() => {
        //         this.dispatchEvent(
        //             new ShowToastEvent({
        //                 title: "Success",
        //                 message: "Overdue Notification Sent!",
        //                 variant: "Info"
        //             })
        //         );
        //         this.draftValues = [];
        //     })
        //     .catch((error) => {
        //         this.dispatchEvent(
        //             new ShowToastEvent({
        //                 title: "Error creating record",
        //                 message: error.body.message,
        //                 variant: "error"
        //             })
        //         );
        //     });

        // this.dispatchEvent(
        //     new ShowToastEvent({
        //         title: "Success",
        //         message: "Epic Reassigned Successfully!",
        //         variant: "Success"
        //     })
        // );
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
        }

    }

    onClose() {
        const fields = {};
        console.log("Field close " + JSON.stringify(fields));
        console.log("Field close " + this.recordId);
        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[STATE_FIELD.fieldApiName] = "Completed";
        fields[PROGRESS_FIELD.fieldApiName] = 100;
        const recordInput = { fields };
        console.log("Field close " + JSON.stringify(fields));
        updateRecord(recordInput)
            .then(() => {
                this.Completed++;
                console.log('this.Completed++: ' + this.Completed)
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
                        title: "Error creating record",
                        message: error.body.message,
                        variant: "error"
                    })
                );
            });

    }

    updateParent() {
        const fields = {};

        let p = (this.Completed / (this.total)) * 100;
        let aggregateProgress = p.toFixed(2)
        console.log('this.Completed: ' + this.Completed)
        console.log('Total: ' + (this.total))
        console.log('Agg Progress: ' + aggregateProgress)

        fields[ID_FIELD.fieldApiName] = this.parentId;
        fields[PROGRESS_FIELD.fieldApiName] = aggregateProgress;

        const recordInput = { fields };
        updateRecord(recordInput)
            .then(() => {
                console.log('Parent Updated')
            })
            .catch((error) => {});
    }

    handleUpdateTask() {
        this.showEdit = false;
        console.log('here in edit ' + this.recordId);
        this.getCurrentTask(this.recordId);
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

    handleSubEpicBack() {
        // fireEvent(this.pageRef, "updateSubTask", "update");
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'taskDetail__c'
            }
        });
        sessionStorage.setItem('updateSubTaskList', 'updatefromsubdetail');
        console.log('Back Clicked')
    }

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