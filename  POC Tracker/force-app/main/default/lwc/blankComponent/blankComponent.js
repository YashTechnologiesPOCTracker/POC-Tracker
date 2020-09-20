import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners } from "c/pubsub";

export default class BlankComponent extends LightningElement {
    isTaskTrue = false;
    isSubTaskTrue = false;
    emptyData = false;
    SCId;
    program;
    parentId;
    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        // console.log("Connected Callback of blank");
        // registerListener("recursiveViewClicked", this.handleCallback, this);
        registerListener("selectedSubIdForReport", this.handleCallback, this);
        registerListener("subTaskReportChart", this.handleCall, this);
        registerListener("subTaskEmpReportChart", this.handleCallE, this);
        registerListener("programNameForProgramGeneralEpics", this.handleCallbackReport, this);
        registerListener("subTaskRecursiveReportChart", this.handleCallRecursive, this);
        registerListener("recursiveViewClicked", this.handle, this);

        registerListener("subTaskAddedEvent", this.handleCallA, this);
        registerListener("recSubTaskAdded", this.handleCallA, this);
    }

    handle(detail) {
        console.log('handle call back 1 ' + detail);
        this.isTaskTrue = false;
        this.isSubTaskTrue = false;
        this.emptyData = false;
        console.log('isSubTaskTrue%%%%%% ' + this.isSubTaskTrue + 'isTaskTrue$$$$$$$$ ' + this.isTaskTrue);
    }

    handleCallback(detail) {
        //  console.log('detail id ' + detail);
        this.SCId = detail;
        console.log('SSSCCCIIIDDD ' + this.SCId);
        this.isTaskTrue = true;
        this.emptyData = false;
    }

    handleCallA(detail) {
        this.isSubTaskTrue = true;
        this.emptyData = false;
    }

    handleCallE(detail) {
        this.parentId = detail.parentId;
        this.program = detail.program;
        // console.log('PARENT ID hadnle E ' + this.parentId + ' program ' + this.program);
        this.isSubTaskTrue = true;
        this.emptyData = false;
    }

    handleCall(detail) {
        this.parentId = detail.parentId;
        this.program = detail.program;
        //  console.log('PARENT ID ' + this.parentId + ' program ' + this.program);
        this.isSubTaskTrue = true;
        this.emptyData = false;
    }

    handleCallRecursive(detail) {
        // console.log('handle call ' + JSON.stringify(detail));
        this.parentId = detail.parentId;
        this.program = detail.program;
        //  console.log('PARENT ID ' + this.parentId + ' program ' + this.program);
        this.isSubTaskTrue = true;
        this.emptyData = false;
    }

    handleCallbackReport(detail) {
        // console.log('Detail program name  ' + detail)
        this.program = detail;
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    handleEmptyData() {
        this.isTaskTrue = false;
        this.emptyData = true;
    }

    handleEmptySubData() {
        this.isSubTaskTrue = false;
        this.emptyData = true;
    }

}