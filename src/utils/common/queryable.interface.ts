import { SelectQueryBuilder } from "typeorm";

export default interface Queryable<Entity> {

    map: (requestBody: any) => Queryable<Entity>;

    buildQuery: (query: SelectQueryBuilder<Entity>) => SelectQueryBuilder<Entity>;
    
}