import { ContentType, Image, Author, Visibility, Content } from 'shared';

export class ContentFactory {
    private static create(
        id: string,
        title: string,
        type: ContentType,
        author: Author,
        body: string,
        date: Date,
        visibility: Visibility,
        image: Image | null = null,
        location: string | null = null,
        duration: string | null = null,
        categories: string[] = [],
    ): Content {
        const c = new Content(id, title, type, author, body, date, visibility, image, location, duration, categories);
        return c;
    }

    static createInitiative(
        id: string,
        title: string,
        author: Author,
        body: string,
        visibility: Visibility,
        image: Image | null = null,
        location: string | null = null,
        duration: string | null = null,
        categories: string[] = [],
    ): Content {
        return ContentFactory.create(
            id, title, 'initiative', author, body, new Date(), visibility, image, location, duration, categories,
        );
    }

    static createUpdate(
        id: string,
        title: string,
        author: Author,
        body: string,
        visibility: Visibility,
        image: Image | null = null,
        location: string | null = null,
        duration: string | null = null,
    ): Content {
        return ContentFactory.create(
            id, title, 'update', author, body, new Date(), visibility, image, location, duration,
        );
    }

    static createComment(
        id: string,
        title: string,
        author: Author,
        body: string,
        visibility: Visibility,
    ): Content {
        return ContentFactory.create(
            id, title, 'comment', author, body, new Date(), visibility,
        );
    }
}