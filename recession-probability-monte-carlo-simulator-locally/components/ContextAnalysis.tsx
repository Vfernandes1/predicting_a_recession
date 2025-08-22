
import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface ContextAnalysisProps {
  analysis: string;
  onGetContext: () => void;
  isLoading: boolean;
  hasResult: boolean;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full animate-pulse bg-indigo-400"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-indigo-400" style={{animationDelay: '0.2s'}}></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-indigo-400" style={{animationDelay: '0.4s'}}></div>
        <span className="ml-2 text-gray-400">Generating AI analysis...</span>
    </div>
);

// A simple markdown to HTML converter
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const createMarkup = () => {
        let html = text
            // Handle bold text: **text**
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
            // Handle paragraphs by splitting by newlines.
            .split(/\n\s*\n+/)
            .map(p => p.trim())
            .filter(p => p.length > 0)
            .map(p => {
                const lines = p.split('\n').map(line => {
                    // Handle numbered lists
                    if (/^\d+\.\s/.test(line)) {
                        return `<div class="flex"><span class="mr-2 text-indigo-400">${line.match(/^\d+\./)![0]}</span><span>${line.substring(line.indexOf('.') + 1).trim()}</span></div>`;
                    }
                    return line;
                }).join('<br/>');
                return `<p class="mb-4 text-gray-300">${lines}</p>`;
            })
            .join('');

        return { __html: html };
    };

    return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={createMarkup()} />;
};


export const ContextAnalysis: React.FC<ContextAnalysisProps> = ({ analysis, onGetContext, isLoading, hasResult }) => {
  return (
    <Card className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-2xl font-semibold text-white">AI-Powered Context</h2>
        <Button onClick={onGetContext} disabled={!hasResult || isLoading} variant="secondary">
          {isLoading ? 'Analyzing...' : 'Generate Analysis'}
        </Button>
      </div>
      <div className="min-h-[200px] bg-gray-900/70 p-4 rounded-lg border border-gray-700">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <LoadingSpinner />
          </div>
        ) : analysis ? (
          <SimpleMarkdown text={analysis} />
        ) : (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <p className="text-gray-500 text-center">
              {hasResult ? 'Click "Generate Analysis" to get qualitative insights from AI.' : 'Run a simulation first to enable context analysis.'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
