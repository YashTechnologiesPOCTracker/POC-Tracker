import { LightningElement } from 'lwc';

export default class CustomDatatable extends LightningDatatable {

    static customTypes = {
        customTypeA: {
            template: customTypeA,
            typeAttributes: ['recordId', 'customValueA']
        },
        customTypeB: {
            template: customTypeB,
            typeAttributes: ['recordId']
        }
    }
}