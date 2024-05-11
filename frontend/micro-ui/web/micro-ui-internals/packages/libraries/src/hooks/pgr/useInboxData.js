import { useQuery, useQueryClient } from "react-query";

const useInboxData = (searchParams) => {
  const client = useQueryClient();
  // const [complaintList, setcomplaintList] = useState([]);
  // const user = Digit.UserService.getUser();
  // const tenantId = user?.info?.tenantId;


  const fetchInboxData = async () => {
    const tenantId = Digit.ULBService.getCurrentTenantId();
    let serviceIds = [];
    let commonFilters = { start: 1, end: 10 };
    const { limit, offset } = searchParams;
    console.log("sss", searchParams)
    console.log("ccomm", commonFilters)
    let appFilters = { ...commonFilters, ...searchParams.filters.pgrQuery, ...searchParams.search, limit, offset };
    let wfFilters = { ...commonFilters, ...searchParams.filters.wfQuery };
    let complaintDetailsResponse = null;
    let combinedRes = [];
    complaintDetailsResponse = await Digit.PGRService.search(tenantId, appFilters);
    console.log("complaintDetailsResponse.ServiceWrappers", complaintDetailsResponse)
    complaintDetailsResponse.IncidentWrappers.forEach((incident) => serviceIds.push(incident.incident.incidentId));
    const serviceIdParams = serviceIds.join();
    console.log("serviceids", serviceIds)
    console.log("servpara", serviceIdParams)
    console.log("wffilters", wfFilters)
    const workflowInstances = await Digit.WorkflowService.getByBusinessId(tenantId, serviceIdParams, wfFilters, false);
    console.log("workflow", workflowInstances)
    if (workflowInstances.ProcessInstances.length) {
      combinedRes = combineResponses(complaintDetailsResponse, workflowInstances).map((data) => ({
        ...data,
        sla: Math.round(data.sla / (24 * 60 * 60 * 1000)),
      }));
      console.log("combinees", combinedRes)
    }
    console.log("combinees999", combinedRes)
   
    return combinedRes;
   
  };

  const result = useQuery(["fetchInboxData", 
  ...Object.keys(searchParams).map(i =>
      typeof searchParams[i] === "object" ? Object.keys(searchParams[i]).map(e => searchParams[i][e]) : searchParams[i]
     )],
  fetchInboxData,
  { staleTime: Infinity }
  );
  return { ...result, revalidate: () => client.refetchQueries(["fetchInboxData"]) };
};

const mapWfBybusinessId = (wfs) => {
  return wfs.reduce((object, item) => {
    return { ...object, [item["businessId"]]: item };
  }, {});
};

const combineResponses = (complaintDetailsResponse, workflowInstances) => {
  console.log("comres, compl", complaintDetailsResponse)
  let wfMap = mapWfBybusinessId(workflowInstances.ProcessInstances);
  console.log("wfmap", wfMap?.[complaint.incident.incidentId])
  let data = [];
  complaintDetailsResponse.IncidentWrappers.map((complaint) => {
    console.log("comppppCompp", complaint)
    if (wfMap?.[complaint.incident.incidentId]) {
      console.log("hiii00")
      data.push({
        incidentId: complaint.incident.incidentId,
        incidentSubType: complaint.incident.incidentType,
        //priorityLevel : complaint.service.priority,
        //locality: complaint.service.address.locality.code,
        status: complaint.incident.applicationStatus,
        taskOwner: wfMap[complaint.incident.incidentId]?.assignes?.[0]?.name || "-",
        sla: wfMap[complaint.incident.incidentId]?.businesssServiceSla,
        tenantId: complaint.incident.tenantId,
      })
    }});
    console.log("dddd990875", data)
  return data;
};

export default useInboxData;
