import { LightningElement, track, api, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class EmployeeTaskView extends LightningElement {
    @api recordId;
    @api progress;

    closeModal() {
        const customEvent = new CustomEvent("closemodalevent");
        this.dispatchEvent(customEvent);
    }

    handleSuccess(event) {
        console.log("recordId" + this.recordId);
        const evt = new ShowToastEvent({
            title: "Sucess",
            message: "Task Updated Successfully!",
            variant: "success"
        });
        this.dispatchEvent(evt);

        const inputFields = this.template.querySelectorAll("lightning-input-field");
        if (inputFields) {
            inputFields.forEach((field) => {
                field.reset();
            });
        }

        const customEvent = new CustomEvent("updateevent");
        this.dispatchEvent(customEvent);
    }

}