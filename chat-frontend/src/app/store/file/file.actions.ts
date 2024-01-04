import { createAction, props } from "@ngrx/store";
import { MyFile } from "src/app/file/file.model";

export const setCurrentFile = createAction('[File] Set Current File', props<{ currentFile: MyFile }>());