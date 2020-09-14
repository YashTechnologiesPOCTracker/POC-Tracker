import { LightningElement, track } from 'lwc';
import LightningDatatable from 'lightning/datatable';
import pocFileUpload from './pocFileUpload.html';


export default class CustomDatatableTest extends LightningDatatable {

    static customTypes = {
        lookup: {
            template: pocFileUpload,
            typeAttributes: ['acceptedFormats'],
        }
    };

    // @track columns = [
    //     // {
    //     //     label: "ID",
    //     //     fieldName: "Name",
    //     //     initialWidth: 60
    //     // },
    //     // {
    //     //     label: "ID",
    //     //     fieldName: "Id",
    //     //     initialWidth: 60
    //     // },
    //     {
    //         label: "Title",
    //         fieldName: "title",
    //         editable: true,
    //         initialWidth: 190
    //     },

    //     // {
    //     //     label: 'Program',
    //     //     fieldName: 'program',
    //     //     type: 'picklist',
    //     //     typeAttributes: {
    //     //         options: [
    //     //                 { label: 'Accelerator', value: 'Accelerator' },
    //     //                 { label: 'Delivery Support', value: 'Delivery Support' },
    //     //                 { label: 'Hiring ', value: 'Hiring' },
    //     //                 { label: 'Lab', value: 'Lab' },
    //     //                 { label: 'Research', value: 'Research' },
    //     //                 { label: 'Serviceline Support', value: 'Lab' },
    //     //                 { label: 'Training', value: 'Training' }
    //     //             ] // list of all picklist options
    //     //             ,
    //     //         value: { fieldName: 'program' } // default value for picklist
    //     //         ,
    //     //         // context: { fieldName: 'Id' } // binding account Id with context variable to be returned back
    //     //     }
    //     // },
    //     {
    //         label: 'Assigned To',
    //         fieldName: 'Assigned_to__c',
    //         type: 'lookup',
    //         typeAttributes: {
    //             // uniqueId: { fieldName: 'Id' }, //pass Id of current record to lookup for context
    //             object: "Tracker__c",
    //             label: "Assigned",
    //             displayFields: "Name",
    //             displayFormat: "Name",
    //             filters: ""
    //         }
    //     },
    //     {
    //         label: "Start Date",
    //         fieldName: "startDate",
    //         editable: true,
    //         initialWidth: 105
    //     },
    //     {
    //         label: "Target Date",
    //         fieldName: "targetDate",
    //         editable: true,
    //         initialWidth: 105
    //     },
    //     {
    //         label: "Assigned To",
    //         fieldName: "Assigned_To",
    //         initialWidth: 120
    //     },
    // ];
}