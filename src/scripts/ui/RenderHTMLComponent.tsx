export function RenderHTML({ html, className }: { html: string; className?: string }): React.ReactNode {
   /* biome-ignore lint/security/noDangerouslySetInnerHtml: */
   return <div className={className} dangerouslySetInnerHTML={{ __html: html }}></div>;
}
