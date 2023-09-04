export class CompanyEmployeeList{
    constructor(
      public id: string,
      public firstName: string,
      public jobTitle: string,
      public email: string,
      public lastName: string,
      public phone: string,
      public status: number,
      public role: string,
      public isPartOf: boolean,
      public companyStatus: number= -1,
      public associatedCompanies: Array<any>=[]
    ){}
  }