import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { DatePicker, Dropdown, ImageUploadHandler, TextArea, TextInput, UploadFile, CardLabel } from "@egovernments/digit-ui-react-components";
import { useRouteMatch, useHistory } from "react-router-dom";
import { useQueryClient } from "react-query";
import { FormComposer } from "../../../components/FormComposer";
import { createComplaint } from "../../../redux/actions/index";
export const CreateComplaint = ({ parentUrl }) => {
  const { t } = useTranslation();
  const [healthCareType, setHealthCareType]=useState();
  const [healthcentre, setHealthCentre]=useState();
  const [blockMenu, setBlockMenu]=useState([]);
  const [blockMenuNew, setBlockMenuNew]=useState([]);
  const [districtMenu, setDistrictMenu]=useState([]);
  const [file, setFile]=useState(null);
  const [uploadedFile, setUploadedFile]=useState(null);
  const [uploadedImages, setUploadedImagesIds] = useState(null)
  const [district, setDistrict]=useState(null);
  const [block, setBlock]=useState(null);
  const [error, setError] = useState(null);
  let reporterName = JSON.parse(sessionStorage.getItem("Digit.User"))?.value?.info?.name;
  const [canSubmit, setSubmitValve] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const tenantId = window.Digit.SessionStorage.get("Employee.tenantId");
  const [complaintType, setComplaintType]=useState(JSON?.parse(sessionStorage.getItem("complaintType")) || {});
  const [subTypeMenu, setSubTypeMenu] = useState([]);
  const [phcSubTypeMenu, setPhcSubTypeMenu]=useState([]);
  const [phcMenuNew, setPhcMenu] = useState([])
  const [subType, setSubType]=useState(JSON?.parse(sessionStorage.getItem("subType")) || {});
  let sortedSubMenu=[];
  if(subTypeMenu!==null){
    sortedSubMenu=subTypeMenu.sort((a,b)=>a.name.localeCompare(b.name))
   }
    let sortedphcSubMenu=[]
   if(phcSubTypeMenu!==null){
    sortedphcSubMenu=phcSubTypeMenu.sort((a,b)=>a.name.localeCompare(b.name))
    console.log("sortedphcSubMenu",sortedphcSubMenu,phcSubTypeMenu)
   }
  const menu = Digit.Hooks.pgr.useComplaintTypes({ stateCode: tenantId })
let  sortedMenu=[];
  if(menu!==null){
   sortedMenu=menu.sort((a,b)=>a.name.localeCompare(b.name))
  }
  const state = Digit.ULBService.getStateId();
  const [selectTenant, setSelectTenant] =useState(Digit.SessionStorage.get("Employee.tenantId") || null)
const { isMdmsLoading, data: mdmsData } = Digit.Hooks.pgr.useMDMS(state, "Incident", ["District","Block"]);
const {  data: phcMenu  } = Digit.Hooks.pgr.useMDMS(state, "tenant", ["tenants"]);
let blockNew =mdmsData?.Incident?.Block
useEffect(()=>{
  const fetchDistrictMenu=async()=>{
    const response=phcMenu?.Incident?.Block;
    if(response){
      const uniqueDistricts={};
      const districts=response.filter(def=>{
        if(!uniqueDistricts[def.districtCode]){
          uniqueDistricts[def.districtCode]=true;
          return true;
        }
        return false;
      });
      districts.sort((a,b)=>a.name.localeCompare(b.name))
          setDistrictMenu(
            districts.map(def=>({
           
           key:def.districtCode, 
            name:t(def.districtCode.toUpperCase()) 
         }))
          );
      }
    

  };
  fetchDistrictMenu();
}, [state, mdmsData,t]);

useEffect(()=>{
let tenants =Digit.SessionStorage.get("Employee.tenantId")
setSelectTenant(tenants)

},[])

useEffect(async () => {

  if (selectTenant && selectTenant !== "pg") {
    let tenant = Digit.SessionStorage.get("IM_TENANTS")
    const selectedTenantData = tenant.find(item => item.code === selectTenant);
    const selectedDistrict = {
      key: selectedTenantData.city.districtCode,
      name: t(selectedTenantData.city.districtCode.toUpperCase())
    };
    const selectedBlock = {
      key: selectedTenantData.city.blockCode.split(".")[1],
      name: t(selectedTenantData.city.blockCode.split(".")[1].toUpperCase())
    };
      handleDistrictChange(selectedDistrict);
      handleBlockChange(selectedBlock)
     
    
     
   // setBlock(selectedBlock);
  }
}, [selectTenant,mdmsData,state]);


  useEffect(() => {
      (async () => {
        setError(null);
        if (file) {
          const allowedFileTypesRegex = /(.*?)(jpg|jpeg|png|image|pdf)$/i
          if (file.size >= 5242880) {
            setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
          } else if (file?.type && !allowedFileTypesRegex.test(file?.type)) {
            setError(t(`NOT_SUPPORTED_FILE_TYPE`))
          } else {
            try {
              const response = await Digit.UploadServices.Filestorage("Incident", file, tenantId);
              if (response?.data?.files?.length > 0) {
                setUploadedFile(response?.data?.files[0]?.fileStoreId);
              } else {
                setError(t("CS_FILE_UPLOAD_ERROR"));
              }
            } catch (err) {
              setError(t("CS_FILE_UPLOAD_ERROR"));
            }
          }
        }
      })();
    }, [file]);
  const dispatch = useDispatch();
  const match = useRouteMatch();
  const history = useHistory();
  const serviceDefinitions = Digit.GetServiceDefinitions;
  const client = useQueryClient();
 
  useEffect(()=>{
    if(complaintType?.key&& subType?.key){
      setSubmitValve(true);
    }else{
      setSubmitValve(false)
    }
  },[complaintType, subType])
  async function selectedType(value) {
    if (value.key !== complaintType.key) {
      if (value.key === "Others") {
        setSubType({ name: "" });
        setComplaintType(value);
        sessionStorage.setItem("complaintType",JSON.stringify(value))
        setSubTypeMenu([{ key: "Others", name: t("SERVICEDEFS.OTHERS") }]);
      } else {
        setSubType({ name: "" });
        setComplaintType(value);
        sessionStorage.setItem("complaintType",JSON.stringify(value))
        setSubTypeMenu(await serviceDefinitions.getSubMenu(tenantId, value, t));
      }
    }
  }
  const handleDistrictChange = async (selectedDistrict) => {
    console.log("selectedDistrict", selectedDistrict);
    setDistrict(selectedDistrict);
    const response=mdmsData?.Incident?.Block;
    if(response){
      const blocks=response.filter((def)=>def.districtCode===selectedDistrict.key);
      blocks.sort((a,b)=>a.name.localeCompare(b.name))
      setBlockMenuNew(blocks)
      setBlockMenu(
        blocks.map((block) => ({
          key: block.name,
          name: t(block.name.toUpperCase()),
        }))
      );
    }
  };
  
  function selectedSubType(value) {
    sessionStorage.setItem("subType",JSON.stringify(value))
    setSubType(value);
  }
  async function selectedHealthCentre(value){
    setHealthCentre(value);
    console.log("valuevaluevalue",value)
    setPhcSubTypeMenu([value])
    setHealthCareType(value);
  }
  const handleBlockChange= (selectedBlock)=>{
    //sessionStorage.setItem("block",JSON.stringify(value))
    setHealthCareType({})
    setHealthCentre({})
    if (selectTenant && selectTenant !== "pg")
    {
      const block  = blockNew?.find(item => item?.name.toUpperCase() === selectedBlock?.key.toUpperCase())
      const phcMenuType= phcMenu?.tenant?.tenants.filter(centre => centre?.city?.blockCode === block?.code)
      setPhcMenu(phcMenuType)
      setBlock(selectedBlock);
      let tenant = Digit.SessionStorage.get("Employee.tenantId")
      console.log("phcMenuType",phcMenuType,tenant)
      const filtereddata = phcMenuType?.filter((code)=> code.code == tenant)
      if(filtereddata)
      {
        selectedHealthCentre(filtereddata?.[0])
      }
     
    }
    else {
      const block  = blockMenuNew.find(item => item?.name.toUpperCase() === selectedBlock?.key.toUpperCase())
      const phcMenuType= phcMenu?.tenant?.tenants.filter(centre => centre?.city?.blockCode === block?.code)
      setPhcMenu(phcMenuType)
      console.log("phcMenuTypephcMenuTypephcMenuType",phcMenuType)
      setBlock(selectedBlock);

    }
  }
  
  const handlePhcSubType=(value)=>{
    setHealthCareType(value);
  }
  // const selectedDistrict = (value) => {
  //   setDistrict(value);
  //   setBlockMenu([value]);
  // };
  async function selectFile(e){
    setFile(e.target.files[0]);
  }
  const handleUpload = (ids) => {
    setUploadedImagesIds(ids);
  };


   const wrapperSubmit = (data) => {
    if (!canSubmit) return;
    setSubmitted(true);
    !submitted && onSubmit(data);
  };
  const onSubmit = async (data) => {
    if (!canSubmit) return;
    const { key } = subType;
    const complaintType = key;
    let uploadImages=[]
    if(uploadedImages!==null){
     uploadImages = uploadedImages?.map((url) => ({
      documentType: "PHOTO",
      fileStoreId: url,
      documentUid: "",
      additionalDetails: {},
    }));
  }
    const formData = { ...data,complaintType, district, block, healthCareType, healthcentre, reporterName, uploadedFile,uploadImages};
    await dispatch(createComplaint(formData));
    await client.refetchQueries(["fetchInboxData"]);
    history.push(parentUrl + "/incident/response");
  };
  const config = [
    
    {
      head: t("TICKET_LOCATION"),
      body: [
        
        
        {
          label :t("INCIDENT_DISTRICT"),
          type: "dropdown",
          isMandatory:true,
          populators:  (
            <Dropdown option={districtMenu} optionKey="key" id="name" selected={district} select={handleDistrictChange} disable={selectTenant && selectTenant !== "pg"?true:false}/>),
           
         },
        
        {
          label:t("INCIDENT_BLOCK"),
          isMandatory:true,
          type: "dropdown",
          menu: { ...blockMenu },
             populators: (
             
              <Dropdown option={blockMenu} optionKey="key" id="name" selected={block} select={handleBlockChange} disable={selectTenant && selectTenant !== "pg"?true:false}
             />
             
             )
         },
         {
          label:t("HEALTH_CARE_CENTRE"),
          isMandatory:true,
          type: "dropdown",
          populators: (
            <Dropdown option={phcMenuNew} optionKey="name" id="healthCentre" selected={healthcentre} select={selectedHealthCentre} disable={selectTenant && selectTenant !== "pg"?true:false} />
            
          ),
           
         },
         {
          label:t("HEALTH_CENTRE_TYPE"),
          isMandatory:true,
          type: "dropdown",
          populators: (
            <Dropdown option={phcSubTypeMenu} optionKey="centreType" id="healthcaretype" selected={healthCareType} select={handlePhcSubType} disable={selectTenant && selectTenant !== "pg"?true:false} />
             
          ),
           
         },
        
      ],
    },
    {
      head: t("TICKET_DETAILS"),
      body: [
        {
          label :t("TICKET_TYPE"),
          type: "dropdown",
          isMandatory:true,
         
          populators: <Dropdown option={sortedMenu} optionKey="name" id="complaintType" selected={complaintType} select={selectedType} />,
           
         
           
         },
         {
          label :t("TICKET_SUBTYPE"),
          type: "dropdown",
          isMandatory:true,
          menu: { ...subTypeMenu },
          populators: <Dropdown option={sortedSubMenu} optionKey="name" id="complaintSubType" selected={subType} select={selectedSubType} />,
           
         }
        ]
    },
    {
      head: t("ADDITIONAL_DETAILS"),
      body: [
        {
          label: t("INCIDENT_COMMENTS"),
          type: "text",
          isMandatory:true,
          populators: {
            name: "comments",
            
          },
        },
        {
          label:t("INCIDENT_UPLOAD_FILE"),
          populators:
          <ImageUploadHandler tenantId={tenantId} uploadedImages={uploadedImages} onPhotoChange={handleUpload} />
         },
        ]
      }
    
  ];
  return (
    <FormComposer
      heading={t("")}
      config={config}
      onSubmit={wrapperSubmit}
      isDisabled={!canSubmit && !submitted}
      label={t("FILE_INCIDENT")}
    />
  );
};
