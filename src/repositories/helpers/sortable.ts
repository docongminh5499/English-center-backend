import { SelectQueryBuilder } from "typeorm";


interface SortablePropertyInterface {
    fieldName: string;
    type: "ASC" | "DESC" | undefined;
}

export default class Sortable {
    fields: SortablePropertyInterface[] = [];

    add(fieldName: string, type: "ASC" | "DESC" | undefined) {
        this.fields.push({
            fieldName, type: type || "ASC"
        });
        return this;
    }


    buildQuery(query: SelectQueryBuilder<any>) {
        for (let index = 0; index < this.fields.length; index++) {
            const field = this.fields[index];
            if (index == 0) query = query.orderBy(field.fieldName, field.type);
            else query = query.addOrderBy(field.fieldName, field.type);
        }
        return query;
    }
}