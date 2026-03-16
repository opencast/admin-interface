import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { arrayMoveImmutable } from "array-move";
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from "@hello-pangea/dnd";
import { LuCircleX, LuExternalLink, LuGrip } from "react-icons/lu";

import { getSourceURL } from "../../../../utils/embeddedCodeUtils";
import { Tooltip } from "../../../shared/Tooltip";
import { PlaylistEntry } from "../../../../slices/playlistDetailsSlice";
import Notifications from "../../../shared/Notifications";
import DropDown from "../../../shared/DropDown";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";


export type EventResult = {
  id: string,
  title: string,
  start_date: string,
  series?: { id: string, title: string },
  presenters: string[],
};

type EventSearchResult = {
  results: EventResult[],
  total: number,
};

/**
 * Search events by text filter and cache the results.
 * IDs already in the playlist are excluded.
 */
const searchEvents = async (
  inputValue: string,
  excludeIds: Set<string>,
  metadataCache: React.RefObject<Map<string, EventResult>>,
  setNoAvailableEvents: (empty: boolean) => void,
): Promise<{ label: string, value: string }[]> => {
  const params: Record<string, string | number> = {
    limit: 20,
    offset: 0,
  };

  if (inputValue) {
    params.filter = `textFilter:${inputValue}`;
  }

  const res = await axios.get<EventSearchResult>(
    "/admin-ng/event/events.json",
    { params },
  );

  const filtered = res.data.results.filter(e => !excludeIds.has(e.id));
  for (const e of filtered) {
    metadataCache.current.set(e.id, e);
  }

  if (!inputValue) {
    setNoAvailableEvents(filtered.length === 0);
  }

  return filtered.map(e => ({
    label: e.title,
    value: e.id,
  }));
};

const EntryMeta = ({ entry }: { entry: PlaylistEntry }) => {
  const { t } = useTranslation();

  const hasMeta = entry.date || entry.series
    || (entry.presenters && entry.presenters.length > 0);

  if (!hasMeta) {
    return null;
  }

  return <div className="entry-meta">
    {entry.date && (
      <span>
        <span className="entry-meta-label">
          {t("EVENTS.PLAYLISTS.DETAILS.ENTRIES.DATE_LABEL")}
        </span>
        {new Date(entry.date).toLocaleDateString()}
      </span>
    )}

    {entry.series && (
      <span>
        <span className="entry-meta-label">
          {t("EVENTS.PLAYLISTS.DETAILS.ENTRIES.SERIES_LABEL")}
        </span>
        {entry.series}
      </span>
    )}

    {entry.presenters && entry.presenters.length > 0 && (
      <span>
        <span className="entry-meta-label">
          {t("EVENTS.PLAYLISTS.DETAILS.ENTRIES.PRESENTERS_LABEL")}
        </span>
        {entry.presenters.join(", ")}
      </span>
    )}
  </div>;
};


