import { LightningElement, api, wire } from "lwc";
import callReport from "@salesforce/apex/taskController.callReport";
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners } from "c/pubsub";
import chartjs from '@salesforce/resourceUrl/ChartJs';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProfile from '@salesforce/apex/taskController.getUserProfile';
import userId from '@salesforce/user/Id';

export default class ShowReport extends LightningElement {
    isDataAvailable = false;
    @api scId;
    refreshReport;
    profileName;
    @wire(CurrentPageReference) pageRef;

    @wire(getProfile) getProfileData(result, error) {
        if (result) {
            console.log('result.data ' + JSON.stringify(result));
            this.profileName = result.data;
            this.getReportData();
        } else if (error) {
            console.log('Error ' + JSON.stringify(error.message));
        }
    }

    connectedCallback() {
        console.log("Connected Callback of ShowReport");

        console.log('scID: ' + this.scId);
        registerListener("updateReportChart", this.handle, this);
    }


    // getProfileData() {
    //     getProfile()
    //         .then(data => {
    //             this.profileName = data;
    //             this.getReportData();
    //         })
    //         .catch(error => {
    //             console.log('Error ' + error.message);
    //         })
    // }

    // handleCallback(detail) {
    //     console.log('detail id ' + detail);
    //     this.scId = detail;
    //     console.log('SC id ' + this.scId);
    //     this.getReportData();
    // }

    handle() {
        console.log('in handle');
        this.getReportData();
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    getReportData() {
        callReport({ scId: this.scId, userId: userId, profileName: this.profileName })
            .then((data) => {
                console.log('userId ' + userId);
                console.log('data in report ' + JSON.stringify(data));
                this.refreshReport = data;
                if (Array.isArray(data) && data.length) {
                    this.chart.data.labels = [];
                    this.chart.data.datasets.forEach((dataset) => {
                        dataset.data = [];
                        dataset.backgroundColor = [];
                    });

                    if (!(Array.isArray(this.chart.data.labels) && this.chart.data.labels.length)) {
                        for (var key in data) {
                            this.updateChart(data[key].count, data[key].label);
                        }
                        this.isDataAvailable = true;
                        console.log('scId get report ' + this.scId);
                    }
                } else {
                    const customEvent = new CustomEvent('emptyreport');
                    this.dispatchEvent(customEvent);
                }


            })
            .catch((err) => {
                console.log("In report error " + JSON.stringify(err.message));
                this.isDataAvailable = false;
            });
    }


    chart;
    chartjsInitialized = false;
    config = {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [],
                backgroundColor: [],
                label: 'Dataset 1',
            }],
            labels: []
        },
        options: {
            cutoutPercentage: 65,
            responsive: true,
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true
                },
                // onHover: this.hoverFunction
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    };

    // hoverFunction() {
    //     console.log('Hover called');
    // }

    renderedCallback() {
        console.log('in render chart');
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
            if (label === 'Accelerator') {
                dataset.backgroundColor.push('#003f5c');
            } else if (label === 'Delivery Support') {
                dataset.backgroundColor.push('#2f4b7c');
            } else if (label === 'Hiring') {
                dataset.backgroundColor.push('#665191');
            } else if (label === 'Lab') {
                dataset.backgroundColor.push('#a05195');
            } else if (label === 'ServiceLine Support') {
                dataset.backgroundColor.push('#d45087');
            } else if (label === 'Training') {
                dataset.backgroundColor.push('#f95d6a');
            } else {
                dataset.backgroundColor.push('#ff7c43');
            }
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