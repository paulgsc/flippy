import type { LimitType } from './Limit'
import { Limit } from './Limit'
import { arrayLast } from './utils'

export type ScrollLimitType = {
  limit: LimitType
}

export function ScrollLimit(
  contentSize: number,
  scrollSnaps: number[],
  loop: boolean
): ScrollLimitType {
  const max = scrollSnaps[0] ?? contentSize
  const min = loop ? max - contentSize : arrayLast(scrollSnaps)
  const limit = Limit(min, max)

  const self: ScrollLimitType = {
    limit
  }
  return self
}
