// Shared Types for CrystalTides SMP

export interface PlayerStats {
    playtime: string;
    kills: number;
    mob_kills: number;
    deaths: number;
    money: string | number;
    blocks_mined: string | number;
    blocks_placed: string | number;
    raw_playtime?: number;
    raw_kills?: number;
    raw_blocks_mined?: number;
    raw_rank?: string;
}

export interface UserMetadata {
    role: string;
    username: string;
    avatar_url?: string;
    full_name?: string;
    minecraft_uuid?: string;
    minecraft_nick?: string;
    public_stats: boolean;
    medals?: (string | number)[];
    bio?: string;
    social_discord?: string;
    social_twitter?: string;
    social_twitch?: string;
    social_youtube?: string;
}

export interface ForumThread {
    id: number;
    category_id: number;
    author_name: string;
    author_avatar?: string;
    author_role: string;
    title: string;
    content: string;
    views: number;
    created_at: string;
    pinned: boolean;
    locked: boolean;
    poll_id?: string;
}

export interface ForumPost {
    id: number;
    thread_id: number;
    author_name: string;
    author_avatar?: string;
    author_role: string;
    content: string;
    created_at: string;
}
