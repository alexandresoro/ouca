import { EntiteSimple } from "./entite-simple.object";

export class EntiteResult<T> {

    public object: T;

    public messages: any[];

    public status: string;

}
