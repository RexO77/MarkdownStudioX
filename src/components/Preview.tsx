
import React, { useEffect, useRef, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';
import { convertMarkdownToHtml } from '@/utils/markdownUtils';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';

interface PreviewProps {
  content: string;
  className?: string;
}

const Preview = React.memo(({ content, className }: PreviewProps) => {
  const previewRef = useRef<HTMLDivElement>(null);

  const rawHtml = convertMarkdownToHtml(content);

  // Sanitize HTML to prevent XSS attacks
  const html = DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['target', 'rel', 'data-language'],
    FORBID_TAGS: ['script', 'style'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover']
  });

  // Apply syntax highlighting and add copy buttons after render
  useEffect(() => {
    if (!previewRef.current) return;

    // Syntax highlighting with Prism
    const codeBlocks = previewRef.current.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
      Prism.highlightElement(block);
    });

    // Add copy buttons to code blocks
    const preBlocks = previewRef.current.querySelectorAll('pre');
    preBlocks.forEach((pre) => {
      // Skip if already has copy button
      if (pre.querySelector('.copy-button')) return;
      if (pre.parentElement?.classList.contains('relative')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'relative group';
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button absolute top-2 right-2 px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1';
      copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><span>Copy</span>';
      copyButton.onclick = () => {
        const code = pre.querySelector('code')?.textContent || '';
        navigator.clipboard.writeText(code);
        copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>Copied!</span>';
        copyButton.classList.add('bg-green-600');
        copyButton.classList.remove('bg-gray-700');
        setTimeout(() => {
          copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><span>Copy</span>';
          copyButton.classList.remove('bg-green-600');
          copyButton.classList.add('bg-gray-700');
        }, 2000);
      };
      wrapper.appendChild(copyButton);
    });
  }, [html]);

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <div className="flex-1 overflow-auto">
        <div
          ref={previewRef}
          className="prose prose-slate dark:prose-invert max-w-none p-4 md:p-8 bg-background
            prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-6 prose-h1:border-b prose-h1:pb-2
            prose-h2:text-3xl prose-h2:font-bold prose-h2:mb-5 prose-h2:border-b prose-h2:pb-2
            prose-h3:text-2xl prose-h3:font-bold prose-h3:mb-4
            prose-h4:text-xl prose-h4:font-bold prose-h4:mb-3
            prose-h5:text-lg prose-h5:font-bold prose-h5:mb-2
            prose-h6:text-base prose-h6:font-bold prose-h6:mb-2
            prose-p:my-4 prose-p:leading-7 prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 
            prose-code:rounded-md prose-code:text-sm prose-code:text-gray-800 dark:prose-code:text-gray-200
            prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-pre:p-4 
            prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-4
            prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
            prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
            prose-li:my-2 prose-li:text-gray-700 dark:prose-li:text-gray-300
            prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600 
            prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 
            dark:prose-blockquote:text-gray-300
            prose-img:rounded-lg prose-img:shadow-md
            prose-strong:text-gray-900 dark:prose-strong:text-gray-100
            prose-em:text-gray-800 dark:prose-em:text-gray-200
            transition-colors duration-200"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
});

Preview.displayName = 'Preview';

export default Preview;
