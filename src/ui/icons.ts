/** Hand-written 24x24 SVG icons (no external assets). Each value is the inner markup of an <svg>. */
const P: Record<string, string> = {
  sickle: '<path d="M5 20l5-5" stroke-width="2.6" stroke-linecap="round" fill="none" stroke="currentColor"/><path d="M9.5 15.5C5 10 8 3 16 3c3 0 5 1.5 5.5 3-2-1-4.5-1-6.5 0-3.5 1.800-4.500 6-2.500 9.500z"/>',
  flame: '<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-4 2.500-7 1.500 1 2 2.500 2 4 1.500-2 2-5 1.500-9z"/><path d="M12 13c1 1.500 2.500 2.500 2.500 4.500a2.500 2.500 0 0 1-5 0c0-1.500 1.500-2.500 2.500-4.500z" fill="#fff" opacity=".45"/>',
  bolt: '<path d="M14 1L4 14h6l-2 9 11-14h-6.500z"/>',
  axe: '<path d="M6 22L15 5" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" fill="none"/><path d="M12 3c4-2 8 0 10 4-3 0-5 2-6 5l-5-3c1-2 1-4 1-6z"/>',
  wreath: '<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2.200"/><g><circle cx="12" cy="4.500" r="2.200"/><circle cx="19" cy="9" r="2"/><circle cx="18" cy="17" r="2.200"/><circle cx="12" cy="19.500" r="2"/><circle cx="6" cy="17" r="2.200"/><circle cx="5" cy="9" r="2"/></g>',
  stone: '<path d="M4 14l3-8 7-3 6 5 1 8-6 5-8-1z"/><path d="M7 6l5 5 8-3M12 11l-1 9" stroke="#000" stroke-opacity=".25" fill="none"/>',
  raven: '<path d="M2 9l5-1c2-4 7-5 10-2l5 1-4 2c0 5-4 9-10 9l-4 3 1-5c-2-2-3-4-3-7z"/><circle cx="15" cy="8.500" r="1" fill="#000" opacity=".5"/>',
  frost: '<g stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"><path d="M12 2v20M3.300 7l17.400 10M20.700 7L3.300 17"/><path d="M12 5.500l-2.500-2M12 5.500l2.500-2M12 18.500l-2.500 2M12 18.500l2.500 2"/></g>',
  spear: '<path d="M3 21L16 8" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" fill="none"/><path d="M14 6l8-4-4 8z"/>',
  bow: '<path d="M6 3c8 2 12 8 12 18" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round"/><path d="M6 3l12 18" fill="none" stroke="currentColor" stroke-width="1" opacity=".6"/><path d="M3 15L15 8" stroke="currentColor" stroke-width="1.800" stroke-linecap="round" fill="none"/><path d="M13.500 6l5 0.500-3 4z"/>',
  pot: '<path d="M8 3h8v3c3 2 4 5 4 8 0 4-3 7-8 7s-8-3-8-7c0-3 1-6 4-8z"/><path d="M8 6h8" stroke="#000" stroke-opacity=".3"/>',
  belt: '<rect x="1" y="8" width="22" height="8" rx="2"/><rect x="9" y="6" width="6" height="12" rx="1.500" fill="#fff" opacity=".5"/><rect x="11" y="8.500" width="2" height="7" fill="#000" opacity=".35"/>',
  flint: '<path d="M3 20l6-9 6 2 5 7z"/><path d="M14 2l1.500 4L20 5l-3 3.500L19 13l-4-2-3 3 .500-4.500L9 7l4-.500z" fill="#fff" opacity=".7"/>',
  amulet: '<path d="M5 2c1 5 4 7 7 8 3-1 6-3 7-8" fill="none" stroke="currentColor" stroke-width="1.800"/><circle cx="12" cy="15.500" r="6"/><path d="M12 11v9M8 15.500h8" stroke="#000" stroke-opacity=".3"/>',
  boot: '<path d="M7 2h7v11l7 3v5H4v-6z"/><path d="M4 18h17" stroke="#000" stroke-opacity=".3"/>',
  heart: '<path d="M12 21C4 15 2 11 2 7.500 2 4.500 4.500 3 7 3c2 0 4 1 5 3 1-2 3-3 5-3 2.500 0 5 1.500 5 4.500 0 3.500-2 7.500-10 13.500z"/>',
  honey: '<path d="M6 8h12l1 12H5z"/><rect x="5" y="4" width="14" height="4" rx="1.500"/><path d="M9 8v5a1.500 1.500 0 0 0 3 0V8" fill="#fff" opacity=".5"/>',
  magnet: '<path d="M4 3h5v10a3 3 0 0 0 6 0V3h5v10a8 8 0 0 1-16 0z"/><path d="M4 7h5M15 7h5" stroke="#fff" stroke-width="2" opacity=".7"/>',
  horseshoe: '<path d="M5 21V10a7 7 0 0 1 14 0v11h-4V10a3 3 0 0 0-6 0v11z"/><g fill="#000" opacity=".35"><circle cx="7" cy="12" r="1"/><circle cx="17" cy="12" r="1"/><circle cx="7" cy="17" r="1"/><circle cx="17" cy="17" r="1"/></g>',
  shield: '<path d="M12 2l9 3v7c0 5-4 8.500-9 10-5-1.500-9-5-9-10V5z"/><path d="M12 5v14M5 10h14" stroke="#000" stroke-opacity=".25"/>',
  pouch: '<path d="M8 3h8l-2 4c4 2 6 5 6 9 0 3-2 5-8 5s-8-2-8-5c0-4 2-7 6-9z"/><path d="M8 7h8" stroke="#000" stroke-opacity=".4" stroke-width="1.500"/>',
  feather: '<path d="M20 3c-9 0-14 5-15 13l-2 5 5-2c8-1 12-7 12-16z"/><path d="M4 20L16 7" stroke="#000" stroke-opacity=".3"/>',
  book: '<path d="M3 4c3-1 6-1 9 1 3-2 6-2 9-1v15c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 5v15" stroke="#000" stroke-opacity=".35"/>',
  coin: '<circle cx="12" cy="12" r="9.500"/><circle cx="12" cy="12" r="6" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="1.500"/><path d="M12 8v8M9.500 10h5M9.500 14h5" stroke="#000" stroke-opacity=".35" stroke-width="1.500"/>',
  bread: '<path d="M2 14c0-5 4-8 10-8s10 3 10 8v2c0 1.500-1 2-2 2H4c-1 0-2-.500-2-2z"/><path d="M8 8l2 4M13 7.500l2 4" stroke="#000" stroke-opacity=".3" stroke-width="1.500"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="3.500"/><g fill="#000" opacity=".45"><circle cx="8" cy="8" r="1.600"/><circle cx="16" cy="8" r="1.600"/><circle cx="12" cy="12" r="1.600"/><circle cx="8" cy="16" r="1.600"/><circle cx="16" cy="16" r="1.600"/></g>',
  water: '<path d="M12 2c4 6 7 9 7 13a7 7 0 0 1-14 0c0-4 3-7 7-13z"/><path d="M9 15a3 3 0 0 0 3 3" stroke="#fff" stroke-opacity=".6" fill="none" stroke-width="1.500"/>',
  skull: '<path d="M12 2c5 0 9 3.500 9 8.500 0 3-1.500 5-3.500 6.500V21h-11v-4C4.500 15.500 3 13.500 3 10.500 3 5.500 7 2 12 2z"/><g fill="#000" opacity=".55"><circle cx="8.500" cy="11" r="2.200"/><circle cx="15.500" cy="11" r="2.200"/><path d="M12 14l-1.300 3h2.600z"/></g>',
  chest: '<path d="M3 10c0-3.500 2-6 5-6h8c3 0 5 2.500 5 6v10H3z"/><path d="M3 11h18" stroke="#000" stroke-opacity=".4" stroke-width="1.500"/><rect x="10.500" y="9" width="3" height="5" rx="1" fill="#fff" opacity=".6"/>',
  lock: '<rect x="4" y="10" width="16" height="12" rx="2.500"/><path d="M7.500 10V7a4.500 4.500 0 0 1 9 0v3" fill="none" stroke="currentColor" stroke-width="2.400"/>',
  star: '<path d="M12 2l3 6.500 7 .800-5.200 4.800 1.500 7L12 17.500 5.700 21l1.500-7L2 9.300l7-.800z"/>',
  home: '<path d="M2 12L12 3l10 9h-3v9h-5v-6h-4v6H5v-9z"/>',
  gear: '<path d="M10 2h4l.600 3 2.600 1.500 2.900-1 2 3.500-2.300 2v3l2.300 2-2 3.500-2.900-1-2.600 1.500-.600 3h-4l-.600-3-2.600-1.500-2.900 1-2-3.500 2.300-2v-3L1.900 9l2-3.500 2.900 1L9.400 5z"/><circle cx="12" cy="12" r="3.200" fill="#000" opacity=".4"/>',
  eye: '<path d="M1 12c3-5 7-7.500 11-7.500S20 7 23 12c-3 5-7 7.500-11 7.500S4 17 1 12z"/><circle cx="12" cy="12" r="4.200" fill="#000" opacity=".45"/><circle cx="13.300" cy="10.700" r="1.300" fill="#fff" opacity=".8"/>',
  fang: '<path d="M4 3h16c0 6-2 10-4 13l-1 5-3-6-3 6-1-5C6 13 4 9 4 3z"/><path d="M12 4v9" stroke="#000" stroke-opacity=".3" stroke-width="1.500"/>',
  thorn: '<path d="M11 22V9" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" fill="none"/><path d="M11 17l-6-3 6 0zM11 12l6-3-6 0zM11 8l-4-5 4 2zM11 8l5-4-2 4z"/><circle cx="17" cy="15" r="2.200"/>',
  cloud: '<path d="M6 19a4.500 4.500 0 0 1-.500-9 6.500 6.500 0 0 1 12.500-1.500A5 5 0 0 1 18 19z"/><path d="M4 14h9M7 16.500h11" stroke="#fff" stroke-opacity=".5" stroke-width="1.300"/>',
  palisade: '<path d="M3 22V7l2-3 2 3v15zM9.500 22V5l2-3 2 3v17zM16 22V7l2-3 2 3v15z"/><path d="M2 12h20M2 17h20" stroke="#000" stroke-opacity=".35" stroke-width="1.600"/>',
  hourglass: '<path d="M5 2h14v2c0 4-4 6-5 8 1 2 5 4 5 8v2H5v-2c0-4 4-6 5-8-1-2-5-4-5-8z"/><path d="M8 19c1-2 3-3 4-4 1 1 3 2 4 4z" fill="#fff" opacity=".55"/>',
  wind: '<g fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round"><path d="M2 8h12a3 3 0 1 0-3-3"/><path d="M2 13h17a3 3 0 1 1-3 3"/><path d="M4 18h7"/></g>',
  tusk: '<path d="M3 21c0-9 5-16 14-18-4 4-6 8-6 12 2-2 5-3 9-3-3 5-9 8-17 9z"/><path d="M6 18c2-4 5-8 9-11" stroke="#000" stroke-opacity=".25" fill="none"/>',
  horn: '<path d="M3 20c2-1 4-1 6-3 4-4 6-9 7-14 1 0 2 1 2 2-1 6-3 11-7 15-2 2-5 3-8 3z"/><path d="M14 7l2 1M12 11l2 1M10 14l2 1" stroke="#000" stroke-opacity=".3" stroke-width="1.300"/>',
  helmet: '<path d="M3 16c0-6 4-11 9-11s9 5 9 11z"/><path d="M12 2v3M2 16h20v3H2z"/><path d="M11 9h2v7h-2z" fill="#000" opacity=".3"/>',
  honeycomb: '<path d="M7 3l4 2.300v4.600L7 12.200 3 9.900V5.300zM17 3l4 2.300v4.600l-4 2.300-4-2.300V5.300zM12 11.800l4 2.300v4.600l-4 2.300-4-2.300v-4.600z"/>',
  beads: '<g><circle cx="12" cy="4" r="2.300"/><circle cx="18" cy="7" r="2.300"/><circle cx="19.500" cy="13" r="2.300"/><circle cx="16" cy="18" r="2.300"/><circle cx="8" cy="18" r="2.300"/><circle cx="4.500" cy="13" r="2.300"/><circle cx="6" cy="7" r="2.300"/></g><path d="M12 20.500v2.500" stroke="currentColor" stroke-width="2"/>',
  claw: '<path d="M4 21c1-6 2-12 6-17 0 5-1 10-3 17zM10 21c1-6 3-11 7-15-1 5-2 10-4 15zM15 21c2-5 4-8 7-10-1 4-2 7-4 10z"/>',
  pelt: '<path d="M6 2l2 3h8l2-3 1 5c2 1 3 3 2 5l-2 1 1 9-4-2-4 3-4-3-4 2 1-9-2-1c-1-2 0-4 2-5z"/><circle cx="9.500" cy="9" r="1" fill="#000" opacity=".4"/><circle cx="14.500" cy="9" r="1" fill="#000" opacity=".4"/>',
  cup: '<path d="M4 3h16c0 6-3 10-6 11v4h3v3H7v-3h3v-4C7 13 4 9 4 3z"/><path d="M7 6h10" stroke="#fff" stroke-opacity=".45" stroke-width="1.500"/>',
  moss: '<path d="M2 20c1-4 3-6 6-6 1-3 3-5 6-4 2-2 6-1 7 2 1 2 1 5 1 8z"/><g fill="#000" opacity=".25"><circle cx="8" cy="18" r="1"/><circle cx="13" cy="15" r="1"/><circle cx="17" cy="17" r="1"/></g>',
  mirror: '<ellipse cx="12" cy="9" rx="6.500" ry="7.500"/><ellipse cx="12" cy="9" rx="4.300" ry="5.300" fill="#fff" opacity=".45"/><path d="M11 16.500h2V22h-2z"/>',
  anvil: '<path d="M2 6h15c2 0 4 1 5 3h-6l-1 3c0 1 1 2 3 2v3H6v-3c2 0 3-1 3-2L8 9H4C3 9 2 8 2 6z"/><path d="M5 18h14v3H5z"/>',
  wand: '<path d="M3 21L15 9" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" fill="none"/><path d="M17 2l1.200 3 3 1.200-3 1.200L17 10.400l-1.200-3-3-1.200 3-1.200z"/><circle cx="20.500" cy="13" r="1"/><circle cx="11" cy="3.500" r="1"/>',
  sword: '<path d="M20 2l2 0 0 2-11 11-2-2z"/><path d="M6 12l6 6-2 2-2-2-4 4-2-2 4-4-2-2z"/>',
};

export function icon(name: string, color?: string, size = 24): string {
  const body = (P[name] ?? P.star) as string;
  const style = color ? ` style="color:${color}"` : '';
  return `<svg class="icon" viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor"${style} aria-hidden="true">${body}</svg>`;
}

export function hex(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}
