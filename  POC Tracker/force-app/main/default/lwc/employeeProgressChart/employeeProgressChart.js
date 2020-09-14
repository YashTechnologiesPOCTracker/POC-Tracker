import { LightningElement, wire, track } from 'lwc';
import getTasksByEmployee from '@salesforce/apex/taskController.getEmployeeChartData';
import userID from '@salesforce/user/Id';
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners, fireEvent } from "c/pubsub";


export default class EmployeeProgressChart extends LightningElement {
    @track chartConfiguration;
    currntUserId = userID;
    error;
    @wire(CurrentPageReference) pageRef;
    refresh = false;


    // @wire(getTasksByEmployee, { userId: '$currntUserId' })
    // getTasksByEmployee({ error, data }) {


    //     if (error) {
    //         this.error = error;
    //         console.log('error => ' + JSON.stringify(error));
    //         this.chartConfiguration = undefined;
    //     } else if (data) {

    //         console.log('DAta data  => ' + JSON.stringify(data));
    //         let chartData = [];
    //         let chartLabels = [];
    //         data.forEach(opp => {
    //             chartData.push(opp.Total);
    //             chartLabels.push(opp.State__c);
    //         });

    //         this.chartConfiguration = {
    //             type: 'bar',
    //             data: {
    //                 labels: chartLabels,
    //                 datasets: [{
    //                     label: 'Progress',
    //                     barPercentage: 0.5,
    //                     barThickness: 0.2,
    //                     maxBarThickness: 1,
    //                     backgroundColor: "green",
    //                     data: chartData,


    //                 }, ],
    //             },
    //             options: {
    //                 scales: {
    //                     yAxes: [{
    //                         ticks: {
    //                             suggestedMin: 0,
    //                             suggestedMax: chartData.length,
    //                             stepSize: 1
    //                         }
    //                     }]
    //                 }
    //             },
    //         };
    //         console.log('data => ', data);
    //         this.error = undefined;
    //     }
    // }


    connectedCallback() {
        this.getEmployeeChart();
        registerListener("updateEmployeeReportChart", this.handleCall, this);
    }

    handleCall(detail) {
        console.log(' detail employee progress chart ' + detail);
        this.getEmployeeChart();
        fireEvent(this.pageRef, 'updateChartEmployee', 'call rendered method')
            //this.refresh = true;
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    getEmployeeChart() {
        getTasksByEmployee({ userId: this.currntUserId })
            .then(data => {
                console.log('DAta data  => ' + JSON.stringify(data));
                let chartData = [];
                let chartLabels = [];
                // data.forEach(opp => {
                //     chartData=[];
                //     chartLabels=[];
                // });
                data.forEach(opp => {
                    chartData.push(opp.Total);
                    chartLabels.push(opp.State__c);
                });

                console.log('chart data ' + chartData);
                console.log('chart labels ' + chartLabels);
                this.chartConfiguration = {
                    type: 'bar',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            label: 'Epic per State',
                            barPercentage: 0.5,
                            barThickness: 0.2,
                            maxBarThickness: 1,
                            backgroundColor: "green",
                            data: chartData,


                        }, ],
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    suggestedMin: 0,
                                    suggestedMax: chartData.length,
                                    stepSize: 1
                                }
                            }]
                        }
                    },
                };
                console.log('data => ', data);
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                console.log('error => ' + JSON.stringify(error));
                this.chartConfiguration = undefined;
            })
    }


}