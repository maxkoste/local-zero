import { User } from '../user';
import { Visibility } from '../visibility';
import { IContent, Content, ContentType, Image } from './content';

export class ContentFactory {

    static create(
        id: string,
        title: string,
        type: ContentType,
        author: User,
        body: string,
        date: Date = new Date(),
        visibility: Visibility,

        image?: Image,
        location?: string,
        duration?: string,
        parent?: IContent

    ): IContent {
        if (type === 'initiative' && parent !== undefined) {
            throw new Error('An initiative cannot have a parent');
        }
        if (type !== 'initiative' && parent === undefined) {
            throw new Error(
                `A ${type} must be created with a parent (initiative or update)`
            );
        }

        const content = new Content(
            id,
            title,
            type,
            author,
            body,
            date,
            visibility,
            image,
            location,
            duration,
        );

        if (parent) {
            parent.addChild(content);
        }

        return content;
    }
}