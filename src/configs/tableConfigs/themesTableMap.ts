import ThemesActionsCell from "../../components/configuration/partials/ThemesActionsCell";
import ThemesDateTimeCell from "../../components/configuration/partials/ThemesDateTimeCell";

/**
 * This map contains the mapping between the template strings above and the corresponding react component.
 * This helps to render different templates of cells more dynamically. Even empty needed, because Table component
 * uses template map.
 */
export const themesTemplateMap = {
	ThemesActionsCell: ThemesActionsCell,
	ThemesDateTimeCell: ThemesDateTimeCell,
};
