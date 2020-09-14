import { LightningElement, api, wire, track } from "lwc";
import { CurrentPageReference, NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { updateRecord } from "lightning/uiRecordApi";
import ID_FIELD from "@salesforce/schema/Tracker__c.Id";
import STATE_FIELD from "@salesforce/schema/Tracker__c.State__c";
import PROGRESS_FIELD from "@salesforce/schema/Tracker__c.Progress__c";
import IS_OVERDUE_FIELD from "@salesforce/schema/Tracker__c.isOverdue__c";
import getTask from "@salesforce/apex/TestFinalShowTaskList.getCurrentTask";
import { fireEvent } from "c/pubsub";
import initFiles from "@salesforce/apex/TestFinalShowTaskList.initFiles";
import queryFiles from "@salesforce/apex/TestFinalShowTaskList.queryFiles";
import loadFiles from "@salesforce/apex/TestFinalShowTaskList.loadFiles";

export default class EmployeeTaskView extends NavigationMixin(LightningElement) {
    // @api recordId;
    // @api progress;

    // closeModal() {
    //     const customEvent = new CustomEvent("closemodalevent");
    //     this.dispatchEvent(customEvent);
    // }

    // handleSuccess(event) {
    //     console.log("recordId" + this.recordId);
    //     const evt = new ShowToastEvent({
    //         title: "Sucess",
    //         message: "Task Updated Successfully!",
    //         variant: "success"
    //     });
    //     this.dispatchEvent(evt);

    //     const inputFields = this.template.querySelectorAll("lightning-input-field");
    //     if (inputFields) {
    //         inputFields.forEach((field) => {
    //             field.reset();
    //         });
    //     }

    //     const customEvent = new CustomEvent("updateevent");
    //     this.dispatchEvent(customEvent);
    // }

    @wire(CurrentPageReference) pageRef;
    showTask = false;
    showEdit = false;
    state;
    @api progress;
    refreshData;
    isEmployee = false;
    deactivate = false;

    isTaskCompleteButton = false;

    @api recordId;

    connectedCallback() {
        this.recordId = sessionStorage.getItem("recordId");
        console.log("test id - " + this.recordId);
        this.initRecords();
        this.getCurrentTask(this.recordId);
    }

    getCurrentTask(recId) {
        getTask({ recordId: recId })
            .then((data) => {
                console.log("Data getTask " + JSON.stringify(data));
                this.state = data.State__c;
                this.progress = data.Progress__c;
                if (this.progress < 90) {
                    this.deactivate = false;
                } else {
                    this.deactivate = true;
                }
                console.log("state:" + this.state + "progress " + this.progress);
                if (this.state === "Completed") {
                    this.isDisabled = true;
                    this.isTaskCompleteButton = true;
                    console.log("Edit Button - " + this.isTaskCompleteButton);
                } else {
                    this.isDisabled = false;
                    this.isTaskCompleteButton = false;
                    console.log("Edit Button - " + this.isTaskCompleteButton);
                }
            })
            .catch();
    }

    closeModal() {
        this.showTask = false;
    }

    handleEdit() {
        this.isEmployee = true;
        this.showEdit = true;
    }

    handleCloseModal() {
        this.showEdit = false;
    }

    handleUpdateTask() {
        this.showEdit = false;
        console.log("here in edit");
        this.getCurrentTask(this.recordId);
    }

    handleTaskOnHold() {
        const fields = {};
        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[STATE_FIELD.fieldApiName] = "On hold";
        fields[PROGRESS_FIELD.fieldApiName] = 90;

        const recordInput = { fields };
        // fireEvent(this.pageRef, "updateEmployeeStatus", "Update Chart");
        updateRecord(recordInput)
            .then(() => {
                this.getCurrentTask(this.recordId);
                this.deactivate = true;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Success",
                        message: "Epic updated ; Notification Sent !",
                        variant: "success"
                    })
                );
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
    @track filters = [{
            'id': 'gt100KB',
            'label': '>= 100 KB',
            'checked': true
        },
        {
            'id': 'lt100KBgt10KB',
            'label': '< 100 KB and > 10 KB',
            'checked': true
        },
        {
            'id': 'lt10KB',
            'label': '<= 10 KB',
            'checked': true
        }
    ];

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
        initFiles({ recordId: this.recordId, filters: this.conditions, defaultLimit: this.defaultNbFileDisplayed, sortField: this.sortField, sortOrder: this.sortOrder })
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
        loadFiles({ recordId: this.recordId, filters: this.conditions, defaultLimit: this.defaultNbFileDisplayed, offset: this.offset, sortField: this.sortField, sortOrder: this.sortOrder })
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

    handleFilterSelect(event) {
        const selectedItemValue = event.detail.value;
        const eventElement = event.currentTarget;
        let conditions = new Array();
        for (var filter of this.filters) {
            if (filter.id === selectedItemValue) {
                filter.checked = !filter.checked;
            }
            if (filter.checked) {
                conditions.push(filter.id);
            }
        }

        this.conditions = conditions;
        this.initRecords();
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