import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getSelectedRows } from "../../../../selectors/tableSelectors";
import cn from "classnames";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
	deleteMultipleSeries,
	getSeriesConfig,
	hasEvents,
} from "../../../../slices/seriesSlice";
import { useHotkeys } from "react-hotkeys-hook";
import { availableHotkeys } from "../../../../configs/hotkeysConfig";
import { isSeries } from "../../../../slices/tableSlice";
import ModalContent from "../../../shared/modals/ModalContent";
import NavigationButtons from "../../../shared/NavigationButtons";
import { NotificationComponent } from "../../../shared/Notifications";
import { LuCheck } from "react-icons/lu";

/**
 * This component manges the delete series bulk action
 */
const DeleteSeriesModal = ({
	close,
}: {
	close: () => void
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const selectedRows = useAppSelector(state => getSelectedRows(state));
	const modifiedSelectedRows = selectedRows.map(row => {
		return { ...row, hasEvents: false };
	});

	const [allChecked, setAllChecked] = useState(true);
	const [selectedSeries, setSelectedSeries] = useState(modifiedSelectedRows);
	const [deleteWithSeriesAllowed, setDeleteWithSeriesAllowed] = useState(false);

	useHotkeys(
		availableHotkeys.general.CLOSE_MODAL.sequence,
		() => close(),
		{ description: t(availableHotkeys.general.CLOSE_MODAL.description) ?? undefined },
		[close],
  	);

	useEffect(() => {
		async function fetchData() {
			// Query from backend if deletion of series with events allowed
			const response = await getSeriesConfig();
			setDeleteWithSeriesAllowed(response);

			// Check for each selected series if it has events
			const series = [];
			for (let i = 0; i < selectedSeries.length; i++) {
				const selectedSeriesInThisLoop = selectedSeries[i];
				const events = isSeries(selectedSeriesInThisLoop) ? await hasEvents(selectedSeriesInThisLoop.id.toString()) : false;
				series.push({
					...selectedSeriesInThisLoop,
					hasEvents: events,
				});
			}
			setSelectedSeries(series);
		}
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const deleteSelectedSeries = () => {
		// @ts-expect-error TS(7006): Type guarding array is hard
		dispatch(deleteMultipleSeries(selectedSeries));
		close();
	};

	// Select or deselect all rows in table
	const onChangeAllSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selected = e.target.checked;
		setAllChecked(selected);
		const changedSelection = selectedSeries.map(series => {
			return {
				...series,
				selected: selected,
			};
		});
		setSelectedSeries(changedSelection);
	};

	// Handle change of checkboxes indicating which series to consider further
	const onChangeSelected = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
		const selected = e.target.checked;
		const changedSeries = selectedSeries.map(series => {
			if (isSeries(series) && series.id === id) {
				return {
					...series,
					selected: selected,
				};
			} else {
				return series;
			}
		});
		setSelectedSeries(changedSeries);

		if (!selected) {
			setAllChecked(false);
		}
		if (changedSeries.every(series => series.selected === true)) {
			setAllChecked(true);
		}
	};

	const isAllowed = () => {
		let allowed = true;
		if (!deleteWithSeriesAllowed) {
			selectedSeries.forEach(series => {
				if (allowed && series.selected && series.hasEvents) {
					allowed = false;
				}
			});
		}
		return allowed;
	};

	// Check validity for activating delete button
	const checkValidity = () => {
		if (isAllowed()) {
			return !!selectedSeries.some(series => series.selected === true);
		}
		return false;
	};

	return (
		<>
			<ModalContent>
				<NotificationComponent
					notification={{
						type: "error",
						message: "BULK_ACTIONS.DELETE_SERIES_WARNING_LINE1",
						id: 0,
					}}
				/>

				{/* Only show if series not allowed to be deleted */}
				{!isAllowed() && (
					<NotificationComponent
						notification={{
							type: "warning",
							message: "BULK_ACTIONS.DELETE.SERIES.CANNOT_DELETE",
							id: 0,
						}}
					/>
				)}

				<div className="full-col">
					<div className="obj">
						<header>{t("EVENTS.SERIES.TABLE.CAPTION")}</header>
						<div className="obj-container">
							<table className="main-tbl">
								<thead>
									<tr>
										<th className="small">
											<input
												type="checkbox"
												checked={allChecked}
												onChange={e => onChangeAllSelected(e)}
												className="select-all-cbox"
											/>
										</th>
										<th>{t("EVENTS.SERIES.TABLE.TITLE")}</th>
										<th>{t("EVENTS.SERIES.TABLE.ORGANIZERS")}</th>
										<th>{t("EVENTS.SERIES.TABLE.HAS_EVENTS")}</th>
									</tr>
								</thead>
								<tbody>
									{/* Repeat for each marked series */}
									{selectedSeries.map((series, key) => (
										<tr
											key={key}
											className={cn({
												error:
													!deleteWithSeriesAllowed &&
													series.selected &&
													series.hasEvents,
											})}
										>
											<td>
												<input
													type="checkbox"
													name="selection"
													checked={series.selected}
													onChange={e => onChangeSelected(e, isSeries(series) ? series.id : "")}
													className="child-cbox"
												/>
											</td>
											<td>{isSeries(series) && series.title}</td>
											<td>
												{/* Repeat for each creator*/}
												{isSeries(series) && series.organizers.map((organizer, key) => (
													<span className="metadata-entry" key={key}>
														{organizer}
													</span>
												))}
											</td>
											{/* Only show check if row has events, else empty cell*/}
											<td>
												{series.hasEvents && <LuCheck className={cn("checkmark", { active: true })} />}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</ModalContent>

			<NavigationButtons
				isLast
				isSubmitDisabled={!checkValidity()}
				submitClassName="danger"
				nextPage={deleteSelectedSeries}
				previousPage={close}
				nextTranslationString="BULK_ACTIONS.DELETE.SERIES.BUTTON"
				previousTranslationString="CANCEL"
			/>
		</>
	);
};

export default DeleteSeriesModal;
