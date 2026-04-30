// NextAuth handler for Tina editor login.
// Uses tinacms-authjs's UsernamePasswordAuthJSProvider which stores users in
// the Tina dataset (collection: tinacms-users). The first user is seeded
// via the Tina admin signup flow (or via `tinacms admin signup` CLI).

import NextAuth from "next-auth";
import { TinaAuthJSOptions } from "tinacms-authjs";

import databaseClient from "../../../tina/__generated__/databaseClient";

export default NextAuth(
  TinaAuthJSOptions({
    databaseClient,
    secret: process.env.NEXTAUTH_SECRET!
  })
);
