import { LightningElement, track, api, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class EmployeeEditTask extends LightningElement {
    @api recordId;
    @api progress;
    // @track userEnteredProgressValue = 0;
    @api hasSubTasks;

    connectedCallback() {
        console.log('IN EMP EDIT EPIC ' + this.hasSubTasks);
    }

    progressOnChange(event) {
        this.progress = event.target.value;
        // if (this.progress > 90) {
        //     const evt = new ShowToastEvent({
        //         title: "Error",
        //         message: "Progress cannot be more than 90%",
        //         variant: "error"
        //     });
        //     this.dispatchEvent(evt);
        //     this.progress = null;
        // }
    }

    closeModal() {
        const customEvent = new CustomEvent("closemodalevent");
        this.dispatchEvent(customEvent);
    }

    handleSubmit(event) {
        //event.stopPropagation();
        event.preventDefault();
        if (this.progress > 90) {
            const evt = new ShowToastEvent({
                title: "Error",
                message: "Progress cannot be more than 90%",
                variant: "error"
            });
            this.dispatchEvent(evt);
            console.log('handle submit')
            const customEvent = new CustomEvent("closemodalevent");
            this.dispatchEvent(customEvent);
        } else {
            let fields = event.detail.fields;
            this.template.querySelector('lightning-record-edit-form').submit(fields);
        }
    }

    handleSuccess(event) {
        console.log("recordId" + this.recordId);
        const evt = new ShowToastEvent({
            title: "Sucess",
            message: "Epic Updated Successfully!",
            variant: "success"
        });
        this.dispatchEvent(evt);

        const inputFields = this.template.querySelectorAll("lightning-input-field");
        if (inputFields) {
            inputFields.forEach((field) => {
                field.reset();
            });
        }

        const customEvent = new CustomEvent("updateevent", { detail: this.progress });
        this.dispatchEvent(customEvent);
    }

}