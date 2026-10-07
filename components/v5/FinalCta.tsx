"use client";

import CustomSelect from "@/components/CustomSelect";
import { STATE_CODES_BY_NAME, STATE_NAMES, US_STATES } from "@/lib/states";
import { useFinderV5 } from "./FinderContext";
import { Reveal } from "./motion";

export default function FinalCta({ phone, email }: { phone: string; email: string }) {
  const { stateCode, setStateCode, focusExplorer, detectLocation, detecting } = useFinderV5();
  return (
    <section className="v5-section v5-final" aria-labelledby="v5-final-title">
      <div className="v5-final__glow" aria-hidden="true" />
      <div className="v5-container">
        <Reveal className="v5-final__inner">
          <p className="v5-eyebrow v5-eyebrow--light">
            <i className="fas fa-stopwatch" aria-hidden="true" /> Need it today?
          </p>
          <h2 id="v5-final-title" className="v5-h2">
            Start now. Be certified <em>before your shift ends.</em>
          </h2>
          <form
            className="v5-finderbar v5-finderbar--dark v5-finderbar--simple"
            role="search"
            aria-label="Find your course"
            onSubmit={(e) => {
              e.preventDefault();
              focusExplorer();
            }}
          >
            <div className="v5-finderbar__field">
              <span className="v5-finderbar__label">
                <i className="fas fa-map-marker-alt" aria-hidden="true" /> Where do you work?
              </span>
              <CustomSelect
                value={stateCode ? STATE_NAMES[stateCode] : ""}
                options={US_STATES.map((s) => s.name)}
                placeholder="Choose your state"
                ariaLabel="State"
                searchable
                clearable
                searchPlaceholder="Type a state…"
                onChange={(name) => setStateCode(STATE_CODES_BY_NAME[name] || null)}
                onClear={() => setStateCode(null)}
                action={{
                  label: detecting ? "Finding your state…" : "Use my location",
                  busy: detecting,
                  onSelect: () => void detectLocation()
                }}
              />
            </div>
            <button type="submit" className="v5-btn v5-btn--accent v5-finderbar__go">
              <i className="fas fa-search" aria-hidden="true" />
              Search courses
            </button>
          </form>
          <p className="v5-final__contact">
            Prefer a person? <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a> ·{" "}
            <a href={`mailto:${email}`}>{email}</a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
