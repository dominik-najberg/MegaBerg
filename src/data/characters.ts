import type { CharacterDef } from './types';

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'wojmir',
    name: 'Wojmir',
    title: 'Młody woj',
    desc: 'Zbalansowany wojownik w lnianej koszuli z czerwonym haftem.',
    bonus: '+10% obrażeń, +5% szybkości ruchu',
    startWeapon: 'sierpy',
    mods: [
      { stat: 'damage', add: 0.1 },
      { stat: 'moveSpeed', add: 0.05 },
    ],
    look: { shirt: 0xe9e1cc, trim: 0xb3261e, pants: 0x5b3a2e, hair: 0xe2b34a, skin: 0xe0a985, build: 1, style: 'wojmir' },
  },
  {
    id: 'dobroslawa',
    name: 'Dobrosława',
    title: 'Zielarka',
    desc: 'Zna każde ziele w borze. Jej wianek odstrasza złe moce.',
    bonus: '+1 zdrowia / s, +25% zasięgu zbierania, -10 zdrowia',
    startWeapon: 'wianek',
    mods: [
      { stat: 'regen', add: 1 },
      { stat: 'pickup', add: 0.25 },
      { stat: 'maxHp', add: -10 },
    ],
    unlock: 'survive5',
    look: { shirt: 0xf1ead8, trim: 0xb3261e, pants: 0x3f6a3a, hair: 0x9a5a2a, skin: 0xe6b494, build: 0.95, style: 'dobroslawa' },
  },
  {
    id: 'bogumil',
    name: 'Bogumił',
    title: 'Kowal',
    desc: 'Twardy jak kowadło, powolny jak miech. Ciupagę wykuł sam.',
    bonus: '+60 zdrowia, +2 pancerza, +15% obrażeń, -6% szybkości ruchu',
    startWeapon: 'ciupaga',
    mods: [
      { stat: 'maxHp', add: 60 },
      { stat: 'armor', add: 2 },
      { stat: 'damage', add: 0.15 },
      { stat: 'moveSpeed', add: -0.06 },
    ],
    unlock: 'kills1000',
    look: { shirt: 0xcfc4a8, trim: 0x6a4a2a, pants: 0x3a3230, hair: 0x4a3020, skin: 0xd09a78, build: 1.14, style: 'bogumil' },
  },
  {
    id: 'jagna',
    name: 'Jagna',
    title: 'Uczennica wiedźmy',
    desc: 'Uciekła z chatki na kurzej stopce. Kruki słuchają jej szeptu.',
    bonus: '+20% szczęścia, -6% czasu odnowienia, -20 zdrowia',
    startWeapon: 'kruki',
    mods: [
      { stat: 'luck', add: 0.2 },
      { stat: 'cooldown', add: -0.06 },
      { stat: 'maxHp', add: -20 },
    ],
    unlock: 'jaga',
    look: { shirt: 0x4a3a66, trim: 0xb3261e, pants: 0x2e2440, hair: 0x35284f, skin: 0xe2b8a0, build: 0.95, style: 'jagna' },
  },
];

export const CHARACTER_BY_ID: Record<string, CharacterDef> = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));
