import { LightningElement } from 'lwc';

export default class StateComboBox extends LightningElement {

    get options() {
        return [
            { label: 'Accelerator', value: 'Accelerator' },
            { label: 'Delivery Support', value: 'Delivery Support' },
            { label: 'Hiring ', value: 'Hiring' },
            { label: 'Lab', value: 'Lab' },
            { label: 'Research', value: 'Research' },
            { label: 'Serviceline Support', value: 'Lab' },
            { label: 'Training', value: 'Training' },
        ];
    }
}