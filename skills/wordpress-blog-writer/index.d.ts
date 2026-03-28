/**
 * wordpress-blog-writer
 * WordPress 博客写作助手 Skill
 *
 * 功能：从构思到发布完整的博客文章
 * 触发：写博客、写文章、写日志、写日记等
 */
export declare function shouldTrigger(message: string): boolean;
export declare function handle(message: string, context: any): Promise<string>;
declare function createOutline(topic: string): string;
/**
 * Markdown 转 HTML（WordPress 兼容格式）
 */
declare function markdownToHtml(markdown: string): string;
declare function createMarkdown(title: string, content: string, category: string, tags: string[], author?: string): string;
declare function saveMarkdown(filename: string, content: string): Promise<string>;
declare function commitToGithub(message: string): Promise<void>;
/**
 * 发布到 WordPress 草稿箱（使用 REST API）
 */
declare function publishToWordPressDraft(title: string, content: string, category: string, tags: string[]): Promise<number>;
/**
 * 正式发布 WordPress 文章
 */
declare function publishWordPressPost(postId: number): Promise<void>;
declare function getDraftEditLink(postId: number): string;
declare const _default: {
    shouldTrigger: typeof shouldTrigger;
    handle: typeof handle;
    createOutline: typeof createOutline;
    createMarkdown: typeof createMarkdown;
    saveMarkdown: typeof saveMarkdown;
    commitToGithub: typeof commitToGithub;
    publishToWordPressDraft: typeof publishToWordPressDraft;
    publishWordPressPost: typeof publishWordPressPost;
    getDraftEditLink: typeof getDraftEditLink;
    markdownToHtml: typeof markdownToHtml;
};
export default _default;
//# sourceMappingURL=index.d.ts.map