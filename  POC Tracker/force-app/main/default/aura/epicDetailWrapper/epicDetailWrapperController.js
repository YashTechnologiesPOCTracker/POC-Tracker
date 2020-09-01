({
    init: function(cmp, evt, helper) {
        var myPageRef = cmp.get("v.pageReference");
        var recordData = myPageRef.state.c__recordData;
        console.log('recordData: ' + recordData);
        cmp.set("v.recordData", recordData);
    },

    reInit: function(component, event, helper) {
        $A.get('e.force:refreshView').fire();
    }
})