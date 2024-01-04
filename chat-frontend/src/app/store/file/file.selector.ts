import { createFeatureSelector, createSelector } from "@ngrx/store";
import { FileState } from "./file.state";

export const selectFile = createFeatureSelector<FileState>('file');

export const selectCurrentFile = createSelector(
    selectFile,
    (state: FileState) => state.currentFile
);