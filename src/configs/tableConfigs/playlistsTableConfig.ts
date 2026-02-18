import { TableConfig } from "./aclsTableConfig";

/**
 * Config that contains the columns and further information regarding playlists.
 * Information configured in this file:
 * - columns: names, labels, sortable, (template)
 * - caption for showing in table view
 * - resource type (here: playlists)
 * - category type (here: events)
 */
export const playlistsTableConfig: TableConfig = {
  columns: [
    {
      template: "PlaylistTitleCell",
      name: "title",
      label: "EVENTS.PLAYLISTS.TABLE.TITLE",
      sortable: true,
    },
    {
      name: "description",
      label: "EVENTS.PLAYLISTS.TABLE.DESCRIPTION",
    },
    {
      template: "PlaylistCreatorCell",
      name: "creator",
      label: "EVENTS.PLAYLISTS.TABLE.CREATOR",
      sortable: true,
    },
    {
      template: "PlaylistUpdatedCell",
      name: "updated",
      label: "EVENTS.PLAYLISTS.TABLE.UPDATED",
      sortable: true,
    },
  ],
  caption: "EVENTS.PLAYLISTS.TABLE.CAPTION",
  resource: "playlists",
  category: "events",
  multiSelect: false,
};
