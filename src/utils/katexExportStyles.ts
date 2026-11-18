import license from '/node_modules/katex/LICENSE?raw';
import css from 'katex/dist/katex.min.css?raw';

const fonts = import.meta.glob<string>('/node_modules/katex/dist/fonts/*.woff2', {
  eager: true,
  import: 'default',
  query: '?inline',
});

export const katexExportStyles = css.replace(
  /url\(fonts\/([^)]*\.woff2)\) format\("woff2"\)[^;}]+/g,
  (source, filename: string) => {
    const font = fonts[`/node_modules/katex/dist/fonts/${filename}`];
    if (!font) return source;
    return `url("${font}") format("woff2")`;
  }
);

export const katexExportNotice = license;
