import { LightningElement, track, api, wire } from 'lwc';
import findAccounts from '@salesforce/apex/taskController.findAccounts'
import { NavigationMixin } from 'lightning/navigation';
import getRecentModifiedAccounts from "@salesforce/apex/taskController.getRecentModifiedAccounts"

// Fields to Display for Selected record in RecordForm
const fields = ['Name', 'AccountNumber', 'OwnerId', 'AccountSource', 'ParentId', 'AnnualRevenue', 'Type', 'CreatedById', 'LastModifiedById', 'Industry', 'Description', 'Phone'];

const columns = [
    { label: 'Account Name', fieldName: 'recordId', type: 'url', typeAttributes: { label: { fieldName: 'Name' }, tooltip: { fieldName: 'Name' }, target: '_parent' } },
    { label: 'Account Number', fieldName: 'AccountNumber', type: 'text' },
    { label: 'Account Source', fieldName: 'AccountSource', type: 'text' },
    { label: 'Annual Revenue', fieldName: 'AnnualRevenue', type: 'currency', typeAttributes: { currencyCode: 'USD' } },
    { label: 'Type', fieldName: 'Type', type: 'text' },
    { label: 'Website', fieldName: 'Website', type: 'url', typeAttributes: { target: '_parent' } },
    { label: 'Industry', fieldName: 'Industry', type: 'text' },
    { label: 'Account Owner', fieldName: 'OwnerId', type: 'url', typeAttributes: { label: { fieldName: 'OwnerName' }, tooltip: { fieldName: 'OwnerName' }, target: '_parent' } },
];

export default class CustomDatatable extends NavigationMixin(LightningElement) {

    // @track data = [];
    // connectedCallback() {
    //     this.columns = [
    //         { label: 'Name', fieldName: 'Name', typeAttributes: { acceptedFormats: '.jpg,.jpeg,.pdf,.png' } },
    //         { label: 'Account Number', fieldName: 'AccountNumber' },
    //         { label: 'Upload', type: 'fileUpload', fieldName: 'Id' },
    //         {
    //             label: 'Assigned To',
    //             fieldName: '',
    //             type: 'lookup',
    //             typeAttributes: {
    //                 uniqueId: { fieldName: 'Id' }, //pass Id of current record to lookup for context
    //                 object: "Account",
    //                 label: "Assigned",
    //                 displayFields: "Name",
    //                 displayFormat: "Name",
    //                 filters: ""
    //             }
    //         },
    //     ];
    //     findAccounts().then(res => { this.data = res; }).catch(err => console.error(err));
    // }
    // handleUploadFinished(event) {
    //     event.stopPropagation();
    //     console.log('data => ', JSON.stringify(event.detail.data));
    // }

    @api recordId;
    @track accounts;
    @track error;
    @track mapMarkers = [];
    fields = fields;
    columns = columns;
    maxRowSelection = 1;
    zoomLevel = 16;

    @wire(getRecentModifiedAccounts)
    wiredAccounts({ error, data }) {
        if (data) {
            const rows = [];
            data.forEach(function(account) {
                // ES2015 (ES6) Object constructor: Object.assign | This new method allows to easily copy values from one object to another.
                const accountObj = Object.assign({}, account, {
                    recordId: '/lightning/r/' + account.Id + '/view',
                    OwnerId: '/lightning/r/' + account.Owner.Id + '/view',
                    OwnerName: account.Owner.Name,
                });
                rows.push(accountObj);
            });
            this.accounts = rows;
        } else {
            this.error = error;
        }
    }

    getSelectedAccount(event) {
        const account = event.detail.selectedRows[0];
        this.recordId = account.Id;
        this.mapMarkers = [{
            location: {
                // Location Information
                City: account.BillingCity,
                Country: account.BillingCountry,
                PostalCode: account.BillingPostalCode,
                State: account.BillingState,
                Street: account.BillingStreet,
            },

            icon: 'standard:account',
            title: account.Name
        }];
    }

}