import { useRef } from "react";
import {
	fetchThemeDetails,
	fetchUsage,
} from "../../../slices/themeDetailsSlice";
import { useAppDispatch } from "../../../store";
import { deleteTheme, ThemeDetailsType } from "../../../slices/themeSlice";
import ThemeDetails from "./wizard/ThemeDetails";
import { ActionCellDelete } from "../../shared/ActionCellDelete";
import { IconButton } from "../../shared/IconButton";
import { Modal, ModalHandle } from "../../shared/modals/Modal";
import { useTranslation } from "react-i18next";

/**
 * This component renders the action cells of themes in the table view
 */
const ThemesActionsCell = ({
	row,
}: {
	row: ThemeDetailsType
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const detailsModalRef = useRef<ModalHandle>(null);

	const hideThemeDetails = () => {
		detailsModalRef.current?.close?.();
	};

	const showThemeDetails = async () => {
		await Promise.all([
			dispatch(fetchThemeDetails(row.id)),
			dispatch(fetchUsage(row.id)),
		]);

		detailsModalRef.current?.open();
	};

	const deletingTheme = (id: number) => {
		dispatch(deleteTheme(id));
	};

	return (
		<>
			{/* edit themes */}
			<IconButton
				callback={() => showThemeDetails()}
				iconClassname={"more"}
				editAccessRole={"ROLE_UI_THEMES_EDIT"}
				tooltipText={"CONFIGURATION.THEMES.TABLE.TOOLTIP.DETAILS"}
			/>

			{/* themes details modal */}
			<Modal
				header={t("CONFIGURATION.THEMES.DETAILS.EDITCAPTION", { name: row.name })}
				classId="theme-details-modal"
				ref={detailsModalRef}
			>
				{/* component that manages tabs of theme details modal*/}
				<ThemeDetails close={hideThemeDetails} />
			</Modal>

			{/* delete themes */}
			<ActionCellDelete
				editAccessRole={"ROLE_UI_THEMES_DELETE"}
				tooltipText={"CONFIGURATION.THEMES.TABLE.TOOLTIP.DELETE"}
				resourceId={row.id}
				resourceName={row.name}
				resourceType={"THEME"}
				deleteMethod={deletingTheme}
			/>
		</>
	);
};

export default ThemesActionsCell;
