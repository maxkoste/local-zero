import { User } from './user'
import { Visibility } from './visibility'

export type ContentType = "initiative" | "update" | "comment";

export interface Content {
    id: string;
    title: string,
    type: ContentType;

    author: User;
    body: string;
    // images should be able to be stored too.
    location?: string;
    duration?: string;
    date: Date;

    likes: Set<string>;
    dislikes: Set<string>;

    children: Content[];
    
    visibility: Visibility;
}