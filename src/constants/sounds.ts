import bird01Pigeon from '../../assets/sound/bird_01_pigeon.m4a'
import bird02Sparrow from '../../assets/sound/bird_02_sparrow.m4a'
import bird03Sea from '../../assets/sound/bird_03_sea.m4a'
import bird04River from '../../assets/sound/bird_04_river.m4a'
import bird05JapaneseNightingale from '../../assets/sound/bird_05_Japanese_nightingale.m4a'
import insect01 from '../../assets/sound/insect_01.m4a'
import insect02 from '../../assets/sound/insect_02.m4a'
import insect03 from '../../assets/sound/insect_03.m4a'
import insect04 from '../../assets/sound/insect_04.m4a'
import insect05 from '../../assets/sound/insect_05.m4a'

type SoundGroupKey = 'bird' | 'insect'

interface SoundGroup<K extends SoundGroupKey> {
  key: K
  title: string
  sounds: ReadonlyArray<{
    id: `${K}_${string}`
    fileName: string
    asset: number
  }>
}

const birdGroup = {
  key: 'bird',
  title: 'Bird',
  sounds: [
    {
      id: 'bird_01_pigeon',
      fileName: 'bird_01_pigeon.m4a',
      asset: bird01Pigeon,
    },
    {
      id: 'bird_02_sparrow',
      fileName: 'bird_02_sparrow.m4a',
      asset: bird02Sparrow,
    },
    {
      id: 'bird_03_sea',
      fileName: 'bird_03_sea.m4a',
      asset: bird03Sea,
    },
    {
      id: 'bird_04_river',
      fileName: 'bird_04_river.m4a',
      asset: bird04River,
    },
    {
      id: 'bird_05_Japanese_nightingale',
      fileName: 'bird_05_Japanese_nightingale.m4a',
      asset: bird05JapaneseNightingale,
    },
  ],
} as const satisfies SoundGroup<'bird'>

const insectGroup = {
  key: 'insect',
  title: 'Insect',
  sounds: [
    {
      id: 'insect_01',
      fileName: 'insect_01.m4a',
      asset: insect01,
    },
    {
      id: 'insect_02',
      fileName: 'insect_02.m4a',
      asset: insect02,
    },
    {
      id: 'insect_03',
      fileName: 'insect_03.m4a',
      asset: insect03,
    },
    {
      id: 'insect_04',
      fileName: 'insect_04.m4a',
      asset: insect04,
    },
    {
      id: 'insect_05',
      fileName: 'insect_05.m4a',
      asset: insect05,
    },
  ],
} as const satisfies SoundGroup<'insect'>

export const BUILT_IN_SOUND_GROUPS = [birdGroup, insectGroup] as const

export type BuiltInSoundGroup = (typeof BUILT_IN_SOUND_GROUPS)[number]
export type BuiltInSound = BuiltInSoundGroup['sounds'][number]
export type BuiltInSoundId = BuiltInSound['id']

const allSounds: BuiltInSound[] = []
for (const group of BUILT_IN_SOUND_GROUPS) {
  allSounds.push(...group.sounds)
}

export const BUILT_IN_SOUNDS = allSounds

export const DEFAULT_SOUND_ID: BuiltInSoundId = BUILT_IN_SOUNDS[0].id

export const SOUND_FILE_MAP: Record<BuiltInSoundId, string> =
  BUILT_IN_SOUNDS.reduce(
    (acc, sound) => {
      acc[sound.id] = sound.fileName
      return acc
    },
    {} as Record<BuiltInSoundId, string>,
  )

export const SOUND_ASSET_MAP: Record<BuiltInSoundId, number> =
  BUILT_IN_SOUNDS.reduce(
    (acc, sound) => {
      acc[sound.id] = sound.asset
      return acc
    },
    {} as Record<BuiltInSoundId, number>,
  )

export function getSoundDisplayName(soundId: BuiltInSoundId) {
  const [category, ...rest] = soundId.split('_')
  if (category === 'insect') {
    const index = rest[0]
    const numeric = Number.parseInt(index ?? '', 10)
    if (Number.isFinite(numeric)) {
      return `Insect ${numeric}`
    }
    return titleCase(`insect ${rest.join(' ')}`.trim())
  }

  if (category === 'bird') {
    const nameParts = rest.slice(1)
    if (nameParts.length === 0 && rest.length > 0) {
      nameParts.push(rest[rest.length - 1])
    }
    const name = nameParts.join(' ') || rest.join(' ')
    switch (rest[0]) {
      case '03':
        return 'Bird with Sea'
      case '04':
        return 'Bird with River'
      default:
        return titleCase(name)
    }
  }

  return titleCase(rest.join(' ') || soundId.replace(/_/g, ' '))
}

function titleCase(value: string) {
  const lower = value.toLowerCase()
  return lower.replace(/\b\w/g, (char) => char.toUpperCase())
}
