import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react'
import { cn } from '~/lib/utils'

interface TiptapEditorProps {
  valueText: string
  onChange: (data: { json: string; text: string }) => void
  placeholder?: string
  maxLength?: number
  className?: string
}

export function TiptapEditor({
  onChange,
  placeholder = 'Jelaskan kondisi kerusakan fasilitas kampus secara rinci...',
  maxLength = 2000,
  className,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'min-h-[120px] p-3 text-sm focus:outline-none focus:ring-0 text-[#09090B] leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-1',
        placeholder,
      },
    },
    onUpdate: ({ editor: ed }) => {
      const json = JSON.stringify(ed.getJSON())
      const text = ed.getText()
      onChange({ json, text })
    },
  })

  if (!editor) {
    return (
      <div className="border-2 border-[#09090B] bg-white p-4 h-36 animate-pulse" />
    )
  }

  const charCount = editor.getText().length

  return (
    <div
      className={cn(
        'border-2 border-[#09090B] bg-white shadow-[3px_3px_0_0_#09090B] flex flex-col',
        className,
      )}
    >
      <div className="border-b-2 border-[#09090B] bg-[#FAF8F5] px-2 py-1.5 flex items-center justify-between gap-1 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              'w-8 h-8 border-2 border-[#09090B] flex items-center justify-center text-xs font-bold transition-all cursor-pointer',
              editor.isActive('bold')
                ? 'bg-[#D9F99D] shadow-[1px_1px_0_0_#09090B]'
                : 'bg-white hover:bg-neutral-100',
            )}
            title="Tebal (Ctrl+B)"
          >
            <Bold className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              'w-8 h-8 border-2 border-[#09090B] flex items-center justify-center text-xs font-bold transition-all cursor-pointer',
              editor.isActive('italic')
                ? 'bg-[#D9F99D] shadow-[1px_1px_0_0_#09090B]'
                : 'bg-white hover:bg-neutral-100',
            )}
            title="Miring (Ctrl+I)"
          >
            <Italic className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
          </button>

          <div className="w-[2px] h-5 bg-[#09090B] mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              'w-8 h-8 border-2 border-[#09090B] flex items-center justify-center text-xs font-bold transition-all cursor-pointer',
              editor.isActive('bulletList')
                ? 'bg-[#D9F99D] shadow-[1px_1px_0_0_#09090B]'
                : 'bg-white hover:bg-neutral-100',
            )}
            title="Daftar Poin"
          >
            <List className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              'w-8 h-8 border-2 border-[#09090B] flex items-center justify-center text-xs font-bold transition-all cursor-pointer',
              editor.isActive('orderedList')
                ? 'bg-[#D9F99D] shadow-[1px_1px_0_0_#09090B]'
                : 'bg-white hover:bg-neutral-100',
            )}
            title="Daftar Angka"
          >
            <ListOrdered className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="w-7 h-7 border border-[#09090B] flex items-center justify-center bg-white hover:bg-neutral-100 disabled:opacity-40 cursor-pointer"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="w-7 h-7 border border-[#09090B] flex items-center justify-center bg-white hover:bg-neutral-100 disabled:opacity-40 cursor-pointer"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />

      <div className="border-t-2 border-[#09090B] bg-[#FAF8F5] px-3 py-1 flex items-center justify-between text-[11px] font-mono font-bold text-[#52525B]">
        <span>Format Tiptap Rich-Text</span>
        <span
          className={cn(
            charCount > maxLength
              ? 'text-red-600 bg-[#FECDD3] px-1.5 py-0.5 border border-[#09090B]'
              : 'text-[#09090B]',
          )}
        >
          {charCount} / {maxLength} Karakter
        </span>
      </div>
    </div>
  )
}
