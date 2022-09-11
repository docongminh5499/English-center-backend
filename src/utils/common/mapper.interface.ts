export default interface Mapper<DTO> {

    mapToDto: (requestBody: any) => DTO;
    
}