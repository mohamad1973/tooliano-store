"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export function RichTextEditor({
  content,
  onChange,
  placeholder,
}: {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[120px] rounded-b-lg border border-t-0 border-brand-gray bg-white px-3 py-2 text-brand-navy focus:outline-none",
        dir: "rtl",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-brand-gray">
      <div className="flex flex-wrap gap-1 border-b border-brand-gray bg-brand-gray/30 p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="rounded px-2 py-0.5 text-xs font-bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="rounded px-2 py-0.5 text-xs italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className="rounded px-2 py-0.5 text-xs"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="rounded px-2 py-0.5 text-xs"
        >
          قائمة
        </button>
      </div>
      {placeholder && !content ? (
        <p className="px-3 pt-2 text-xs text-brand-navy/40">{placeholder}</p>
      ) : null}
      <EditorContent editor={editor} />
    </div>
  );
}
