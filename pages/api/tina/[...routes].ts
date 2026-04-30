// Tina self-hosted backend handler.
// Pages Router used here for compatibility with @tinacms/datalayer's
// TinaNodeBackend (which expects Express-style req/res). The rest of the
// app uses App Router; both can coexist in Next.js 15.

import { TinaNodeBackend, LocalBackendAuthProvider } from "@tinacms/datalayer";
import { TinaAuthJSOptions, AuthJsBackendAuthProvider } from "tinacms-authjs";

import databaseClient from "../../../tina/__generated__/databaseClient";

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";

const handler = TinaNodeBackend({
  authProvider: isLocal
    ? LocalBackendAuthProvider()
    : AuthJsBackendAuthProvider({
        authOptions: TinaAuthJSOptions({
          databaseClient,
          secret: process.env.NEXTAUTH_SECRET!
        })
      }),
  databaseClient
});

export default (req: import("next").NextApiRequest, res: import("next").NextApiResponse) => {
  return handler(req, res);
};
