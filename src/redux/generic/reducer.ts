import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BaseId, BaseModel } from "../../types/baseModel";
import axios, { AxiosError, AxiosResponse } from "axios";

export type SliceState<TModel> = { entities: TModel[] | TModel, state: 'idle' | 'pending' | 'succeeded' | 'failed'};

export class BaseReducer<TModel extends BaseModel, TCreate, TUpdate extends BaseId> {
    initialState:SliceState<TModel> = { state: 'idle', entities: [] }
    baseUrl:string;
    endpoint:string;
    nameSingle:string;
    reducerName:string;
    /**
     *
     */
    constructor(baseUrl:string, nameSingle:string, endpoint:string) {
        this.baseUrl = baseUrl;
        this.reducerName = `${nameSingle}Reducer`
        this.endpoint = endpoint;
        this.nameSingle = nameSingle;
        
        this.slice = createSlice({
            name: this.reducerName,
            initialState: this.initialState,
            reducers: {},
            extraReducers: builder => {
                builder.addCase(this.getAll.fulfilled, (_, action) => {
                    return { state: 'succeeded', entities: action.payload };
                });
                builder.addCase(this.getById.fulfilled, (_, action) => {
                    return { state: 'succeeded', entities: action.payload };
                });
                builder.addCase(this.create.fulfilled, (_, action) => {
                    return { state: 'succeeded', entities: action.payload as TModel };
                });
                builder.addCase(this.update.fulfilled, (_, action) => {
                    return { state: 'succeeded', entities: action.payload as TModel };
                });
                builder.addCase(this.remove.fulfilled, (state, action) => {
                    let result:SliceState<TModel> = {
                        state: 'succeeded',
                        entities: []
                    };
                    if (action.payload) {
                        if (Array.isArray(state.entities)) {
                            result.entities = state.entities.filter(entity => entity.id != action.meta.arg) as TModel[];
                        } else {
                            if (state.entities.id != action.meta.arg) {
                                throw new Error("Somehow deleted something that didn't exists");
                            }
                            result.entities = [];
                        }
                        return result;
                    } else {
                        result.entities = state.entities as TModel[];
                        return result;
                    }
                });
            }
        })
        this.getAll = createAsyncThunk<TModel[], {}, {rejectValue: AxiosError}>(
            "getAll",
            async (request:{}, thunkAPI) => {
                try {
                    let result = await axios.get(
                   `${this.baseUrl}/${this.endpoint}`, 
                    {
                        params: { ...request },
                    });
                    return result.data;
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        return thunkAPI.rejectWithValue(error as AxiosError)
                    } else {
                        console.log("Something went horribly wrong... sorry!");
                    }
                }
            });
        this.getById = createAsyncThunk(
            `getById`,
            async (id:number) => {
                try {
                    let result = await axios.get(`${this.baseUrl}/${this.endpoint}/${id}`)
                    return result.data;
                } catch (error) {
                    axios.isAxiosError(error) ? BaseReducer.handleAxiosError(error) : console.log(error);
                }
            });
        this.create = createAsyncThunk(
            `create${this.nameSingle.charAt(0).toLocaleUpperCase()}${this.nameSingle.slice(1)}`,
            async (create:TCreate) => {
                try {
                    let result = await axios.post<any, AxiosResponse<TModel>, TCreate>(
                        `${this.baseUrl}/${this.endpoint}`,
                        create
                        )
                    return result.data;
                } catch (error) {
                    axios.isAxiosError(error) ? BaseReducer.handleAxiosError(error) : console.log(error);
                }
            }
        );
        this.update = createAsyncThunk(
            `update${this.nameSingle.charAt(0).toLocaleUpperCase()}${this.nameSingle.slice(1)}`,
            async (update:TUpdate) => {
                try {
                    let result = await axios.put<any, AxiosResponse<TModel>, TUpdate>(
                        `${this.baseUrl}/${this.endpoint}/${update.id}`,
                        update
                    )
                    return result.data;
                } catch (error) {
                    axios.isAxiosError(error) ? BaseReducer.handleAxiosError(error) : console.log(error);
                }
            }
        );
        this.remove = createAsyncThunk(
            `delete${this.nameSingle.charAt(0).toLocaleUpperCase()}${this.nameSingle.slice(1)}`,
            async (id:number) => {
                try {
                    let result = await axios.delete<any, AxiosResponse<boolean>, any>(`${this.baseUrl}/${this.endpoint}/${id}`);
                    return result.data;
                } catch (error) {
                    axios.isAxiosError(error) ? BaseReducer.handleAxiosError(error) : console.log(error);
                }
            }
        );
    };

    returnExtraReducers = () => {
        return {getAll: this.getAll, get: this.getById, create: this.create, update: this.update, remove: this.remove};
    }

    static handleAxiosError = (error:AxiosError) => {
        console.log(error.name);
        console.log(error.cause);
        console.log(error.message);
    }

    slice:ReturnType<typeof createSlice<SliceState<TModel>, {}, string>>;
    
    getAll:ReturnType<typeof createAsyncThunk<TModel[], {}, {rejectValue: AxiosError}>>; 
    getById:ReturnType<typeof createAsyncThunk<TModel, number>>;
    create:ReturnType<typeof createAsyncThunk<TModel | undefined, TCreate>>;
    update:ReturnType<typeof createAsyncThunk<TModel | undefined, TUpdate>>;
    remove:ReturnType<typeof createAsyncThunk<boolean | undefined, number>>;
}