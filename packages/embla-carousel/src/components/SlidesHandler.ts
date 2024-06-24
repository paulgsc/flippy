import type { EmblaCarouselType } from './EmblaCarousel'
import type { EventHandlerType } from './EventHandler'
import { isBoolean } from './utils'

type SlidesHandlerCallbackType = (
  emblaApi: EmblaCarouselType,
  mutations: MutationRecord[]
) => boolean | undefined

export type SlidesHandlerOptionType = boolean | SlidesHandlerCallbackType

export type SlidesHandlerType = {
  init: (emblaApi: EmblaCarouselType) => void
  destroy: () => void
}

export function SlidesHandler(
  container: HTMLElement,
  eventHandler: EventHandlerType,
  watchSlides: SlidesHandlerOptionType
): SlidesHandlerType {
  let mutationObserver: MutationObserver
  let destroyed = false

  function init(emblaApi: EmblaCarouselType): void {
    if (!watchSlides) return

    function defaultCallback(mutations: MutationRecord[]): void {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          emblaApi.reInit()
          eventHandler.emit('slidesChanged')
          break
        }
      }
    }

    mutationObserver = new MutationObserver((mutations) => {
      if (destroyed) return
      if (isBoolean(watchSlides) || watchSlides(emblaApi, mutations)) {
        defaultCallback(mutations)
      }
    })

    mutationObserver.observe(container, { childList: true })
  }

  function destroy(): void {
    try {
      mutationObserver.disconnect()
    } catch {
      // pass
    } finally {
      destroyed = true
    }
  }

  const self: SlidesHandlerType = {
    init,
    destroy
  }
  return self
}
