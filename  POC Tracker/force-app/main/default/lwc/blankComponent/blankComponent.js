import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners } from "c/pubsub";

export default class BlankComponent extends LightningElement {
    isTaskTrue = false;
    isSubTaskTrue = false;
    SCId;
    parentId;
    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        // console.log("Connected Callback of blank");
        registerListener("selectedSubIdForReport", this.handleCallback, this);
        registerListener("selectedSubIdForReport", this.handleCallback, this);
        registerListener("subTaskReportChart", this.handleCall, this);
        //registerListener("showSubTaskReport", this.handleCall, this);
    }

    handleCallback(detail) {
        console.log('detail id ' + detail);
        this.SCId = detail;
        console.log('SSSCCCIIIDDD ' + this.SCId);
        this.isTaskTrue = true;
    }

    handleCall(detail) {
        console.log('handle call')
        this.parentId = detail;
        console.log('PARENT ID ' + this.parentId);
        this.isSubTaskTrue = true;
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

}