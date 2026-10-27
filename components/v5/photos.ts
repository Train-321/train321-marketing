// Photography for the /v5 homepage. Every entry is a real workplace photo,
// hot-linked from Pexels (the six hero industries) or Unsplash (the rest),
// with each CDN's resize params so the hero, role tiles and industry cards
// all get crops at the size they render. Swap any entry for owned photography
// by pointing `src` at /img/… — nothing else needs to change.
//
// Licence: Pexels and Unsplash are both free for commercial use with no
// attribution required. The photographer is kept per entry anyway as the
// audit trail; the source list with page links lives in reports/v5-photos.json.

export type Photo = {
  /** Base URL, no query string. Pexels or Unsplash hot-link, or a /public path. */
  src: string;
  alt: string;
  /** object-position for the cover crop — keeps faces in frame. */
  pos?: string;
  credit?: string;
};

/**
 * Size a CDN photo on the way out. Local /img assets pass through untouched.
 * On Unsplash, `fit=crop&crop=faces` picks the crop around the people in the
 * frame when the aspect ratio changes; Pexels crops from the centre.
 */
export function photoUrl(p: Photo, width: number, height?: number): string {
  if (p.src.startsWith("https://images.pexels.com/")) {
    const q = new URLSearchParams({ auto: "compress", cs: "tinysrgb", w: String(width) });
    if (height) {
      q.set("h", String(height));
      q.set("fit", "crop");
    }
    return `${p.src}?${q.toString()}`;
  }
  if (!p.src.startsWith("https://images.unsplash.com/")) return p.src;
  const q = new URLSearchParams({
    auto: "format",
    fit: "crop",
    crop: "faces,entropy",
    w: String(width),
    q: "78"
  });
  if (height) q.set("h", String(height));
  return `${p.src}?${q.toString()}`;
}

const U = "https://images.unsplash.com/photo-";
const pexels = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`;

export const PHOTOS = {
  restaurant: {
    src: pexels(29129767),
    alt: "Server carrying a tray of plates through a warmly lit restaurant",
    pos: "50% 35%",
    credit: "Kenzhar Sharap"
  },
  bar: {
    src: pexels(4485407),
    alt: "Bartender in a black vest making a cocktail behind a dimly lit bar",
    pos: "50% 30%",
    credit: "Antoni Shkraba"
  },
  hotel: {
    src: pexels(29649747),
    alt: "Hotel receptionist at a warmly lit wooden front desk",
    pos: "50% 35%",
    credit: "Clément Proust"
  },
  cafe: {
    src: pexels(20609544),
    alt: "Barista in an apron working behind the counter of a bright café",
    pos: "50% 35%",
    credit: "Fatima Said"
  },
  grocery: {
    src: pexels(8476592),
    alt: "Grocery store employee in an apron bagging fresh produce",
    pos: "50% 35%",
    credit: "Kampus Production"
  },
  catering: {
    src: pexels(36581576),
    alt: "Smiling event server presenting a tray of cocktails",
    pos: "50% 30%",
    credit: "Luis Morales Torres"
  },
  kitchen: {
    src: `${U}1581349485608-9469926a8e5e`,
    alt: "Chef plating dishes under the pass lights in a commercial kitchen",
    pos: "50% 35%",
    credit: "Sebastian Coman Photography"
  },
  foodtruck: {
    src: `${U}1565524622405-171b921788ca`,
    alt: "Food truck operator at the serving window under string lights",
    pos: "50% 40%",
    credit: "Should Wang"
  },
  manager: {
    src: `${U}1778791672994-34708641cb9d`,
    alt: "Restaurant staff member with a tablet talking with guests at a bar table",
    pos: "50% 40%",
    credit: "SpotOn"
  },
  host: {
    src: `${U}1758519289791-ffce8889ca8c`,
    alt: "Host in an apron holding a tablet at the front of a restaurant",
    pos: "50% 35%",
    credit: "Vitaly Gariev"
  },
  dishwasher: {
    src: `${U}1788999423969-793af406874e`,
    alt: "Back-of-house worker washing dishes at a café sink",
    pos: "50% 35%",
    credit: "Ali Aziz"
  },
  brewery: {
    src: `${U}1574521091464-a55e7763c1e5`,
    alt: "Bartender pouring a beer from a row of taps in a taproom",
    pos: "50% 40%",
    credit: "Louis Hansel"
  },
  delivery: {
    src: `${U}1778825628168-31dc884db219`,
    alt: "Food delivery courier on a bicycle with an insulated bag",
    pos: "50% 35%",
    credit: "Roman"
  },
  hotelbar: {
    src: `${U}1436018626274-89acd1d6ec9d`,
    alt: "Bartender in a white shirt and tie behind an upscale backlit hotel bar",
    pos: "50% 40%",
    credit: "Taylor Davidson"
  },
  team: {
    src: `${U}1779591211588-f0302902a53f`,
    alt: "Three smiling restaurant staff members behind a counter",
    pos: "50% 40%",
    credit: "Lens Fables"
  },
  certificate: {
    src: `${U}1737162878337-4b767dd107ea`,
    alt: "Cook in a restaurant kitchen reading his phone",
    pos: "50% 30%",
    credit: "Alina Belogolova"
  }
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof PHOTOS;
