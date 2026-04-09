import { ContentFactory } from './content-factory';
import { IContent, Image } from './content';
import { User } from '../user';
import {Visibility} from '../visibility';

export function createInitiative(
    id: string,
    title: string,
    author: User,
    body: string,
    visibility: Visibility,
    image?: Image,
    location?: string,
    duration?: string
): IContent {
    return ContentFactory.create(
        id,
        title,
        'initiative',
        author,
        body,
        new Date(),
        visibility,
        image,
        location,
        duration,
        undefined // no parent, i.e. orphan :(
    );
}

export function createUpdate(
    id: string,
    title: string,
    author: User,
    body: string,
    visibility: Visibility,
    parent: IContent,
    image?: Image,
    location?: string,
    duration?: string
): IContent {
    return ContentFactory.create(
        id,
        title,
        'update',
        author,
        body,
        new Date(),
        visibility,
        image,
        location,
        duration,
        parent
    );
}

export function createComment(
    id: string,
    title: string,
    author: User,
    body: string,
    visibility: Visibility,
    parent: IContent
): IContent {
    return ContentFactory.create(
        id,
        title,
        'comment',
        author,
        body,
        new Date(),
        visibility,
        undefined,
        undefined,
        undefined,
        parent
    );
}
