import * as React from 'react'
import { cn } from '~/lib/utils'

interface TipTapMark {
  type: string
  attrs?: Record<string, unknown>
}

interface TipTapNode {
  type: string
  text?: string
  marks?: TipTapMark[]
  content?: TipTapNode[]
  attrs?: Record<string, unknown>
}

interface RichTextViewProps {
  content?: unknown
  fallbackText?: string
  className?: string
}

function renderFormattedText(text: string, marks?: TipTapMark[], key?: string | number): React.ReactNode {
  if (!marks || marks.length === 0) {
    return text
  }

  let element: React.ReactNode = text
  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        element = <strong key={key} className="font-bold">{element}</strong>
        break
      case 'italic':
        element = <em key={key} className="italic">{element}</em>
        break
      case 'strike':
        element = <s key={key} className="line-through">{element}</s>
        break
      case 'code':
        element = (
          <code key={key} className="bg-neutral-100 border border-[#09090B] px-1 py-0.5 text-xs font-mono">
            {element}
          </code>
        )
        break
      default:
        break
    }
  }

  return element
}

function renderNode(node: TipTapNode, index: number): React.ReactNode {
  if (node.type === 'text' && node.text) {
    return renderFormattedText(node.text, node.marks, index)
  }

  const children = node.content ? node.content.map((child, i) => renderNode(child, i)) : null

  switch (node.type) {
    case 'doc':
      return <React.Fragment key={index}>{children}</React.Fragment>

    case 'paragraph':
      return (
        <p key={index} className="my-1.5 leading-relaxed text-[#09090B] first:mt-0 last:mb-0">
          {children || <br />}
        </p>
      )

    case 'bulletList':
      return (
        <ul key={index} className="list-disc pl-5 my-2 space-y-1 text-[#09090B]">
          {children}
        </ul>
      )

    case 'orderedList':
      return (
        <ol key={index} className="list-decimal pl-5 my-2 space-y-1 text-[#09090B]">
          {children}
        </ol>
      )

    case 'listItem':
      return (
        <li key={index} className="leading-relaxed">
          {children}
        </li>
      )

    case 'hardBreak':
      return <br key={index} />

    default:
      return children ? <React.Fragment key={index}>{children}</React.Fragment> : null
  }
}

export function RichTextView({ content, fallbackText, className }: RichTextViewProps) {
  let doc: TipTapNode | null = null

  if (content) {
    if (typeof content === 'string') {
      try {
        doc = JSON.parse(content) as TipTapNode
      } catch {
        doc = null
      }
    } else if (typeof content === 'object' && content !== null) {
      doc = content as TipTapNode
    }
  }

  if (!doc || doc.type !== 'doc' || !Array.isArray(doc.content) || doc.content.length === 0) {
    return (
      <div className={cn('whitespace-pre-wrap leading-relaxed text-[#09090B]', className)}>
        {fallbackText || 'Tidak ada deskripsi.'}
      </div>
    )
  }

  return (
    <div className={cn('tiptap-content text-xs md:text-sm text-[#09090B] leading-relaxed', className)}>
      {doc.content.map((node, index) => renderNode(node, index))}
    </div>
  )
}
