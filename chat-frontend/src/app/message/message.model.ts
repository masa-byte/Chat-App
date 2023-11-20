
export interface Message {
    sentByUser: boolean;
    fileName: string; // is actually a timestamp
    content: string;
}