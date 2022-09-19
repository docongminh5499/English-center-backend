import { SelectQueryBuilder } from "typeorm";

export default class Selectable {
    fields: { [key: string]: string | undefined }[] = [];

    add(fieldName: string, aliasName?: string) {
        this.fields.push({
            fieldName: fieldName,
            aliasName: aliasName
        });
        return this;
    }

    buildQuery(query: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
        const result: string[] = [];
        this.fields.forEach(field => {
            if (field.aliasName === undefined) result.push(`${field.fieldName}`);
            else result.push(`${field.fieldName} AS ${field.aliasName}`);
        });
        query = query.select(result);
        return query;
    }
}