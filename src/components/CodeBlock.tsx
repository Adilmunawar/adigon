
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  content: string;
}

const CodeBlock = ({ content }: CodeBlockProps) => {
  return (
    <div className="prose prose-invert max-w-none break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({node, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '')
            return match ? (
              <SyntaxHighlighter
                style={vscDarkPlus as any}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default CodeBlock;
