import { DocumentDto } from "../../../dto";
import MapperInterface from "../../../utils/common/mapper.interface";

class DocumentMapperImpl implements MapperInterface<DocumentDto> {
    mapToDto(requestBody: any): DocumentDto {
        const document = new DocumentDto();
        document.documentAuthor = requestBody.documentAuthor ? requestBody.documentAuthor : null;
        document.documentFile = requestBody.documentFile;
        document.documentLink = requestBody.documentLink;
        document.documentName = requestBody.documentName;
        document.documentType = requestBody.documentType;
        document.documentYear = requestBody.documentYear ? Number(requestBody.documentYear) : null;
        document.courseSlug = requestBody.courseSlug;
        return document;
    }


}

const DocumentMapper = new DocumentMapperImpl();
export default DocumentMapper;