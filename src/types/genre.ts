import { BaseId, BaseModelWithName } from "./baseModel"

export interface Genre extends BaseModelWithName  {
};
export interface GenreCreate {
    name:string
};
export interface GenreUpdate extends BaseId {
    name:string
};
