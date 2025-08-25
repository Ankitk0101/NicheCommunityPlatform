import { useState, useRef } from 'react';
import { Bold, Italic, List, Quote, Link, Image } from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder, disabled, compact, autoFocus }) => {
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleFormat = (format) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newValue = value;
    let newSelectionStart = start;
    let newSelectionEnd = end;
    
    switch (format) {
      case 'bold':
        if (selectedText) {
          newValue = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
          newSelectionStart = start + 2;
          newSelectionEnd = end + 2;
        } else {
          newValue = value.substring(0, start) + '**bold text**' + value.substring(end);
          newSelectionStart = start + 2;
          newSelectionEnd = start + 11;
        }
        break;
      
      case 'italic':
        if (selectedText) {
          newValue = value.substring(0, start) + `*${selectedText}*` + value.substring(end);
          newSelectionStart = start + 1;
          newSelectionEnd = end + 1;
        } else {
          newValue = value.substring(0, start) + '*italic text*' + value.substring(end);
          newSelectionStart = start + 1;
          newSelectionEnd = start + 12;
        }
        break;
      
      case 'list':
        if (selectedText) {
          const lines = selectedText.split('\n');
          const formattedLines = lines.map(line => line ? `- ${line}` : '').join('\n');
          newValue = value.substring(0, start) + formattedLines + value.substring(end);
          newSelectionStart = start;
          newSelectionEnd = end + (lines.length * 2);
        } else {
          newValue = value.substring(0, start) + '- List item' + value.substring(end);
          newSelectionStart = start + 2;
          newSelectionEnd = start + 11;
        }
        break;
      
      case 'quote':
        if (selectedText) {
          const lines = selectedText.split('\n');
          const formattedLines = lines.map(line => line ? `> ${line}` : '').join('\n');
          newValue = value.substring(0, start) + formattedLines + value.substring(end);
          newSelectionStart = start;
          newSelectionEnd = end + (lines.length * 2);
        } else {
          newValue = value.substring(0, start) + '> Quote' + value.substring(end);
          newSelectionStart = start + 2;
          newSelectionEnd = start + 7;
        }
        break;
      
      case 'link':
        if (selectedText) {
          newValue = value.substring(0, start) + `[${selectedText}](url)` + value.substring(end);
          newSelectionStart = end + 3;
          newSelectionEnd = end + 6;
        } else {
          newValue = value.substring(0, start) + '[link text](url)' + value.substring(end);
          newSelectionStart = start + 1;
          newSelectionEnd = start + 10;
        }
        break;
      
      default:
        break;
    }
    
    onChange(newValue);
    
    // Set selection after state update
    setTimeout(() => {
      textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
      textarea.focus();
    }, 0);
  };

  return (
    <div className={`border rounded-lg overflow-hidden transition-colors ${
      isFocused ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
    } ${compact ? 'text-sm' : ''}`}>
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex space-x-1">
        <button
          type="button"
          onClick={() => handleFormat('bold')}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
          disabled={disabled}
        >
          <Bold size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => handleFormat('italic')}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
          disabled={disabled}
        >
          <Italic size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => handleFormat('list')}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
          disabled={disabled}
        >
          <List size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => handleFormat('quote')}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
          disabled={disabled}
        >
          <Quote size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => handleFormat('link')}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
          disabled={disabled}
        >
          <Link size={16} />
        </button>
        
        <button
          type="button"
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
          disabled={disabled}
        >
          <Image size={16} />
        </button>
      </div>
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`w-full resize-none outline-none p-4 text-gray-900 placeholder-gray-500 ${
          compact ? 'min-h-[100px] text-sm' : 'min-h-[150px]'
        }`}
      />
      
      <div className="border-t border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">
        Supports Markdown formatting
      </div>
    </div>
  );
};

export default RichTextEditor;