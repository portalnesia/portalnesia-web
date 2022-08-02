import {IDate,ISeen} from './types'
import {UserPagination} from './user'

export type IBaseFiles = {
    id: string,
    id_number: number,
    title: string,
    created: IDate,
    private: boolean,
    type: 'video'|'audio'|'images'|'youtube',
    size: number,
    thumbs: string|null,
    url: string,
    artist?: string,
}

export interface IFiles extends IBaseFiles {
    can_set_profile?: boolean,
    is_profile_picture?: boolean
}

export interface IFilesDetail extends IBaseFiles {
    seen: ISeen;
    user: UserPagination
}

export interface UnsplashTypes {
    id: string;
    height: number;
    width: number;
    likes: number;
    url: string;
    created: IDate
    last_modified: IDate;
    user:{
        links: {
            followers: string;
            following: string;
            html: string;
            likes: string;
            photos: string;
            portfolio: string;
            self: string;
        };
        name: string;
        username: string;
    }
}

export type PixabayTypes = {
    id:number,
    type:string,
    thumbs:string,
    url:string,
    views:number,
    user_id:number,
    user:string,
}