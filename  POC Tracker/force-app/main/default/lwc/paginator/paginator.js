import { api, LightningElement } from 'lwc';

export default class Paginator extends LightningElement {
    @api disabledPrevious;
    @api disabledNext;

    previousHandler() {
        this.dispatchEvent(new CustomEvent('previous'));
    }

    nextHandler() {
        this.dispatchEvent(new CustomEvent('next'));
    }
}