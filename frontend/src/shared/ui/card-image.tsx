import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import { cn } from '#/shared/lib/cn'
import { API_URL } from '#/shared/lib/env'

interface CardImageProps {
  /** Path returned by the API (e.g. /catalog/items/{id}/image). */
  src: string
  alt: string
  className?: string
  priority?: boolean
}

/** Trading card picture in its real 63:88 ratio, with a skeleton while loading and a fallback. */
function CardImage({ src, alt, className, priority = false }: CardImageProps) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div
      className={cn(
        'relative aspect-[63/88] overflow-hidden rounded-xl bg-muted',
        state === 'loading' && 'animate-pulse',
        className,
      )}
    >
      {state === 'error' ? (
        <div className="flex size-full items-center justify-center text-subtle-foreground">
          <ImageOff className="size-8" aria-hidden />
        </div>
      ) : (
        <img
          src={src.startsWith('http') ? src : `${API_URL}${src}`}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={cn(
            'size-full origin-center object-cover',
            '[transition-property:opacity,transform] [transition-duration:500ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)]',
            'motion-safe:group-hover:scale-[1.04]',
            state === 'loaded' ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  )
}

export { CardImage }
