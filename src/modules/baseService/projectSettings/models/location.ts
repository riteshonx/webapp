export class LocationNode{
    constructor(public  nodeName:string, public parentId:string|null, public id:string, public childNodes: Array<LocationNode>,
        public isOpen: boolean= false, public isEdit: boolean= false){}
}
