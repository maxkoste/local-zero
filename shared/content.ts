import { Visibility } from './visibility';

export type ContentType = 'initiative' | 'update' | 'comment';

export interface Image {
    id: string;
    url: string;
    alt?: string;
}

export interface Author {
    id: number;
    username: string;
    email: string;
    role?: string;
}

export interface ContentRecord {
    id: string;
    type: ContentType;
    title: string;
    author: Author;
    body: string;
    visibility: string;
    date: string;
    image: Image | null;
    location: string | null;
    duration: string | null;
    likes: string[];
    dislikes: string[];
    categories: string[];
    children: ContentRecord[];
}

export interface IContent {
    id: string;
    title: string;
    type: ContentType;
    author: Author;
    body: string;
    date: Date;
    visibility: Visibility;
    image?: Image;
    location?: string;
    duration?: string;
    likes: Set<string>;
    dislikes: Set<string>;
    categories: string[];
    children: IContent[];

    addChild(child: IContent): void;
    removeChild(childId: string): boolean;
    getChildren(): IContent[];
    getAllDescendants(): IContent[];
    toJSON(): ContentRecord;
}

const VALID_CHILDREN: Record<ContentType, ContentType[]> = {
    initiative: ['update'],
    update: ['comment'],
    comment: ['comment'],
};

export class Content implements IContent {
    id: string;
    title: string;
    type: ContentType;
    author: Author;
    body: string;
    date: Date;
    visibility: Visibility;
    image?: Image;
    location?: string;
    duration?: string;
    likes: Set<string> = new Set();
    dislikes: Set<string> = new Set();
    categories: string[] = [];
    children: IContent[] = [];

    constructor(
        id: string,
        title: string,
        type: ContentType,
        author: Author,
        body: string,
        date: Date = new Date(),
        visibility: Visibility,
        image?: Image,
        location?: string,
        duration?: string,
        categories: string[] = [],
    ) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.author = author;
        this.body = body;
        this.date = date;
        this.visibility = visibility;
        this.image = image;
        this.location = location;
        this.duration = duration;
        this.categories = categories;
    }

    addChild(child: IContent): void {
        const allowed = VALID_CHILDREN[this.type];
        if (allowed.indexOf(child.type) === -1) {
            throw new Error(
                `A ${this.type} cannot have a ${child.type} as a child. ` +
                `Allowed: ${allowed.join(', ')}.`
            );
        }
        this.children.push(child);
    }

    removeChild(childId: string): boolean {
        const before = this.children.length;
        this.children = this.children.filter(child => child.id !== childId);
        return this.children.length !== before;
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
            stack.push(...current.getChildren());
        }
        return descendants;
    }

    toJSON(): ContentRecord {
        return {
            id: this.id,
            type: this.type,
            title: this.title,
            author: this.author,
            body: this.body,
            visibility: this.visibility,
            date: this.date.toISOString(),
            image: this.image ?? null,
            location: this.location ?? null,
            duration: this.duration ?? null,
            likes: Array.from(this.likes),
            dislikes: Array.from(this.dislikes),
            categories: this.categories,
            children: this.children.map(c => (c as Content).toJSON()),
        };
    }

    static fromJSON(data: ContentRecord): Content {
        const content = new Content(
            data.id,
            data.title,
            data.type,
            data.author,
            data.body,
            new Date(data.date),
            data.visibility as Visibility,
            data.image ?? undefined,
            data.location ?? undefined,
            data.duration ?? undefined,
        );

        content.likes = new Set(data.likes);
        content.dislikes = new Set(data.dislikes);

        content.categories = data.categories ?? [];

        content.children = data.children.map(child => Content.fromJSON(child));

        return content;
    }
}