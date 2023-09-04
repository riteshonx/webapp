import { AddressComponent } from "../models/address";

export const fetchAddressComponents=(arLocationArray: Array<AddressComponent>)=>{
    let city='';
    let state='';
    let country='';
    let pinCode='';
    let streetNo='';
    let countryShortCode='';
    arLocationArray.forEach((locItem: AddressComponent)=>{
        if(locItem.types.indexOf('locality')>-1){
            city= locItem.long_name;
        }
        if(locItem.types.indexOf('country')>-1){
            country= locItem.long_name;
            countryShortCode= locItem.short_name;
        }
        if(locItem.types.indexOf('administrative_area_level_1')>-1){
            state= locItem.long_name;
        }
        if(locItem.types.indexOf('postal_code')>-1){
            pinCode= locItem.long_name;
        }
        if(locItem.types.indexOf("street_number")>-1){
            streetNo=locItem.long_name;
        }
    })
    return {city, state, country, pinCode, streetNo, countryShortCode}
}

export const extractAddressFromProject=(argProjectDetails: any)=>{
    let addressLine1='';
    let addressLine2='';
    let streetNo='';
    let city='';
    let state='';
    let country='';
    let postalCode='';
    let id=-1;
    if(argProjectDetails.addresses.length>0){
        addressLine1=argProjectDetails.addresses[0].addressLine1
        addressLine2=argProjectDetails.addresses[0].addressLine2
        city=argProjectDetails.addresses[0].city
        country=argProjectDetails.addresses[0].country
        id=argProjectDetails.addresses[0].id
        postalCode=argProjectDetails.addresses[0].postalCode
        state=argProjectDetails.addresses[0].state
        streetNo=argProjectDetails.addresses[0].streetNo
        id=argProjectDetails.addresses[0].id
    } else{
        city=argProjectDetails.address.city;
        state=argProjectDetails.address.state;
        country=argProjectDetails.address.country;
        postalCode=argProjectDetails.address.pin;
    }
    return{
        addressLine1,
        addressLine2,
        streetNo,
        city,
        state,
        country,
        postalCode,
        id,
    }
}

export const Roles  ={
    createLocation : "createLocation",
    viewLocation : "viewLocation",
    updateLocation : "updateLocation",
    deleteLocation : "deleteLocation",
    viewMyProjects:"viewMyProjects",
    updateMyProject:"updateMyProject",
    updateMyProjectStatus:"updateMyProjectStatus",
    createMyProjectAssociation:"createMyProjectAssociation",
    updateMyProjectAssociationStatus:"updateMyProjectAssociationStatus",
    updateProjectAssociationRole:"updateProjectAssociationRole",
    createUserGroup:"createUserGroup",
    viewUserGroup:"viewUserGroup",
    updateUserGroup:"updateUserGroup",
    deleteUserGroup:"deleteUserGroup",
    viewProjectTemplateAssociation:"viewProjectTemplateAssociation",
    createProjectCustomListAssociation:"createProjectCustomListAssociation",
    viewProjectCustomListAssociation:"viewProjectCustomListAssociation",
    deleteProjectCustomListAssociation:"deleteProjectCustomListAssociation",
    updateProjectTemplateAssociation:"updateProjectTemplateAssociation",
    deleteProjectTemplateAssociation:"deleteProjectTemplateAssociation",
    createProjectCalendarAssociation:"createProjectCalendarAssociation",
    viewProjectCalendarAssociation:"viewProjectCalendarAssociation",
    createProjectMaterial:"createProjectMaterial",
    viewProjectMaterial:"viewProjectMaterial"
}