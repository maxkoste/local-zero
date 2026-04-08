import { User } from './user'
import { Visibility } from './visibility'

export type ContentType = "initiative" | "update" | "comment";

export interface Content {
    id: string;
    title: string,
    type: ContentType;

    author: User;
    content: string;
    location?: string;
    duration?: string;
    date: Date;

    likes: Set<string>;
    dislikes: Set<string>;

    children: Content[];
    
    visibility: Visibility;
}