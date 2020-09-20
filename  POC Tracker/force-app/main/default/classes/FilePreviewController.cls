public with sharing class FilePreviewController {
    @AuraEnabled
    public static ContentVersion saveFile(Id idParent, String strFileName, String base64Data) {
        // Decoding base64Data
        base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');
        
        // inserting file
        ContentVersion cv = new ContentVersion();
        cv.Title = strFileName;
        cv.PathOnClient = '/' + strFileName;
        cv.FirstPublishLocationId = idParent;
        cv.VersionData = EncodingUtil.base64Decode(base64Data);
        cv.IsMajorVersion = true;
        Insert cv;
        return cv;
    }

    // @AuraEnabled
    // public static list<contentversion> releatedFiles(Id idParent){
    //     list<id> lstConDocs = new list<id>();
    //     for(ContentDocumentLink cntLink : [Select Id, ContentDocumentId From ContentDocumentLink Where LinkedEntityId =:idParent]) {
    //         lstConDocs.add(cntLink.ContentDocumentId);
    //     }
    //     if(!lstConDocs.isEmpty()) {
    //         return [SELECT Id, Title, ContentDocumentId FROM ContentVersion WHERE ContentDocumentId IN :lstConDocs];
    //     }
    //     else {
    //         return null;
    //     }
     
    // }

    @AuraEnabled(cacheable=true)
    public static List<file> getRelatedFiles(String recordId){
        List<File> files = new List<File>();

        for(ContentDocumentLink conLink : [SELECT 
                                                ContentDocument.Id, 
                                                ContentDocument.Title, 
                                                ContentDocument.CreatedDate, 
                                                ContentDocument.FileType
                                                    FROM ContentDocumentLink 
                                                        WHERE LinkedEntityId =: recordId]){
            File file = new File();
            file.Title = conLink.ContentDocument.Title;
            file.Id = conLink.ContentDocument.Id;
            file.CreatedDate = conLink.ContentDocument.CreatedDate;
            file.Type = conLink.ContentDocument.FileType;
            files.add(file);
        }
        return files;
    }

    public class File{
        @AuraEnabled public String Title;
        @AuraEnabled public String Type;
        @AuraEnabled public Id Id;
        @AuraEnabled public Datetime CreatedDate;
    }
}
