import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ cacheDir: 'D:/train321/train321-marketing/tina/__generated__/.cache/1777586335571', url: '/api/tina/gql', token: 'undefined', queries,  });
export default client;
  