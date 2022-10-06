export default class DocumentDto {
  documentAuthor?: string;
  documentLink?: string;
  documentName: string;
  documentType: string;
  documentYear?: number | null;
  documentFile: {
    fieldname: string,
    originalname: string,
    encoding: string,
    mimetype: string,
    destination: string,
    filename: string,
    path: string,
    size: number
  };
  courseSlug?: string;
}