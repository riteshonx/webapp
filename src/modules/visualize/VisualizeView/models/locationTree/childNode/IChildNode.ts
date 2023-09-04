import { ILocationModelLink } from '../ILocationModelLink';

export interface IChildNode {
    id: string;
    name: string;
    parentId: string;

    childNodes: IChildNode[];
    locationModelLink?: ILocationModelLink;
}