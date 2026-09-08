export interface Player {

    id?: string;

    name: string;

    number: number;

    category: string;

    position: string;

    photo: string;

    bio: string;

    touchdowns: number;

    interceptions: number;

    gamesPlayed: number;

    seasons?: number;

    achievement?: string;

    instagram?: string;

    tiktok?: string;

    highlights?: string;

    published: boolean;

    createdAt?: unknown;

}