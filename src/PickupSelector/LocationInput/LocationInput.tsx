import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import "./LocationInput.css";

import { useScript } from "../../hooks/useScript";
import {
  findCities,
  MAPS_SCRIPT,
  newPlaceSession,
  resolvePlace,
  type PlacePrediction,
} from "../../lib/maps";
import type { GeoLocation } from "../../types";

// Wait for a pause in typing before asking Google for suggestions.
const DEBOUNCE_MS = 200;
const LISTBOX_ID = "location-suggestions";

interface Props {
  location: GeoLocation | null;
  setLocation: (location: GeoLocation | null) => void;
  disabled: boolean;
}

// A suggestion's text with the part that matches the query in bold.
function Highlighted({ prediction }: { prediction: PlacePrediction }) {
  const { text, matches } = prediction.text;
  const parts = [];
  let at = 0;
  for (const { startOffset = 0, endOffset } of matches) {
    if (startOffset > at) {
      parts.push(text.slice(at, startOffset));
    }
    parts.push(
      <b key={startOffset} className="place-suggest__match">
        {text.slice(startOffset, endOffset)}
      </b>,
    );
    at = endOffset;
  }
  parts.push(text.slice(at));
  // One span, so the flex item doesn't trim the space after a match.
  return <span>{parts}</span>;
}

// Rental pickup location input: a combobox of US cities from Google Places.
export default function LocationInput({
  location,
  setLocation,
  disabled,
}: Props) {
  const status = useScript(MAPS_SCRIPT);
  const [query, setQuery] = useState(location?.label ?? "");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [problem, setProblem] = useState<string | null>(null);
  const session = useRef<object | null>(null);

  // Keep the field in step with a location set from outside (the URL).
  useEffect(() => {
    if (location) {
      setQuery(location.label);
    }
  }, [location]);

  useEffect(() => {
    const input = query.trim();
    if (status !== "ready" || !open || input.length < 2 || input === location?.label) {
      setPredictions([]);
      return;
    }

    let live = true;
    const timer = window.setTimeout(() => {
      session.current ??= newPlaceSession();
      if (!session.current) {
        return;
      }
      findCities(input, session.current)
        .then((found) => {
          if (live) {
            setPredictions(found);
            setActive(-1);
            setProblem(null);
          }
        })
        .catch(() => {
          if (live) {
            setPredictions([]);
            setProblem("Place search isn’t responding. Keep typing to try again.");
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [query, open, status, location?.label]);

  const choose = async (prediction: PlacePrediction) => {
    setQuery(prediction.text.text);
    setOpen(false);
    setPredictions([]);
    try {
      setLocation(await resolvePlace(prediction));
      setProblem(null);
    } catch {
      setProblem("Couldn’t load that place. Pick it again.");
      setOpen(true);
    } finally {
      session.current = null;
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (predictions.length > 0) {
        const step = event.key === "ArrowDown" ? 1 : -1;
        setActive((index) => (index + step + predictions.length) % predictions.length);
      }
    } else if (event.key === "Enter" && open && predictions.length > 0) {
      event.preventDefault();
      void choose(predictions[Math.max(active, 0)]);
    } else if (event.key === "Escape" && open) {
      setOpen(false);
    }
  };

  const showList = open && (predictions.length > 0 || problem !== null);

  return (
    <div className="d-flex align-items-center input-container">
      <i aria-hidden="true" className="fas fa-map-marker-alt p-2"></i>

      {status === "error" ? (
        <p className="location-status" role="alert">
          Place search didn’t load.
          <button type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </p>
      ) : status !== "ready" ? (
        <p className="location-status" role="status">
          Loading place search…
        </p>
      ) : (
        <div className="place-suggest">
          <label className="visually-hidden-label" htmlFor="location-input">
            Pick-up location
          </label>
          <input
            id="location-input"
            className="place-suggest__input"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls={LISTBOX_ID}
            aria-activedescendant={
              showList && active >= 0 ? `${LISTBOX_ID}-${active}` : undefined
            }
            placeholder="Pick up at..."
            autoComplete="off"
            value={query}
            disabled={disabled}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              // Typing over a picked place unpicks it, so Find cars never
              // searches a place the field no longer shows.
              if (location) {
                setLocation(null);
              }
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={handleKeyDown}
          />
          <ul
            id={LISTBOX_ID}
            role="listbox"
            aria-label="Matching cities"
            className="place-suggest__list"
            hidden={!showList}
          >
            {problem && predictions.length === 0 ? (
              <li role="presentation" className="place-suggest__problem">
                {problem}
              </li>
            ) : (
              predictions.map((prediction, index) => (
                <li
                  key={prediction.placeId}
                  id={`${LISTBOX_ID}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  className={
                    "place-suggest__item" +
                    (index === active ? " place-suggest__item--active" : "")
                  }
                  // Keep focus in the field so blur doesn't close the list
                  // before the click lands.
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => void choose(prediction)}
                >
                  <Highlighted prediction={prediction} />
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
