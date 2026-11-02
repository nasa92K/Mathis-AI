import { Children, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock.jsx';

const components = {
  // Les blocs ```code``` passent par <pre> : on les remplace par CodeBlock.
  pre({ children }) {
    const child = Children.toArray(children)[0];
    const className = child?.props?.className ?? '';
    const language = /language-([\w+#-]+)/.exec(className)?.[1];
    const code = String(child?.props?.children ?? '').replace(/\n$/, '');
    return <CodeBlock language={language} code={code} />;
  },
  code({ className, children }) {
    return <code className={className || 'inline-code'}>{children}</code>;
  },
  a({ href, children }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  table({ children }) {
    return (
      <div className="table-wrapper">
        <table>{children}</table>
      </div>
    );
  },
};

/** Rendu Markdown (GFM : tableaux, listes de tâches, barré…). Pas de HTML brut. */
function MarkdownContent({ content }) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default memo(MarkdownContent);
