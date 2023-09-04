export const COMPANY_DETAILS = 'COMPANY_DETAILS';
export const COMPANY_INFO = 'COMPANY_INFO';
export const COMPANY_MTERICS_DETAILS = 'COMPANY_MTERICS_DETAILS';
export const COMPANY_DETAILS_DIRTY = 'COMPANY_DETAILS_DIRTY';
export const COMPANY_DETAILS_VIEW = 'COMPANY_DETAILS_VIEW';
export const COMPANY_DETAILS_VALIDATION = 'COMPANY_DETAILS_VALIDATION';
export const COMPANY_ID_VALIDATION = 'COMPANY_ID_VALIDATION';

export const setCompanyDetails = (payload: Array<any>): any => {
    return {
        type: COMPANY_DETAILS,
        payload
    }
}

export const setCompanyInfo = (payload: any): any => {
    return {
        type: COMPANY_INFO,
        payload
    }
}

export const setCompanyMetricsDetails = (payload: any): any => {
    return {
        type: COMPANY_MTERICS_DETAILS,
        payload
    }
}

export const setCompanyDetailsDirty = (payload: any): any => {
    return {
        type: COMPANY_DETAILS_DIRTY,
        payload
    }
}

export const setCompanyDetailsView = (payload: any): any => {
    return {
        type: COMPANY_DETAILS_VIEW,
        payload
    }
}

export const setCompanyValidation = (payload: any): any => {
    return {
        type: COMPANY_DETAILS_VALIDATION,
        payload
    }
}

export const setCompanyIDValidation = (payload: any): any => {
    return {
        type: COMPANY_ID_VALIDATION,
        payload
    }
}