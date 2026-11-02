import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import { copyToClipboard } from '../../utils/helpers.js';

// Langages pris en charge (+ alias courants). Ajoute-en ici si besoin.
const LANGUAGES = {
  bash: [bash, 'sh', 'shell', 'zsh', 'powershell', 'ps1', 'console'],
  c: [c],
  cpp: [cpp, 'c++'],
  csharp: [csharp, 'cs'],
  css: [css, 'scss'],
  go: [go],
  java: [java],
  javascript: [javascript, 'js', 'mjs', 'node'],
  json: [json],
  jsx: [jsx],
  markdown: [markdown, 'md'],
  markup: [markup, 'html', 'xml', 'svg'],
  php: [php],
  python: [python, 'py'],
  rust: [rust, 'rs'],
  sql: [sql],
  tsx: [tsx],
  typescript: [typescript, 'ts'],
  yaml: [yaml, 'yml'],
};

for (const [name, [grammar, ...aliases]] of Object.entries(LANGUAGES)) {
  SyntaxHighlighter.registerLanguage(name, grammar);
  for (const alias of aliases) SyntaxHighlighter.registerLanguage(alias, grammar);
}

const codeStyle = {
  margin: 0,
  padding: '16px 18px',
  background: 'transparent',
  fontSize: '0.86rem',
  lineHeight: 1.6,
};

/** Bloc de code avec coloration syntaxique et bouton de copie. */
export default function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (await copyToClipboard(code)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="code-block">
      <div className="code-block__header">
        <span className="code-block__lang">{language || 'code'}</span>
        <button type="button" className="code-block__copy" onClick={handleCopy} aria-label="Copier le code">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copié' : 'Copier'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        language={language?.toLowerCase() || 'text'}
        style={oneDark}
        customStyle={codeStyle}
        codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
