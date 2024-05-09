export const Complaint = {
  create: async ({
    cityCode,
    comments,
    district,
    uploadedFile,
   block,
   reporterName,
   complaintType,
   healthcentre,
   healthCareType,
  }) => {
    const tenantId = Digit.ULBService.getCurrentTenantId();
    console.log("uploadedFile", uploadedFile)
    let uploadedImages=null
    if(uploadedFile!==null){
      uploadedImages=[{
        documentType: "PHOTO",
        fileStoreId: uploadedFile||"",
        documentUid: "",
        additionalDetails: {},
      }]
    }
    let mobileNumber = JSON.parse(sessionStorage.getItem("Digit.User"))?.value?.info?.mobileNumber;
   // console.log("citycode, ", cityCode)
   // console.log("mbl",mobileNumber)
    const defaultData = {
      incident: {
        district: district?.code,
        tenantId:"pg.aidbhavisubcentre",
        incidentType:complaintType,
       incidentSubtype:complaintType,
       phcType:healthcentre?.code,
       phcSubType:healthCareType?.code,
       comments:comments,
        block:block?.code,
        additionalDetail: {
        },
        source: Digit.Utils.browser.isWebview() ? "mobile" : "web",
       
      },
      workflow: {
        action: "APPLY",
        //: uploadedImages
      },
    };
    if(uploadedImages!==null){
      defaultData.incident.workflow={verificationDocuments:uploadedImages};
    }

    if (Digit.SessionStorage.get("user_type") === "employee") {
      defaultData.incident.reporter = {

        name:reporterName,
        type: "EMPLOYEE",
        mobileNumber: mobileNumber,
        roles: [
          {
            id: null,
            name: "Citizen",
            code: "CITIZEN",
            tenantId: tenantId,
          },
        ],
        tenantId: tenantId,
      };
    }
    console.log("def", defaultData)
    const response = await Digit.PGRService.create(defaultData, cityCode);
    console.log("res", response)
    return response;
  },

  assign: async (complaintDetails, action, employeeData, comments, uploadedDocument, tenantId) => {
    complaintDetails.workflow.action = action;
    complaintDetails.workflow.assignes = employeeData ? [employeeData.uuid] : null;
    complaintDetails.workflow.comments = comments;
    uploadedDocument
      ? (complaintDetails.workflow.verificationDocuments = [
            {
              documentType: "PHOTO",
              fileStoreId: uploadedDocument,
              documentUid: "",
              additionalDetails: {},
            },
          ])
      : null;

    if (!uploadedDocument) complaintDetails.workflow.verificationDocuments = [];
    
    //TODO: get tenant id
    const response = await Digit.PGRService.update(complaintDetails, tenantId);
    return response;
  },
};
