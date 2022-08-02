export type dataUserType={
    id: number,
    private: boolean,
    paid: boolean,
    suspend: boolean,
    remove: boolean,
    active: boolean,
    block: boolean,
    admin: boolean,
    verify: boolean,
    session_id: number,
    gambar: string,
    user_nama: string,
    user_login: string,
    user_email: string,
    paid_expired: string|null,
} | null

export type UserPagination={
    id: number,
    picture: string|null,
    name: string,
    username: string,
}