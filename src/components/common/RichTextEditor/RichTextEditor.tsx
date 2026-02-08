import React from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Type,
  Palette,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Smile,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const EMOJI_PICKER = ['😀', '😂', '😍', '🎉', '✨', '🔥', '👍', '💪', '🙏', '❤️', '👏', '🎯'];
const TEXT_COLORS = ['#000000', '#FF0000', '#0000FF', '#00AA00', '#FF9900', '#9900FF', '#FF00FF', '#00CCCC'];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your content here...',
  minHeight = 'min-h-[200px]',
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = React.useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState('#000000');
  const selectionRef = React.useRef<Range | null>(null);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selectionRef.current = selection.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (selection && selectionRef.current) {
      selection.removeAllRanges();
      selection.addRange(selectionRef.current);
    }
  };

  const applyFormat = (command: string, value?: string) => {
    restoreSelection();
    
    // Special handling for formatBlock commands
    if (command === 'formatBlock') {
      // Try multiple formats for better browser compatibility
      try {
        document.execCommand(command, false, value);
      } catch (e) {
        // Fallback: try without angle brackets
        const tagName = value?.replace(/[<>]/g, '') || 'p';
        try {
          document.execCommand(command, false, tagName);
        } catch (e2) {
          console.error('formatBlock failed:', e2);
        }
      }
    } else {
      document.execCommand(command, false, value);
    }
    
    editorRef.current?.focus();
  };

  const insertEmoji = (emoji: string) => {
    restoreSelection();
    document.execCommand('insertText', false, emoji);
    editorRef.current?.focus();
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    applyFormat('foreColor', color);
    setIsColorPickerOpen(false);
  };

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      applyFormat('createLink', url);
    }
  };

  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      editorRef.current.focus();
      onChange('');
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const ToolbarButton = ({
    icon: Icon,
    onClick,
    title,
    active = false,
  }: {
    icon: React.ReactNode;
    onClick: () => void;
    title: string;
    active?: boolean;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        editorRef.current?.focus();
        saveSelection();
      }}
      onClick={onClick}
      title={title}
      className={cn(
        'p-2 rounded-lg transition-all hover:bg-slate-200',
        active ? 'bg-teal-100 text-teal-600' : 'text-slate-600'
      )}
    >
      {Icon}
    </button>
  );

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-3 bg-slate-100 rounded-t-2xl border border-slate-300 border-b-0 overflow-visible relative">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-slate-300 pr-2">
          <ToolbarButton
            icon={<Bold size={18} />}
            onClick={() => applyFormat('bold')}
            title="Bold (Ctrl+B)"
          />
          <ToolbarButton
            icon={<Italic size={18} />}
            onClick={() => applyFormat('italic')}
            title="Italic (Ctrl+I)"
          />
          <ToolbarButton
            icon={<Underline size={18} />}
            onClick={() => applyFormat('underline')}
            title="Underline (Ctrl+U)"
          />
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-slate-300 pr-2">
          <ToolbarButton
            icon={<Heading1 size={18} />}
            onClick={() => applyFormat('formatBlock', '<h1>')}
            title="Heading 1"
          />
          <ToolbarButton
            icon={<Heading2 size={18} />}
            onClick={() => applyFormat('formatBlock', '<h2>')}
            title="Heading 2"
          />
          <ToolbarButton
            icon={<Type size={18} />}
            onClick={() => applyFormat('formatBlock', '<p>')}
            title="Normal text"
          />
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-slate-300 pr-2">
          <ToolbarButton
            icon={<List size={18} />}
            onClick={() => applyFormat('insertUnorderedList')}
            title="Bullet list"
          />
          <ToolbarButton
            icon={<ListOrdered size={18} />}
            onClick={() => applyFormat('insertOrderedList')}
            title="Numbered list"
          />
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-slate-300 pr-2">
          <ToolbarButton
            icon={<AlignLeft size={18} />}
            onClick={() => applyFormat('justifyLeft')}
            title="Align left"
          />
          <ToolbarButton
            icon={<AlignCenter size={18} />}
            onClick={() => applyFormat('justifyCenter')}
            title="Align center"
          />
          <ToolbarButton
            icon={<AlignRight size={18} />}
            onClick={() => applyFormat('justifyRight')}
            title="Align right"
          />
        </div>

        {/* Color & Effects */}
        <div className="flex gap-1 border-r border-slate-300 pr-2 relative">
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editorRef.current?.focus();
                saveSelection();
              }}
              onClick={() => {
                setIsColorPickerOpen(!isColorPickerOpen);
                setIsEmojiPickerOpen(false);
              }}
              title="Text color"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-200 transition-all flex items-center gap-1"
            >
              <Palette size={18} />
            </button>
            {isColorPickerOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white border-2 border-slate-300 rounded-xl p-3 shadow-2xl z-50 grid grid-cols-4 gap-2 w-40">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editorRef.current?.focus();
                      saveSelection();
                    }}
                    onClick={() => handleColorChange(color)}
                    className={cn(
                      'w-6 h-6 rounded-lg border-2 transition-all',
                      selectedColor === color ? 'border-slate-800' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>

          <ToolbarButton
            icon={<LinkIcon size={18} />}
            onClick={handleLink}
            title="Add link"
          />
        </div>

        {/* Emoji & Clear */}
        <div className="flex gap-1 border-r border-slate-300 pr-2 relative">
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editorRef.current?.focus();
                saveSelection();
              }}
              onClick={() => {
                setIsEmojiPickerOpen(!isEmojiPickerOpen);
                setIsColorPickerOpen(false);
              }}
              title="Insert emoji"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-200 transition-all"
            >
              <Smile size={18} />
            </button>
            {isEmojiPickerOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white border-2 border-slate-300 rounded-xl p-3 shadow-2xl z-50 grid grid-cols-6 gap-2 w-52">
                {EMOJI_PICKER.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editorRef.current?.focus();
                      saveSelection();
                    }}
                    onClick={() => {
                      insertEmoji(emoji);
                      setIsEmojiPickerOpen(false);
                    }}
                    className="text-xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ToolbarButton
            icon={<Trash2 size={18} />}
            onClick={handleClear}
            title="Clear all"
          />
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        onInput={handleInput}
        contentEditable
        suppressContentEditableWarning
        className={cn(
          'w-full px-4 py-3 rounded-b-2xl border-2 border-t-0 border-slate-200 bg-white focus:border-teal-500 focus:outline-none transition-all',
          minHeight,
          'prose prose-sm max-w-none',
          'text-slate-800 font-normal empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400'
        )}
        style={{
          WebkitBoxReflect: 'none',
        }}
        data-placeholder={placeholder}
        suppressHydrationWarning
      />

      {/* Character count */}
      <div className="text-xs text-slate-400 font-semibold px-1">
        {value.replace(/<[^>]*>/g, '').length} characters
      </div>
    </div>
  );
};
