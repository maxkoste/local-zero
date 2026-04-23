import { IMessage } from './message';
import { User } from './user';

export interface Chat {
    id: string;
    sender: User;
    receiver: User;
    body: string;

    children: IMessage[];

    addChild(child: IMessage): void;
    removeChild(childId: string): boolean;
    getChildren(): IMessage[];
}