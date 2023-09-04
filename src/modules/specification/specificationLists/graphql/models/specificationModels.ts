export abstract class Specifications {
  static modelName = "techspecUploadStatus";
  static selector = {
    id: "id",
    fileName: "fileName",
    fileSize: "fileSize",
    reviewedBy: "reviewedBy",
    sourceKey: "sourceKey",
    status: "status",
    createdAt: "createdAt",
    createdBy: "createdBy",
    versionInfo: "versionInfo",
    divisionsReviewed: "divisionsReviewed",
    sectionInfoReviewed: "sectionInfoReviewed",
    versionInfoReviewed: "versionInfoReviewed",
    createdByTenantUser: "createdByTenantUser",
    //sheets: 'sheets',
    progress: "progress",
    sectionInfo: "sectionInfo",
    user: "user",
    email: "email",
    firstName: "firstName",
    lastName: "lastName",
    isDeleted: "isDeleted",
  };
}
