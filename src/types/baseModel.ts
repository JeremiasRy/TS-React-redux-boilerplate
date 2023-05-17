export type BaseId = {
    id:number
}

export interface BaseModel extends BaseId {
    createdAt:Date,
    updatedAt:Date
}

export interface BaseModelWithName extends BaseModel {
    name:string
}