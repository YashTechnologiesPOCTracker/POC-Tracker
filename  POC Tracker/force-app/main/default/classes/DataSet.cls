public class DataSet{
    public DataSet(String label ,Integer count){
        this.label  = label ;
        this.count = count ;
    }

    @AuraEnabled
    public String label {get;set;}  
    @AuraEnabled
    public Integer  count {get;set;}
}
