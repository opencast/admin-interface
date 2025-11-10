import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Notifications from "../../../shared/Notifications";
import cn from "classnames";
import { getSelectedRows } from "../../../../selectors/tableSelectors";
import { useSelectionChanges } from "../../../../hooks/wizardHooks";
import {
	checkValidityStartTaskEventSelection,
	isStartable,
	isTaskStartable,
} from "../../../../utils/bulkActionUtils";
import { FormikProps } from "formik";
import {
	Event,
} from "../../../../slices/eventSlice";
import { useAppSelector } from "../../../../store";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { ParseKeys } from "i18next";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component renders the table overview of selected events in start task bulk action
 */
interface RequiredFormProps {
	events: Event[],
}

const StartTaskGeneralPage = <T extends RequiredFormProps>({
	formik,
	nextPage,
}: {
	formik: FormikProps<T>,
	nextPage: (values: T) => void,
}) => {
	const { t } = useTranslation();

	const selectedRows = useAppSelector(state => getSelectedRows(state));

	const {
		selectedEvents,
		allChecked,
		onChangeSelected,
		onChangeAllSelected,
		// @ts-expect-error TS(7006):
	} = useSelectionChanges(formik, selectedRows);

	useEffect(() => {
		// Set field value for formik on mount, because initially all events are selected
		if (formik.values.events.length === 0) {
			formik.setFieldValue("events", selectedEvents);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<ModalContentTable>
				<div className="row">
					{/* Show only if task not startable */}
					{!isTaskStartable(selectedEvents) && (
						<div className="alert sticky warning">
							<p>{t("BULK_ACTIONS.SCHEDULE_TASK.GENERAL.CANNOTSTART")}</p>
						</div>
					)}
					<Notifications context="not_corner" />
				</div>
				<div className="full-col">
					<div className="obj tbl-list">
						<header>
							{t("BULK_ACTIONS.SCHEDULE_TASK.GENERAL.CAPTION")}
							<span className="header-value">
								{t("BULK_ACTIONS.SCHEDULE_TASK.GENERAL.SUMMARY", {
									count: selectedEvents.filter(e => e.selected === true)
										.length,
								})}
							</span>
						</header>
						<div className="obj-container">
							<table className="main-tbl">
								<thead>
									<tr>
										<th className="small">
											<input
												className="select-all-cbox"
												type="checkbox"
												checked={allChecked}
												onChange={e => onChangeAllSelected(e)}
											/>
										</th>
										<th>
											{t("EVENTS.EVENTS.TABLE.TITLE")}
										</th>
										<th className="nowrap">
											{t("EVENTS.EVENTS.TABLE.SERIES")}
										</th>
										<th className="nowrap">
											{t("EVENTS.EVENTS.TABLE.STATUS")}
										</th>
									</tr>
								</thead>
								<tbody>
									{/* Repeat for each event chosen */}
									{selectedEvents.map((event, key) => (
										<tr
											key={key}
											className={cn({ error: !isStartable(event) })}
										>
											<td className="small">
												<input
													name="events"
													type="checkbox"
													onChange={e => onChangeSelected(e, event.id)}
													checked={event.selected}
												/>
											</td>
											<td>{event.title}</td>
											<td>
												{event.series ? event.series.title : ""}
											</td>
											<td>{t(event.event_status as ParseKeys)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</ModalContentTable>

			{/* Button for navigation to next page and previous page */}
			<WizardNavigationButtons
				formik={formik}
				nextPage={nextPage}
				customValidation={!checkValidityStartTaskEventSelection(formik.values)}
				isFirst
			/>
		</>
	);
};

export default StartTaskGeneralPage;
