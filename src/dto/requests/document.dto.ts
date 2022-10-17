import FileDto from "./file.dto";

export default class DocumentDto {
  documentAuthor?: string;
  documentLink?: string;
  documentName: string;
  documentType: string;
  documentYear?: number | null;
  documentFile: FileDto;
  courseSlug?: string;
}