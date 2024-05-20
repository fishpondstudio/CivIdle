export function RenderHTML({
   html,
   className,
   style,
}: { html: string; className?: string; style?: React.CSSProperties }): React.ReactNode {
   /* biome-ignore lint/security/noDangerouslySetInnerHtml: */
   return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: html }}></div>;
}
