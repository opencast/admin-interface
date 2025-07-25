import React, { useState, useEffect } from "react";
import { arrayMoveImmutable } from "array-move";
import { useTranslation } from "react-i18next";
import { changeColumnSelection } from "../../thunks/tableThunks";
import {
	getActivatedColumns,
	getDeactivatedColumns,
	getResourceType,
} from "../../selectors/tableSelectors";
import { DragDropContext, Droppable, OnDragEndResponder, Draggable as Draggablee } from "@hello-pangea/dnd";
import { useAppDispatch, useAppSelector } from "../../store";
import ButtonLikeAnchor from "./ButtonLikeAnchor";
import { aclsTableConfig, TableColumn } from "../../configs/tableConfigs/aclsTableConfig";
import { eventsTableConfig } from "../../configs/tableConfigs/eventsTableConfig";
import { seriesTableConfig } from "../../configs/tableConfigs/seriesTableConfig";
import { recordingsTableConfig } from "../../configs/tableConfigs/recordingsTableConfig";
import { jobsTableConfig } from "../../configs/tableConfigs/jobsTableConfig";
import { serversTableConfig } from "../../configs/tableConfigs/serversTableConfig";
import { servicesTableConfig } from "../../configs/tableConfigs/servicesTableConfig";
import { usersTableConfig } from "../../configs/tableConfigs/usersTableConfig";
import { groupsTableConfig } from "../../configs/tableConfigs/groupsTableConfig";
import { themesTableConfig } from "../../configs/tableConfigs/themesTableConfig";
import { Modal, ModalHandle } from "./modals/Modal";
import { Resource } from "../../slices/tableSlice";
import { ParseKeys } from "i18next";
import ModalContentTable from "./modals/ModalContentTable";

/**
 * This component renders the modal for editing which columns are shown in the table
 */
const EditTableViewModal = ({
	close,
	modalRef,
}: {
	close: () => void,
	modalRef: React.RefObject<ModalHandle | null>
}) => {
	const { t } = useTranslation();

	return (
		<Modal
			header={t("PREFERENCES.TABLE.CAPTION")}
			classId="edit-table-view-modal"
			className="modal active modal-animation"
			ref={modalRef}
		>
			<EditTableViewModalContent
				handleClose={close}
			/>
		</Modal>
	);
};

