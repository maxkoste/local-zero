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

export interface IContent {
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
    members: string[];
    categories: string[];
    children: IContent[];
}