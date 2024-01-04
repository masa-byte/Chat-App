import { EntityState } from "@ngrx/entity";
import { MyFile } from "src/app/file/file.model";

export interface FileState {
    currentFile: MyFile | null;
}