const EditTableViewModalContent = ({
	handleClose,
}: {
	handleClose: () => void,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const resource = useAppSelector(state => getResourceType(state));
	const deactivatedColumns = useAppSelector(state => getDeactivatedColumns(state));
	const activeColumns = useAppSelector(state => getActivatedColumns(state));

	const originalActiveColumns = activeColumns;
	const originalDeactivatedColumns = deactivatedColumns;

	const [deactivatedCols, setDeactivatedColumns] = useState(deactivatedColumns);
	const [activeCols, setActiveColumns] = useState(activeColumns);
	const [isColsLoaded, setIsColsLoaded] = useState(false);

	useEffect(() => {
		if (!isColsLoaded) {
			if (activeColumns.length !== 0 || deactivatedColumns.length !== 0) {
				setIsColsLoaded(true);
			}
			setActiveColumns(activeColumns);
			setDeactivatedColumns(deactivatedColumns);
		}
	}, [activeColumns, deactivatedColumns, isColsLoaded]);

	// closes this modal
	const close = () => {
		clearData();
		handleClose();
	};

	// set deactivated property of column to true (deactivate = true) or false (deactivate = false) and move to corresponding list
	const changeColumn = (column: TableColumn, deactivate: boolean) => {
		if (deactivate) {
			setActiveColumns(activeCols.filter(col => col !== column));
			column = { ...column, deactivated: deactivate };
			setDeactivatedColumns(deactivatedCols.concat(column));
		} else {
			setDeactivatedColumns(deactivatedCols.filter(col => col !== column));
			column = { ...column, deactivated: deactivate };
			setActiveColumns(activeCols.concat(column));
		}
	};

	// save new values of which columns are active or deactivated and apply changes to table
	const save = () => {
		const settings = activeCols.concat(deactivatedCols);
		dispatch(changeColumnSelection(settings));
		close();
	};

	// reset active and deactivated columns to how they were when the dialogue was opened (used when closing without saving)
	const clearData = () => {
		setActiveColumns(originalActiveColumns);
		setDeactivatedColumns(originalDeactivatedColumns);
		handleClose();
	};

	// Reset columns to how they were before the user made any changes ever
	const resetToInitialConfig = () => {
		const initialConfig = getConfigByResource(resource);
		setActiveColumns(initialConfig?.columns.filter(column => !column.deactivated) ?? []);
		setDeactivatedColumns(initialConfig?.columns.filter(column => column.deactivated) ?? []);
	};

	const getConfigByResource = (resource: Resource) => {
		switch (resource) {
			case "events": return eventsTableConfig;
			case "series": return seriesTableConfig;
			case "recordings": return recordingsTableConfig;
			case "jobs": return jobsTableConfig;
			case "servers": return serversTableConfig;
			case "services": return servicesTableConfig;
			case "users": return usersTableConfig;
			case "groups": return groupsTableConfig;
			case "acls": return aclsTableConfig;
			case "themes": return themesTableConfig;
		}
	};

	// change column order based on where column was dragged and dropped
	const onDragEnd: OnDragEndResponder = result => {
		// dropped outside the list
		const destination = result.destination;
		if (destination === null) {
			return;
		}

		setActiveColumns(columns => arrayMoveImmutable(columns, result.source.index, destination.index));
	};

	const getTranslationForSubheading = (resource: Resource): ParseKeys | undefined => {
		const resourceUC: Uppercase<Resource> = resource.toUpperCase() as Uppercase<Resource>;
		if (resourceUC === "EVENTS" || resourceUC === "SERIES") {
			return `EVENTS.${resourceUC}.TABLE.CAPTION`;
		}
		if (resourceUC === "RECORDINGS") {
			return `${resourceUC}.${resourceUC}.TABLE.CAPTION`;
		}
		if (resourceUC === "JOBS" || resourceUC === "SERVERS" || resourceUC === "SERVICES") {
			return `SYSTEMS.${resourceUC}.TABLE.CAPTION`;
		}
		if (resourceUC === "USERS" || resourceUC === "GROUPS" || resourceUC === "ACLS") {
			return `USERS.${resourceUC}.TABLE.CAPTION`;
		}
		if (resourceUC === "THEMES") {
			return `CONFIGURATION.${resourceUC}.TABLE.CAPTION`;
		}
	};

	return (
		<>
			<ModalContentTable>
				<div className="tab-description for-header">
					<p>
						{t("PREFERENCES.TABLE.SUBHEADING", {
							tableName: t(getTranslationForSubheading(resource)!),
						})}
					</p>
				</div>

				<div className="row">
					<div className="col">
						<div className="obj drag-available-column">
							<header>
								<h2>
									{
										t(
											"PREFERENCES.TABLE.AVAILABLE_COLUMNS",
										) /* Available Columns */
									}
								</h2>
							</header>
							<ul className="drag-drop-items">
								{deactivatedCols.map((column, key) =>
									column ? (
										<li className="drag-item" key={key}>
											<div className="title">{t(column.label)}</div>
											<ButtonLikeAnchor
												extraClassName="move-item add"
												onClick={() => changeColumn(column, false)}
											>
												<span className="sr-only">{t("PREFERENCES.TABLE.ADD_COLUMN")}</span>
											</ButtonLikeAnchor>
										</li>
									) : null,
								)}
							</ul>
						</div>
					</div>

					<div className="col">
						<div className="obj drag-selected-column">
							<header>
								<h2>
									{
										t(
											"PREFERENCES.TABLE.SELECTED_COLUMNS",
										) /* Selected Columns */
									}
								</h2>
							</header>
							<ul className="drag-drop-items">
								<li>
									<DragDropContext
										onDragEnd={onDragEnd}
										dragHandleUsageInstructions={t("PREFERENCES.TABLE.DRAG_HANDLE_USAGE_INSTRUCTIONS")}
									>
										<Droppable droppableId="droppable">
											{(provided, _snapshot) => (
												<div
													{...provided.droppableProps}
													ref={provided.innerRef}
													// style={}
												>
													{activeCols.filter(col => col).map((column, key) =>
														(
															<Draggablee key={column.name} draggableId={column.name} index={key}>
																{(provided, _snapshot) => (
																	<div
																		ref={provided.innerRef}
																		{...provided.draggableProps}
																		{...provided.dragHandleProps}
																		style={{ ...provided.draggableProps.style }}
																		className="drag-item"
																	>
																		<div className="title">
																			{t(column.label)}
																		</div>
																		<ButtonLikeAnchor
																			extraClassName="move-item remove"
																			onClick={() => changeColumn(column, true)}
																		>
																			<span className="sr-only">{t("PREFERENCES.TABLE.REMOVE_COLUMN")}</span>
																		</ButtonLikeAnchor>
																	</div>
																)}
															</Draggablee>
														),
													)}
													{provided.placeholder}
												</div>
											)}
										</Droppable>
									</DragDropContext>

								</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="tab-description for-footer">
					<p>
						{/* The order and selection will be saved automatically.
												Press "Reset" to restore the default view. */}
						{t("PREFERENCES.TABLE.FOOTER_TEXT", {
							resetTranslation: t("RESET"),
						})}
					</p>
				</div>
			</ModalContentTable>

			<footer>
				{/* Render buttons for updating table data */}
					<button onClick={() => clearData()} className="cancel active">
						{t("CANCEL") /* Cancel*/}
					</button>
					<button onClick={() => save()} className="submit active">
						{t("SAVE") /* Save As Default */}
					</button>
					<button onClick={() => resetToInitialConfig()} className="cancel active">
						{t("RESET") /* Reset saved setting */}
					</button>
			</footer>
		</>
	);
};

export default EditTableViewModal;
