import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BaseId, BaseModel } from "../../types/baseModel";
import axios, { AxiosError, AxiosResponse } from "axios";
import { RootState } from "../store";

export type SliceState<TModel> = { entities: TModel[] | TModel, state: 'idle' | 'pending' | 'succeeded' | 'failed'};

export class BaseReducer<TModel extends BaseModel, TCreate, TUpdate extends BaseId> {
    /**
     * baseUrl is backends url
     * entityName is the name of the entity you want to crud
     * endpoint is the endpoint of your backends location for this entity
     */
    constructor(baseUrl:string, entityName:string, endpoint:string) {
        this.baseUrl = baseUrl;
        this.reducerName = `${entityName}Reducer`
        this.endpoint = endpoint;
        this.entityName = entityName;
        
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
                    let state = thunkAPI.getState() as RootState;
                    
                    let result = await axios.get(
                        `${this.baseUrl}/${this.endpoint}`, 
                        {
                            headers: { Authorization: `Bearer ${state.authorization?.authToken}`},
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
        this.getById = createAsyncThunk<TModel, number, {rejectValue: AxiosError}>(
            `getById`,
            async (id:number, thunkAPI) => {
                try {
                    let state = thunkAPI.getState() as RootState;
                    let result = await axios.get(
                        `${this.baseUrl}/${this.endpoint}/${id}`,
                        {
                            headers: {Authorization: `Bearer ${state.authorization?.authToken}`}
                        });
                    return result.data;
                } catch (error) {
                    axios.isAxiosError(error) ? thunkAPI.rejectWithValue(error) : console.log(error);
                }
            });
        this.create = createAsyncThunk<TModel | undefined, TCreate, {rejectValue: AxiosError}>(
            `create${this.entityName.charAt(0).toLocaleUpperCase()}${this.entityName.slice(1)}`,
            async (create, thunkAPI) => {
                try {
                    let state = thunkAPI.getState() as RootState;
                    let result = await axios.post(
                        `${this.baseUrl}/${this.endpoint}`,
                        create,
                        {
                            headers: { Authorization: `Bearer ${state.authorization?.authToken}`}
                        });
                    return result.data;
                } catch (error) {
                    axios.isAxiosError(error) ? thunkAPI.rejectWithValue(error) : console.log(error);
                }
            }
        );
        this.update = createAsyncThunk<TModel | undefined, TUpdate, {rejectValue: AxiosError}>(
            `update${this.entityName.charAt(0).toLocaleUpperCase()}${this.entityName.slice(1)}`,
            async (update:TUpdate, thunkAPI) => {
                try {
                    let state = thunkAPI.getState() as RootState;
                    let result = await axios.put<any, AxiosResponse<TModel>, TUpdate>(
                        `${this.baseUrl}/${this.endpoint}/${update.id}`,
                        update,
                        {
                            headers: { Authorization: `Bearer ${state.authorization?.authToken}`}
                        }
                    )
                    return result.data;
                } catch (error) {
                    axios.isAxiosError(error) ? thunkAPI.rejectWithValue(error) : console.log(error);
                }
            }
        );
        this.remove = createAsyncThunk<boolean | undefined, number, {rejectValue: AxiosError}>(
            `delete${this.entityName.charAt(0).toLocaleUpperCase()}${this.entityName.slice(1)}`,
            async (id:number, thunkAPI) => {
                try {
                    let state = thunkAPI.getState() as RootState;

                    let result = await axios.delete<any, AxiosResponse<boolean>, any>(
                        `${this.baseUrl}/${this.endpoint}/${id}`,
                        {
                            headers: {Authorization: `Bearer ${state.authorization?.authToken}`}
                        });
                    return result.data;
                } catch (error) {
                    axios.isAxiosError(error) ? thunkAPI.rejectWithValue(error) : console.log(error);
                }
            }
        );
    };

    returnExtraReducers = () => {
        return {getAll: this.getAll, get: this.getById, create: this.create, update: this.update, remove: this.remove};
    }

    initialState:SliceState<TModel> = { state: 'idle', entities: [] }
    baseUrl:string;
    endpoint:string;
    entityName:string;
    reducerName:string;

    slice:ReturnType<typeof createSlice<SliceState<TModel>, {}, string>>;
    
    getAll:ReturnType<typeof createAsyncThunk<TModel[], {}, {rejectValue: AxiosError}>>; 
    getById:ReturnType<typeof createAsyncThunk<TModel, number, {rejectValue: AxiosError}>>;
    create:ReturnType<typeof createAsyncThunk<TModel | undefined, TCreate, {rejectValue: AxiosError}>>;
    update:ReturnType<typeof createAsyncThunk<TModel |undefined, TUpdate, {rejectValue: AxiosError}>>;
    remove:ReturnType<typeof createAsyncThunk<boolean | undefined, number, {rejectValue: AxiosError}>>;
}