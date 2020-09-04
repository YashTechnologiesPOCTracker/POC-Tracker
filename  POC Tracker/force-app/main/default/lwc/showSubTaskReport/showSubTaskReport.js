import { LightningElement, wire, api } from 'lwc';
import callSubReport from "@salesforce/apex/taskController.callSubReport";
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners } from "c/pubsub";
import chartjs from '@salesforce/resourceUrl/ChartJs';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import getProfile from '@salesforce/apex/taskController.getUserProfile';
import userId from '@salesforce/user/Id';

export default class ShowSubTaskReport extends LightningElement {
    @api parentId;
    profileName;
    refreshReport;
    error;
    @wire(CurrentPageReference) pageRef;


    connectedCallback() {
        this.getProfileData();
        console.log("Connected Callback of Show Sub Report");
        //registerListener("subTaskReportChart", this.handleCallback, this);
        registerListener("subTaskAddedEvent", this.handleCall, this);
        registerListener("editReportUpdate", this.handleCall, this);
        registerListener("deleteReportUpdate", this.handleCall, this);
        console.log('after regis....subTaskAddedEvent');
        this.getSubTaskReport();
    }

    getProfileData() {
        getProfile()
            .then(data => {
                this.profileName = data;
                console.log('profileName in subreport ' + this.profileName);
            })
            .then(error => {
                console.log('Error ' + error.message);
            })
    }

    // handleCallback(detail) {
    //     console.log('parent id detail' + detail);
    //     this.parentId = detail;
    //     this.getSubTaskReport();
    // }

    handleCall(detail) {
        console.log(' detail' + detail);
        this.getSubTaskReport();
        //this.handleCallback(detail);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    getSubTaskReport() {
        callSubReport({ parentId: this.parentId, userId: userId, profileName: this.profileName })
            .then((data) => {
                console.log('Report: sub task data ' + JSON.stringify(data) + 'id ' + this.parentId);
                this.refreshReport = data;
                this.chart.data.labels = [];
                this.chart.data.datasets.forEach((dataset) => {
                    dataset.data = [];
                });

                if (!(Array.isArray(this.chart.data.labels) && this.chart.data.labels.length)) {
                    for (var key in data) {
                        this.updateChart(data[key].count, data[key].label);
                    }
                    //this.isDataAvailable = true;
                    //console.log('parentId ' + this.parentId);
                }

            })
            .catch((err) => {
                console.log("In report error " + err);
                // this.isDataAvailable = false;
                // this.error = err.message;
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
                    '#072F5F',
                    '#557CFF',
                    '#229389',
                    '#57C3AD',
                    '#FF0000',
                    '#0000FF',
                    '#008000',
                    '#800080',
                    '#008080',
                    '#000080',
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
        console.log('In rendered callback ' + this.parentId);
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