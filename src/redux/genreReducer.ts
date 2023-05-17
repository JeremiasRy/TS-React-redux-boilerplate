import { Genre, GenreCreate, GenreUpdate } from "../types/genre";
import { BaseReducer } from "./generic/reducer";

export const genreReducer = new BaseReducer<Genre, GenreCreate, GenreUpdate>("https://localhost:7054/api/v1", "genre", "Genre");
export const { getAll, get, create, update, remove } = genreReducer.returnExtraReducers();