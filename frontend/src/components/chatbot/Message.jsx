import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Copy, Check } from 'lucide-react';

function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-slate-300 text-xs font-mono border-b border-slate-700/50">
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="bg-[#282c34] p-5 overflow-x-auto text-slate-100 text-[13.5px] font-mono leading-relaxed">
        <code>{value}</code>
      </pre>
    </div>
  );
}

export default function Message({ role, text, timestamp }) {
  const isUser = role === "user";

  const renderers = {
    code({ node, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match;

      if (!isInline) {
        return (
          <CodeBlock
            language={match[1]}
            value={String(children).replace(/\n$/, '')}
            {...props}
          />
        );
      }

      return (
        <code
          className={`px-1.5 py-0.5 rounded text-xs font-mono border ${
            isUser
              ? 'bg-neutral-700/50 text-neutral-100 border-neutral-600/20'
              : 'bg-slate-100 text-pink-600 border-slate-200/50'
          }`}
          {...props}
        >
          {children}
        </code>
      );
    },
    p: ({ children }) => (
      <p className={`mb-2 last:mb-0 leading-relaxed text-sm ${isUser ? 'text-white' : 'text-slate-800'}`}>
        {children}
      </p>
    ),
    ol: ({ children }) => (
      <ol className={`list-decimal pl-6 mb-3 space-y-1 text-sm ${isUser ? 'text-white' : 'text-slate-800'}`}>
        {children}
      </ol>
    ),
    ul: ({ children }) => (
      <ul className={`list-disc pl-6 mb-3 space-y-1 text-sm ${isUser ? 'text-white' : 'text-slate-800'}`}>
        {children}
      </ul>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    h1: ({ children }) => (
      <h1 className={`text-base font-bold mt-4 mb-2 ${isUser ? 'text-white' : 'text-slate-900'}`}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className={`text-sm font-bold mt-3 mb-2 ${isUser ? 'text-white' : 'text-slate-900'}`}>
        {children}
      </h2>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className={`border-l-4 pl-4 italic my-2 py-1 rounded-r text-sm ${
          isUser
            ? 'border-neutral-500 text-neutral-300 bg-neutral-800/20'
            : 'border-slate-300 text-slate-500 bg-slate-50'
        }`}
      >
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-3 rounded-xl border border-slate-200 shadow-sm bg-white">
        <table className="w-full border-collapse text-left">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-slate-50 border-b border-slate-200">{children}</thead>,
    th: ({ children }) => <th className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{children}</th>,
    td: ({ children }) => <td className="px-4 py-2 text-sm border-b border-slate-100 text-slate-700">{children}</td>,
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`hover:underline transition-colors ${isUser ? 'text-neutral-200 hover:text-white' : 'text-neutral-800 hover:text-neutral-900'}`}
      >
        {children}
      </a>
    ),
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-neutral-700' : 'bg-neutral-800'
          }`}>
            {isUser ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <div className={`px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-neutral-800 text-white rounded-br-none'
              : 'bg-white text-gray-800 rounded-bl-none border border-slate-200/80'
          }`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={renderers}
            >
              {text}
            </ReactMarkdown>
          </div>
          {timestamp && (
            <span className={`text-[10px] text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
