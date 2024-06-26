import type { CreateOptionsType, LooseOptionsType } from './Options'
import type { WindowType } from './utils'
import { objectKeys, objectsMergeDeep } from './utils'

type OptionsType = Partial<CreateOptionsType<LooseOptionsType>>

export type OptionsHandlerType = {
  mergeOptions: <TypeA extends OptionsType, TypeB extends OptionsType>(
    optionsA: TypeA,
    optionsB?: TypeB
  ) => TypeA
  optionsAtMedia: <Type extends OptionsType>(options: Type) => Type
  optionsMediaQueries: (optionsList: OptionsType[]) => MediaQueryList[]
}

export function OptionsHandler(ownerWindow: WindowType): OptionsHandlerType {
  function mergeOptions<TypeA extends OptionsType, TypeB extends OptionsType>(
    optionsA: TypeA,
    optionsB?: TypeB
  ): TypeA {
    return objectsMergeDeep(optionsA, optionsB ?? {}) as TypeA
  }

  function optionsAtMedia<Type extends OptionsType>(options: Type): Type {
    const optionsAtMedia = options.breakpoints ?? {}
    const matchedMediaOptions = objectKeys(optionsAtMedia)
      .filter((media) => ownerWindow.matchMedia(media).matches)
      .map((media) => optionsAtMedia[media])
      .reduce(
        (a, mediaOption) => mergeOptions(a as Partial<Type>, mediaOption),
        {}
      )

    return mergeOptions(options, matchedMediaOptions)
  }

  function optionsMediaQueries(optionsList: OptionsType[]): MediaQueryList[] {
    return optionsList
      .map((options) => objectKeys(options.breakpoints ?? {}))
      .reduce((acc, mediaQueries) => acc.concat(mediaQueries), [])
      .map(ownerWindow.matchMedia)
  }

  const self: OptionsHandlerType = {
    mergeOptions,
    optionsAtMedia,
    optionsMediaQueries
  }
  return self
}
