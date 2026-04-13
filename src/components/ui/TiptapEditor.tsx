'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import { useEffect, useState } from 'react';
import { Button } from './button';
import { 
  Bold, Italic, List, ListOrdered, Quote, Undo, Redo, 
  Image as ImageIcon, Play, Link as LinkIcon 
} from 'lucide-react';

interface TiptapEditorProps {
  content: any;
  onChange: (content: any) => void;
  placeholder?: string;
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = 'شروع به نوشتن مقاله کنید...',
}: TiptapEditorProps) {
  const [mounted, setMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Placeholder.configure({ placeholder }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
    ],
    content: content || { type: 'doc', content: [{ type: 'paragraph' }] },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-zinc dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-8 leading-relaxed',
      },
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const addImage = () => {
    const url = prompt('لینک مستقیم تصویر را وارد کنید (مثال: https://...)');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYoutube = () => {
    const url = prompt('لینک ویدیو یوتیوب را وارد کنید:');
    if (url && editor) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = prompt('لینک را وارد کنید:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!mounted || !editor) {
    return (
      <div className="min-h-[500px] border rounded-xl bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">در حال بارگذاری ویرایشگر...</p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
      {/* Toolbar */}
      <div className="border-b bg-muted/70 p-3 flex flex-wrap gap-2 items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-primary/10' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-primary/10' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="flex gap-1 ml-4 border-l pl-4">
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 ml-4 border-l pl-4">
          <Button variant="ghost" size="sm" onClick={addImage}>
            <ImageIcon className="h-4 w-4 mr-1" />
            تصویر
          </Button>
          <Button variant="ghost" size="sm" onClick={addYoutube}>
            <Play className="h-4 w-4 mr-1" />
            ویدیو
          </Button>
          <Button variant="ghost" size="sm" onClick={addLink}>
            <LinkIcon className="h-4 w-4 mr-1" />
            لینک
          </Button>
        </div>

        <div className="ml-auto flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="min-h-[500px] p-8" />
    </div>
  );
}