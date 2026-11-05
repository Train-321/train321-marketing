/**
 * Which LMS API base the CURRENT REQUEST should talk to.
 *
 * Every LMS call in lib/ reads its base through lmsBase(DEFAULT). Normally
 * that is just DEFAULT — the production API — so nothing changes for the
 * site. The one exception is the /enrollment page opened with ?test=true:
 * its server code runs inside withStageApi() (app/enrollment/stageApi.ts),
 * which makes lmsBase() answer the new-features staging API for that request
 * only.
 *
 * This file is deliberately tiny and free of Node imports: lib/enroll.ts and
 * lib/newFeatures.ts are also bundled into client components, where no
 * override is ever registered and lmsBase() is simply the default.
 */
type Getter = () => string | undefined;

const slot = globalThis as typeof globalThis & { __t321LmsBaseOverride?: Getter };

export function lmsBase(fallback: string): string {
  return slot.__t321LmsBaseOverride?.() || fallback;
}
