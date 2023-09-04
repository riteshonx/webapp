export type SourceSystemType = 'Procore' | 'BIM 360' | 'Slate';
export interface ProjectDataInterface {
  projectId: number;
  agaveProjectId: string;
  sourceProjectId:string;
  synced: boolean;
  metadata: any;
  project: {
    name: string;
  };
}

export interface Project {
  id: number;
  name: string;
}

export interface ProjectDataResponse {
  project: Array<Project>;
}

export interface MetaDataType {
  page: {
    offset: number;
    limit: number;
    total: number;
  };
}

export interface FileObjType {
  file?: File;
  fileKey?: string;
}

export interface FormsFeatureListType {
  projectFeature: [
    {
      id: number;
      caption: string;
    }
  ];
}

export interface S3FileInformation {
  url: string;
  fields: {
    key: string;
    bucket: string;
    'X-Amz-Algorithm': string;
    'X-Amz-Credential': string;
    'X-Amz-Date': string;
    Policy: string;
    'X-Amz-Signature': string;
  };
}
export interface S3FileInformationResponse {
  success: Array<S3FileInformation>;
}

export interface ConnRowData {
  id: string;
  projectId: number;
  targetProjectName: string;
  sourceProject: ProjectDataInterface[];
  source: string;
  metadata: any;
  sourceProjectId: string;
  agaveProjectId: string;
}

export interface AgaveLinkType {
  name: SourceSystemType;
  accountId: string;
}
