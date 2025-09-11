declare module "gray-matter" {
  export type GrayMatterFile<T = any> = {
    data: T;
    content: string;
    excerpt?: string;
    orig?: Buffer | string;
    language?: string;
    matter?: string;
    stringify?: (data?: any, options?: any) => string;
  };
  export default function matter(input: string): GrayMatterFile;
}

