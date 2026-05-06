import { User } from './user';

export interface IMessage {
    id: string;
    sender: User;
    body: string;
    date: Date;
}