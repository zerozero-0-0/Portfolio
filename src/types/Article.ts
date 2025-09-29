export type Article = {
    title: string;
    createdDate: string; // ISO 8601 format
    updatedDate: string; // ISO 8601 format
    tags?: string[];
    slug: string;
    path: string;
}
