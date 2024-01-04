import { createReducer, on } from "@ngrx/store";
import { FileState } from "./file.state";
import * as FileActions from './file.actions';

const initialState: FileState = {
    currentFile: null
};


export const fileReducer = createReducer(
    initialState,
    on(FileActions.setCurrentFile, (state, { currentFile }) => {
        return {
            ...state,
            currentFile
        }
    })
);