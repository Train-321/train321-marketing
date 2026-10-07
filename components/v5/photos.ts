// Photography for the /v5 homepage. Every entry is a real workplace photo;
// Unsplash hot-links (already allowed in next.config remotePatterns) with
// imgix crop params so the hero accordion, role tiles and industry cards all
// get face-safe crops at the size they render. Swap any entry for owned
// photography by pointing `src` at /img/… — nothing else needs to change.
//
// Licence: Unsplash (free for commercial use, no attribution required). The
// photographer is kept per entry anyway as the audit trail; the source list
// with page links lives in reports/v5-photos.json.

export type Photo = {
  /** Base URL, no query string. Unsplash hot-link or a /public path. */
  src: string;
  alt: string;
  /** object-position for the cover crop — keeps faces in frame. */
  pos?: string;
  credit?: string;
};

/**
 * Size an Unsplash photo on the way out. Local /img assets pass through
 * untouched. `fit=crop&crop=faces` lets Unsplash pick the crop around the
 * people in the frame when the aspect ratio changes.
 */
export function photoUrl(p: Photo, width: number, height?: number): string {
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

export const PHOTOS = {
  restaurant: {
    src: `${U}1719573019827-d06944a0c2be`,
    alt: "Waiter carrying a tray of plates through a busy dining room",
    pos: "50% 30%",
    credit: "Roshan Chakkeeri"
  },
  bar: {
    src: `${U}1647776112336-72f4c30fafc1`,
    alt: "Bartender pouring a cocktail from a shaker behind a warm wooden bar",
    pos: "50% 35%",
    credit: "Olena Bohovyk"
  },
  hotel: {
    src: `${U}1580842402762-6f5868c17412`,
    alt: "Hotel housekeeper pushing a cart down a hotel corridor",
    pos: "50% 30%",
    credit: "Ashwini Chaudhary"
  },
  cafe: {
    src: `${U}1507914372368-b2b085b925a1`,
    alt: "Smiling barista holding a portafilter at the espresso machine",
    pos: "50% 35%",
    credit: "Brooke Cagle"
  },
  grocery: {
    src: `${U}1774978612876-967903f8ab82`,
    alt: "Grocery worker in a hairnet and gloves stocking produce",
    pos: "50% 30%",
    credit: "Adhitya Sibikumar"
  },
  catering: {
    src: `${U}1779683609997-b541b697d0c2`,
    alt: "Smiling event server carrying a drink on a tray at a banquet",
    pos: "50% 30%",
    credit: "Lens Fables"
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
