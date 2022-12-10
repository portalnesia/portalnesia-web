import type { IDate, Without } from "@type/general";
import type { UserPagination } from "./user";

type BaseQuizPagination = {
    id: string,
    title: string,
    public: boolean,
    publish: boolean,
    total_response: number,
    link: string,
    user?: UserPagination
}

export type QuizPagination = BaseQuizPagination & {
    id_number: number,
}

interface BaseQuizDetail extends Without<BaseQuizPagination,'total_response'> {
    total_question: number;
    is_login?: boolean;
    is_answered?: boolean;
    progress?: number;
    my_name?: string|null;
    ques?: number|boolean;
    ques_global?: Record<number,number>;
    me_global?:  Record<number,number>;
    kuki?: number[]
    user_respon?: QuizResponseDetail
    user: UserPagination
}

export type QuizQuestionPack = {
    question: string,
    answer: string,
    choise: string[]
}[]

type EditableQuizDetail = {
    self_answer: boolean,
    answer: string[],
    question: string[],
    choise: string[][]
}

type NotEditableQuizDetail = {
    self_answer?: boolean,
    quiz?: QuizQuestionPack
}

export type QuizDetail = BaseQuizDetail & {id_number: number}  & NotEditableQuizDetail

export type QuizDetailEditable = BaseQuizDetail & EditableQuizDetail & {id_number: number};

type BaseQuizResponsePagination = {
    id: string,
    name: string,
    score: number,
    timestamp: IDate
}

export type QuizResponsePagination = (BaseQuizResponsePagination & {
    id_number: number
})

export interface QuizResponseDetail extends BaseQuizResponsePagination {
    result:{
        question: string
        answer: string|null;
        correct_answer: string;
    }[]
    quiz:{
        id: string,
        title: string,
        total_answer: number,
        user: UserPagination
    },
}