const PlaylistEntriesEditor = ({
  entries,
  setEntries,
  showEngageLinks,
}: {
  entries: PlaylistEntry[],
  setEntries: (updated: PlaylistEntry[]) => void,
  showEngageLinks?: boolean,
}) => {
  const { t } = useTranslation();
  const metadataCache = useRef(new Map<string, EventResult>());
  const [noAvailableEvents, setNoAvailableEvents] = useState(false);
  const [engageUrl, setEngageUrl] = useState("");

  useEffect(() => {
    if (showEngageLinks) {
      void getSourceURL().then(url => setEngageUrl(url));
    }
  }, [showEngageLinks]);

  const entryIds = new Set(entries.map(e => e.contentId));

  const fetchFilteredEvents = (input: string) => searchEvents(
    input, entryIds, metadataCache, setNoAvailableEvents,
  );

  const addEntry = (eventId: string, title: string) => {
    if (entries.some(e => e.contentId === eventId)) {
      return;
    }

    const meta = metadataCache.current.get(eventId);

    const newEntry: PlaylistEntry = {
      contentId: eventId,
      type: "EVENT",
      title,
      date: meta?.start_date,
      series: meta?.series?.title,
      presenters: meta?.presenters,
    };

    setEntries([...entries, newEntry]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const onDragEnd: OnDragEndResponder = result => {
    const destination = result.destination;
    if (!destination) {
      return;
    }
    setEntries(
      arrayMoveImmutable(entries, result.source.index, destination.index),
    );
  };

  return <>
    <Notifications context="not_corner" />

    {/* Dropdown to add entries */}
    <div className="obj playlist-entries-box">
      <header>
        <h2>{t("EVENTS.PLAYLISTS.DETAILS.ENTRIES.AVAILABLE")}</h2>
      </header>

      <table className="main-tbl">
        <tbody>
          <tr>
            <td className="editable">
              <DropDown
                key={entryIds.size}
                value={""}
                text={""}
                required={true}
                handleChange={option => {
                  if (option && option.value) {
                    addEntry(option.value, option.label);
                  }
                }}
                placeholder={t(
                  noAvailableEvents
                    ? "EVENTS.PLAYLISTS.DETAILS.ENTRIES.NO_AVAILABLE"
                    : "EVENTS.PLAYLISTS.DETAILS.ENTRIES.SEARCH_PLACEHOLDER",
                )}
                disabled={noAvailableEvents}
                fetchOptions={fetchFilteredEvents}
                skipTranslate
                customCSS={{ width: "100%" }}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    {/* Entry list */}
    <div className="obj playlist-entries-box">
      <header>
        <h2>
          {t("EVENTS.PLAYLISTS.DETAILS.TABS.ENTRIES")}
          {entries.length > 0 && (
            <span className="playlist-entry-count">
              {" "}({entries.length})
            </span>
          )}
        </h2>
      </header>

      {entries.length === 0 ? (
        <p className="playlist-entries-empty">
          {t("EVENTS.PLAYLISTS.DETAILS.ENTRIES.EMPTY")}
        </p>
      ) : (
        <div className="drag-drop-items playlist-entries-list">
          <DragDropContext
            onDragEnd={onDragEnd}
            dragHandleUsageInstructions={t(
              "PREFERENCES.TABLE.DRAG_HANDLE_USAGE_INSTRUCTIONS",
            )}
          >
            <Droppable droppableId="playlist-entries">
              {provided => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {entries.map((entry, index) => (
                    <Draggable
                      key={entry.contentId}
                      draggableId={entry.contentId}
                      index={index}
                      isDragDisabled={entries.length <= 1}
                    >
                      {provided => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{ ...provided.draggableProps.style }}
                          className={`drag-item playlist-entry-item${entries.length <= 1 ? " drag-disabled" : ""}`}
                        >
                          <LuGrip />
                          <div className="entry-info">
                            <div className="title" title={entry.title}>
                              {entry.title}
                            </div>
                            <EntryMeta entry={entry} />
                          </div>
                          {showEngageLinks && engageUrl && (
                            <Tooltip title={t("EVENTS.PLAYLISTS.DETAILS.ENTRIES.OPEN_PLAYER")}>
                              <a
                                href={`${engageUrl}/play/${entry.contentId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="entry-link"
                                onClick={e => e.stopPropagation()}
                              >
                                <LuExternalLink />
                              </a>
                            </Tooltip>
                          )}
                          <ButtonLikeAnchor
                            className="move-item remove"
                            onClick={() => removeEntry(index)}
                            tooltipText="EVENTS.PLAYLISTS.DETAILS.ENTRIES.REMOVE"
                            aria-label={t("EVENTS.PLAYLISTS.DETAILS.ENTRIES.REMOVE")}
                          >
                            <LuCircleX />
                          </ButtonLikeAnchor>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
    </div>
  </>;
};

export default PlaylistEntriesEditor;
