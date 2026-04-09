import { User } from '../user';
import { Visibility } from '../visibility';

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

export class Content implements IContent {
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

    likes: Set<string> = new Set();
    dislikes: Set<string> = new Set();

    children: IContent[] = [];

    constructor(
        id: string,
        title: string,
        type: ContentType,
        author: User,
        body: string,
        date: Date = new Date(),
        visibility: Visibility,
        image?: Image,
        location?: string,
        duration?: string
    ) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.author = author;
        this.body = body;
        this.visibility = visibility;
        this.date = date;
        this.image = image;
        this.location = location;
        this.duration = duration;
    }

    addChild(child: IContent): void {
        this.children.push(child);
    }

    removeChild(childId: string): boolean {
        const initialLength = this.children.length;
        this.children = this.children.filter(child => child.id !== childId);
        return this.children.length !== initialLength;
    }

    getChildren(): IContent[] {
        return [...this.children];
    }

    getAllDescendants(): IContent[] {
        const descendants: IContent[] = [];
        const stack = [...this.children];

        while (stack.length > 0) {
        const current = stack.pop()!;
        descendants.push(current);
        stack.push(...current.children);
        }

        return descendants;
    }
}