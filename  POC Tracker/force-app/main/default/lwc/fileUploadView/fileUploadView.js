import { LightningElement, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getRelatedFiles from '@salesforce/apex/FilePreviewController.getRelatedFiles';

export default class FileUploadView extends LightningElement {
    @api label;
    @api formats = '.png,.gif,.jpg,.png,.pdf,.docx,.ppt,.pptx,.xls,.xlsx ';
    @api recordId;
    @api deactivate;

    get acceptedFormats() {
        return this.formats.split(',');
    }

    @wire(getRelatedFiles, { recordId: '$recordId' })
    files;

    // connectedCallback() {
    //     this.recordId = 'a002w00000BHyCcAAL';
    // }

    handleActionFinished(event) {
        //refresh the list of files
        refreshApex(this.files);
    }
}