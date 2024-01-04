export interface MyFile {
    sentByUser: boolean;
    fileName: string;
    fileExtension: string;
    content: string | Uint8Array;
}