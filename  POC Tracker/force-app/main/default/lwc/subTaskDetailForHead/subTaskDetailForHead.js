import { LightningElement, api } from 'lwc';

export default class SubTaskDetailForHead extends LightningElement {
    @api recordId;
    @api progress;

    closeModal() {
        const customEvent = new CustomEvent('closesubtaskdetail');
        this.dispatchEvent(customEvent);
    }
}