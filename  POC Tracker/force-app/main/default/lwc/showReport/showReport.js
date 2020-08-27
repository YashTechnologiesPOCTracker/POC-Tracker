import { LightningElement, api, wire } from "lwc";
import callReport from "@salesforce/apex/taskController.callReport";
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners } from "c/pubsub";
import chartjs from '@salesforce/resourceUrl/ChartJs';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import userId from '@salesforce/user/Id';

export default class ShowReport extends LightningElement {
    isDataAvilable = false;
    scId;
    refreshReport;
    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        console.log("Connected Callback of ShowReport");
        registerListener("selectedSubIdForReport", this.handleCallback, this);
        registerListener("SCIdFormShowCompList", this.handleCallback, this);
        registerListener("updateReportChart", this.handle, this);
    }

    handleCallback(detail) {
        this.scId = detail;
        this.getReportData();
    }

    handle() {
        console.log('in handle');
        this.getReportData();
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    getReportData() {
        callReport({ scId: this.scId, userId: userId })
            .then((data) => {
                this.refreshReport = data;
                this.chart.data.labels = [];
                this.chart.data.datasets.forEach((dataset) => {
                    dataset.data = [];
                });

                if (!(Array.isArray(this.chart.data.labels) && this.chart.data.labels.length)) {
                    for (var key in data) {
                        this.updateChart(data[key].count, data[key].label);
                    }
                    this.isDataAvilable = true;
                }
            })
            .catch((err) => {
                console.log("In report error " + err);
                this.isDataAvilable = false;
            });
    }

    chart;
    chartjsInitialized = false;
    config = {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [],
                backgroundColor: [
                    '#FF0000',
                    '#0000FF',
                    '#008000',
                    '#800080',
                    '#008080',
                    '#000080',
                    '#FF00FF',
                    '#808080',
                    '#800000',
                    '#808000',
                    'rgb(255,99,132)',
                    'rgb(255,159,64)',
                    'rgb(255,205,86)',
                    '#FFFF00',
                    '#00FFFF',
                    'rgb(75,192,192)',

                ],
                label: 'Dataset 1'
            }],
            labels: []
        },
        options: {
            responsive: true,
            legend: {
                position: 'right'
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    };

    renderedCallback() {
        if (this.chartjsInitialized) {
            return;
        }
        this.chartjsInitialized = true;
        Promise.all([
                loadScript(this, chartjs)
            ]).then(() => {
                const ctx = this.template.querySelector('canvas.donut')
                    .getContext('2d');
                this.chart = new window.Chart(ctx, this.config);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading ChartJS',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });
    }

    updateChart(count, label) {
        this.chart.data.labels.push(label);
        //console.log('Update chart label ' + label);
        this.chart.data.datasets.forEach((dataset) => {
            dataset.data.push(count);
        });
        // console.log('Update chart DATA ' + count);
        this.chart.update();
    }

    // removeData() {
    //     console.log('In remove data');
    //     this.chart.data.labels.pop();
    //     this.chart.data.datasets.forEach((dataset) => {
    //         dataset.data.pop();
    //     });
    //     this.chart.update();
    // }
}