import { LightningElement, api, track, wire } from 'lwc';
import chartjs from '@salesforce/resourceUrl/ChartJs';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from "lightning/navigation";



export default class Chart extends LightningElement {
    @api loaderVariant = 'base';
    @api chartConfig;
    // @api refresh;
    //@wire(CurrentPageReference) pageRef;

    @track isChartJsInitialized;

    // connectedCallback() {
    //     this.renderedCall();
    //     registerListener("updateChartEmployee", this.handleCall, this);

    // }

    // handleCall(detail) {
    //     console.log(' detail chart  ' + detail);
    //     this.renderedCall();
    // }

    // disconnectedCallback() {
    //     unregisterAllListeners(this);
    // }

    renderedCallback() {
        console.log('Rendered callback called ')
        if (this.isChartJsInitialized) {
            return;
        }
        // load static resources.
        Promise.all([loadScript(this, chartjs)])
            .then(() => {
                this.isChartJsInitialized = true;
                const ctx = this.template.querySelector('canvas.barChart').getContext('2d');
                this.chart = new window.Chart(ctx, JSON.parse(JSON.stringify(this.chartConfig)));
                this.chart.canvas.parentNode.style.height = 'auto';
                this.chart.canvas.parentNode.style.width = '100%';
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading ChartJS',
                        message: error.message,
                        variant: 'error',
                    })
                );
            });
    }
}