export type UserRole =
    | "admin"
    | "editor"
    | "viewer";


export interface CMSUser {

    uid?: string;

    name: string;

    email: string;

    role: UserRole;

    active: boolean;

    createdAt?: any;

}