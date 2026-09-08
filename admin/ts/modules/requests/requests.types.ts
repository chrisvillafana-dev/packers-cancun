export type RequestStatus =
    | "new"
    | "contacted"
    | "closed";


export interface JoinRequest {

    id?: string;

    name: string;

    age: number;

    category: string;

    phone: string;

    experience: string;

    consent: boolean;

    status: RequestStatus;

    source: string;

    createdAt?: unknown;

}