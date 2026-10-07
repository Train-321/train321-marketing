"use client";

// The search-bar style finder ("Where do you work? / What do you need?")
// shared by the v5 and v6 heroes. Reads and writes the finder context, and
// scrolls to the explorer on submit.

import CustomSelect from "@/components/CustomSelect";
import { STATE_CODES_BY_NAME, STATE_NAMES, US_STATES } from "@/lib/states";
import { useFinderV5 } from "./FinderContext";

export default function FinderBar({ cta = "Search courses" }: { cta?: string }) {
  const { stateCode, setStateCode, chip, setChip, chips, focusExplorer, detectLocation, detecting } = useFinderV5();
  const chipLabels = chips.map((c) => c.label);
  const chipLabel = chips.find((c) => c.id === chip)?.label || chipLabels[0];

  return (
    <form
      className="v5-finderbar"
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
          placeholder="Pick your state"
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
          direction="down"
        />
      </div>
      <span className="v5-finderbar__divider" aria-hidden="true" />
      <div className="v5-finderbar__field">
        <span className="v5-finderbar__label">
          <i className="fas fa-graduation-cap" aria-hidden="true" /> What do you need?
        </span>
        <CustomSelect
          value={chipLabel}
          options={chipLabels}
          placeholder="All courses"
          ariaLabel="Course type"
          onChange={(label) => {
            const hit = chips.find((c) => c.label === label);
            setChip(hit ? hit.id : "all");
          }}
          direction="down"
        />
      </div>
      <button type="submit" className="v5-btn v5-btn--ink v5-finderbar__go">
        <i className="fas fa-search" aria-hidden="true" />
        {cta}
      </button>
    </form>
  );
}
