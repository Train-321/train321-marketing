// Tina self-hosted database adapter.
//
// LOCAL DEV: uses an in-memory filesystem-backed adapter (no MongoDB required).
//   Set TINA_PUBLIC_IS_LOCAL=true in .env.local to enable.
//   Content reads/writes go straight to the filesystem; commits are NOT made.
//
// PRODUCTION: uses MongoDB for the level database + GitHub provider for git writes.
//   Required env vars:
//     - MONGODB_URI                       — connection string for MongoDB Atlas (or any Mongo instance)
//     - GITHUB_OWNER                      — "Train-321"
//     - GITHUB_REPO                       — "train321-marketing"
//     - GITHUB_PERSONAL_ACCESS_TOKEN      — fine-grained PAT with Contents: Read+Write on the repo
//     - GITHUB_BRANCH or VERCEL_GIT_COMMIT_REF — defaults to "main"

import { MongodbLevel } from "mongodb-level";
import { GitHubProvider } from "tinacms-gitprovider-github";
import { createDatabase, createLocalDatabase } from "@tinacms/datalayer";

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default isLocal
  ? createLocalDatabase()
  : createDatabase({
      gitProvider: new GitHubProvider({
        branch,
        owner: process.env.GITHUB_OWNER!,
        repo: process.env.GITHUB_REPO!,
        token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN!
      }),
      databaseAdapter: new MongodbLevel<string, Record<string, unknown>>({
        collectionName: `tinacms-${branch}`,
        dbName: "tinacms",
        mongoUri: process.env.MONGODB_URI!
      }),
      namespace: branch
    });
