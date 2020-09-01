public with sharing class taskController {
    
    @AuraEnabled(cacheable=true)
    public static List<PTG__c> getPTGList() {
        return [SELECT Id, Name FROM PTG__c];
    }

    @AuraEnabled(cacheable=true)
    public static List<Tracker__c> getGeneralTasks() {
        system.debug('In general task');
        List<Tracker__c> listGeneralTask =  [SELECT Id, Name, Program__c, Title__c, Start_Date__c, Target_Date__c 
                                            FROM Tracker__c Where Subsidiary_CompetencyId__c = null];
        system.debug('list -' + listGeneralTask);
        return listGeneralTask;
    }

    @AuraEnabled
    public static void deleteTasks(String recordId){
        System.debug('Record Id: ' +  recordId); 
        list<Tracker__c> taskToDelete = [select Id, Name from Tracker__c where Parent_Task__r.Id=: recordId];
        System.debug('taskToDelete: ' +  taskToDelete);
        Tracker__c t = [select Id, Name from Tracker__c where Id=:recordId];
        System.debug('t: ' +  t);

        try {
            list<Tracker__c> lstTaskToDelete = new list<Tracker__c>();
            if(!taskToDelete.isEmpty()){
                for(Tracker__c task: taskToDelete){
                    lstTaskToDelete.add(task);
                }
            }
            
            lstTaskToDelete.add(t);

            system.debug('lstTaskToDelete - '+lstTaskToDelete);

            if(!lstTaskToDelete.isEmpty()) {
                delete lstTaskToDelete;
            }
        }
        catch(Exception ex) {
            system.debug('Exception '+ex.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Tracker__c> listSubTask(String parentId){
        System.debug('Parent Id ' + parentId);
        List<Tracker__c> listofsubtasks = [select Id, Name, Program__c, Title__c, Start_Date__c, Target_Date__c, Assigned_To__r.Name from 
                                        Tracker__c where Parent_Task__r.Id =: parentId];
        System.debug('sub tasks list ' + listofsubtasks);
        return listofsubtasks;                                
    }

    @AuraEnabled(cacheable=true)
    public static List<Tracker__c> getTasksByUser(String currentUserId, String subcompId) {
        system.debug('userId ' + currentUserId);
        List<Tracker__c> listTrackerByUser =  [SELECT Id, Name, Title__c, Program__c,Start_Date__c, Target_Date__c, 
                Assigned_To__r.Name, Progress__c, State__c FROM Tracker__c Where (OwnerId=: currentUserId AND Parent_Task__c = null AND Subsidiary_CompetencyId__c=:subcompId)];
        system.debug('list -' + listTrackerByUser);
        return listTrackerByUser;
    }

    @AuraEnabled(cacheable=true)
    public static List<PTG__c> getPTGNameForLoggedInUser(String currentUserId) {
        system.debug('userId ' + currentUserId);
        List<PTG__c> PTGName =  [SELECT Id, Name, Lead_Name__r.Name  FROM PTG__c Where Lead_Name__c=: currentUserId];
        system.debug('PTGName -' + PTGName);
        return PTGName;
    }

    @AuraEnabled(cacheable=true)
    public static List<Subsidiary__c> getSubsidiary() {
        return [SELECT Name FROM Subsidiary__c];
    }

    @AuraEnabled(cacheable=true)
    public static List<Subsidiary_Competency__c> getCompitancyBySubsidiaryId(String recordId) {
        return [SELECT Id, Name, Competency_Name__r.Name From Subsidiary_Competency__c Where Subsidiary_Name__r.Id =:recordId ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Tracker__c> getTasks(String recordId) {
        system.debug('selectedCompId'+recordId);
        List<Tracker__c> listTracker =  [SELECT Id, Name, Title__c, Program__c, Start_Date__c, Target_Date__c,
                                    Assigned_To__r.Name FROM Tracker__c Where Subsidiary_CompetencyId__c=:recordId];
        system.debug('list -' + listTracker);
        return listTracker;
    }

    @AuraEnabled(cacheable=true)
    public static List<Subsidiary_Competency__c> getSubsidiaryByCompitencyId(String competencyId) {
        return [SELECT Id, Name, Subsidiary_Name__r.Name From Subsidiary_Competency__c Where Competency_Name__r.Id =:competencyId ];
    }    

    @AuraEnabled(cacheable=true)
    public static Tracker__c getTask(String recordId){
        System.debug('record Id ' + recordId);
        Tracker__c task = [select Name, Subsidiary_CompetencyId__r.Name, Program__c, Title__c, Start_Date__c, 
                    Target_Date__c, State__c, Progress__c from Tracker__c where Id =: recordId];
        System.debug('task ' + task);
        return task;                                
    } 
    
    @AuraEnabled
    public static Tracker__c getCurrentTask(String recordId){
        System.debug('record Id ' + recordId);
        Tracker__c task = [select Name, Subsidiary_CompetencyId__r.Name, Program__c, Title__c, Start_Date__c, 
                    Target_Date__c, State__c, Progress__c from Tracker__c where Id =: recordId];
        System.debug('task ' + task);
        return task;                                
    }   

    @AuraEnabled(cacheable=true)
    public static List<Tracker__c> getTasksByEmployee(String currentUserId) {
        system.debug('userId ' + currentUserId);
    List<Tracker__c> listTrackerByUser =  [SELECT Id, Name, Title__c,Target_Date__c,Progress__c, State__c, Start_Date__c, 
                        Program__c, Assigned_To__r.Name, Subsidiary_CompetencyId__r.Subsidiary_Name__r.Name,
                        Subsidiary_CompetencyId__r.Competency_Name__r.Name FROM Tracker__c Where Assigned_To__c =: currentUserId ];

        system.debug('list -' + listTrackerByUser);
        return listTrackerByUser;
    }


// @AuraEnabled
// public static String getreport(String scName){

//     List <Report> reportList = [SELECT Id,DeveloperName FROM Report where Name = 'testPalashReport'];
//     String reportId = (String)reportList.get(0).get('Id');
 
//     Reports.ReportDescribeResult describe = Reports.ReportManager.describeReport(reportId);
//     Reports.ReportMetadata reportMd = describe.getReportMetadata();
//     system.debug('reportMd @ 1:' + reportMd);
//     Reports.ReportFilter filter = reportMd.getReportFilters()[0];
//     system.debug('filter: # 1 ' + filter);
//     filter.setValue(scName);
//     system.debug('filter: # 2 ' + filter);
//     system.debug('reportMd @ 1:' + reportMd);

//     Reports.ReportResults results = Reports.ReportManager.runReport(reportId, reportMd);
//     system.debug('results ' + results);
//     return JSON.serialize(results); 
// }


    @AuraEnabled
    public static List<DataSet> callReport(String scId, string userId){
        system.debug('Subsidiary Id: ' + scId);
        List<AggregateResult> result =  [Select Count(Id) cnt, Program__c from Tracker__c 
                                    where (Subsidiary_CompetencyId__c=: scId AND Parent_Task__c=null AND OwnerId=: userId AND state__c <> 'Completed') group by Program__c];
        List<DataSet> dataSet = new List<DataSet>();
        for(AggregateResult ar:result){
            String status =  (String)ar.get('Program__c') ;
            Integer total = (Integer)ar.get('cnt');
            dataSet.add(new DataSet(status ,total));
        }
    System.debug('dataSet ' + dataSet);
    return dataSet ;                      
    } 

    @AuraEnabled
    public static List<DataSet> callSubReport(String parentId, string userId){
        system.debug('parentId Id: ' + parentId);
        List<AggregateResult> result =  [Select Count(Id) cnt, Program__c from Tracker__c 
                    where ( Parent_Task__c=: parentId AND OwnerId=: userId AND state__c <> 'Completed') group by Program__c];
        List<DataSet> dataSet = new List<DataSet>();
        for(AggregateResult ar:result){
            String status =  (String)ar.get('Program__c') ;
            Integer total = (Integer)ar.get('cnt');
            dataSet.add(new DataSet(status ,total));
        }
    System.debug('dataSet ' + dataSet);
    return dataSet ;                      
    } 

}
