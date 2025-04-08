// src/components/RichTextEditor.jsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

const RichTextEditor = ({ content, onContentChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'my-paragraph',
          },
        },
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose focus:outline-none min-h-full p-4',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onContentChange(html);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <EditorContent 
      editor={editor} 
      style={{ 
        height: '100%',
        minHeight: '500px'
      }} 
    />
  );
};

export default RichTextEditor;