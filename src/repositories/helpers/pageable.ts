import { SelectQueryBuilder } from "typeorm";
import { PageableDto } from "../../dto";

export default class Pageable {
    limit: number;
    offset: number;


    constructor(dto: PageableDto) {
        this.limit = dto.limit;
        this.offset = dto.skip;
    }

    buildQuery(query: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
        query = query.limit(this.limit);
        query = query.offset(this.offset);
        return query;
    }

}