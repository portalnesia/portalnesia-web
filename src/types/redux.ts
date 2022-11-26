import { UserPagination } from "@model/user";
import {HYDRATE} from 'next-redux-wrapper';

export type State = {
    theme:'auto'|'light'|'dark',
    redux_theme:'light'|'dark',
    user?: UserPagination | null,
    appToken?: string
}

export type ActionType = {
    type: typeof HYDRATE,
    payload: Partial<State>
} | {
    type: 'CHANGE_THEME',
    payload: State['theme']
} | {
    type: 'REDUX_THEME',
    payload: State['redux_theme']
} | {
    type:'CUSTOM',
    payload: Partial<State>
}