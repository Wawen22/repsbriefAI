import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/utils'

export const publicStudioClasses = {
  shell: 'min-h-screen bg-[#000000] text-white font-sans antialiased selection:bg-white/20 selection:text-white',
  surface: 'border border-white/[0.08] bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl rounded-lg',
  field: 'h-11 rounded-md bg-white/[0.04] border border-white/[0.12] px-3.5 text-sm text-white placeholder:text-white/35 focus-visible:border-white/40 focus-visible:ring-2 focus-visible:ring-white/10',
  primaryAction: 'rounded-md bg-white text-black hover:bg-white/90 font-medium shadow-[0_1px_2px_rgba(0,0,0,0.3)]',
  secondaryAction: 'rounded-md border border-white/[0.12] bg-white/[0.03] text-white/75 hover:bg-white/[0.07] hover:text-white',
  metadata: 'font-mono text-[10px] uppercase tracking-wider text-white/40',
  inlineLink: 'text-white/65 underline-offset-4 hover:text-white hover:underline transition-colors',
} as const

interface PublicStudioShellProps {
  children: ReactNode
  eyebrow?: string
  title?: string
  description?: string
  contentClassName?: string
  showBrandBar?: boolean
}

export function PublicStudioShell({
  children,
  eyebrow,
  title,
  description,
  contentClassName,
  showBrandBar = true,
}: PublicStudioShellProps) {
  return (
    <div className={publicStudioClasses.shell}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,#000_58%,transparent_100%)]" />
        <div className="absolute top-[-18rem] left-1/2 h-[36rem] w-[44rem] -translate-x-1/2 rounded-full bg-white/[0.025] blur-[150px]" />
      </div>

      <div className={cn('relative z-10 mx-auto flex min-h-screen w-full flex-col px-4 py-6 sm:px-6', contentClassName)}>
        {showBrandBar && (
          <header className="flex h-10 items-center justify-between border-b border-white/[0.08] pb-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="RepsBrief" width={26} height={26} className="rounded-md border border-white/[0.12]" />
              <span className="text-sm font-semibold tracking-tight text-white">RepsBrief</span>
            </Link>
            <span className={cn(publicStudioClasses.metadata, 'rounded border border-white/[0.08] bg-white/[0.02] px-1.5 py-0.5')}>
              Content Studio
            </span>
          </header>
        )}

        <main className="flex flex-1 flex-col justify-center py-12">
          {(eyebrow || title || description) && (
            <div className="mb-7 space-y-2">
              {eyebrow && <p className={publicStudioClasses.metadata}>{eyebrow}</p>}
              {title && <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>}
              {description && <p className="max-w-xl text-sm leading-relaxed text-white/50">{description}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}

