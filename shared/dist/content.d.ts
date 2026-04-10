import { User } from './user';
import { Visibility } from './visibility';
export type ContentType = 'initiative' | 'update' | 'comment';
export interface Image {
    id: string;
    url: string;
    alt?: string;
}
export interface IContent {
    id: string;
    title: string;
    type: ContentType;
    author: User;
    body: string;
    date: Date;
    visibility: Visibility;
    image?: Image;
    location?: string;
    duration?: string;
    likes: Set<string>;
    dislikes: Set<string>;
    children: IContent[];
    addChild(child: IContent): void;
    removeChild(childId: string): boolean;
    getChildren(): IContent[];
    getAllDescendants(): IContent[];
}
export declare class Content implements IContent {
    id: string;
    title: string;
    type: ContentType;
    author: User;
    body: string;
    date: Date;
    visibility: Visibility;
    image?: Image;
    location?: string;
    duration?: string;
    likes: Set<string>;
    dislikes: Set<string>;
    children: IContent[];
    constructor(id: string, title: string, type: ContentType, author: User, body: string, date: Date | undefined, visibility: Visibility, image?: Image, location?: string, duration?: string);
    addChild(child: IContent): void;
    removeChild(childId: string): boolean;
    getChildren(): IContent[];
    getAllDescendants(): IContent[];
}
