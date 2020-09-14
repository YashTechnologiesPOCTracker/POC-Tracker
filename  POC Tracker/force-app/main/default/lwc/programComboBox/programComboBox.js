import { LightningElement, api } from 'lwc';

export default class StateComboBox extends LightningElement {

    // get options() {
    //     return [
    //         { label: 'Accelerator', value: 'Accelerator' },
    //         { label: 'Delivery Support', value: 'Delivery Support' },
    //         { label: 'Hiring ', value: 'Hiring' },
    //         { label: 'Lab', value: 'Lab' },
    //         { label: 'Research', value: 'Research' },
    //         { label: 'Serviceline Support', value: 'Lab' },
    //         { label: 'Training', value: 'Training' },
    //     ];
    // }

    @api recordId;
    @api acceptedFormats;
    handleUploadFinished() {
        this.dispatchEvent(new CustomEvent('uploadfinished', {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
                data: { name: 'some data', recordId: this.recordId }
            }
        }));
        this.dispatchEvent(new ShowToastEvent({
            title: 'Completed',
            message: 'File has been uploaded',
        }));
    }

    createTask() {
        console.log('create task clicked');
    }
}