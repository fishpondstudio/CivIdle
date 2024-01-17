export function RenderHTML({ html }: { html: string }): React.ReactNode {
   /* biome-ignore lint/security/noDangerouslySetInnerHtml: */
   return <div dangerouslySetInnerHTML={{ __html: html }}></div>;
}
