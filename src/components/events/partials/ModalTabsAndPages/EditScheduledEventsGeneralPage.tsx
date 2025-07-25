import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { getSelectedRows } from "../../../../selectors/tableSelectors";
import { useSelectionChanges } from "../../../../hooks/wizardHooks";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import {
	checkValidityUpdateScheduleEventSelection,
	isAgentAccess,
	isAllAgentAccess,
	isAllScheduleEditable,
	isScheduleEditable,
} from "../../../../utils/bulkActionUtils";
import { useAppSelector } from "../../../../store";
import { FormikProps } from "formik";
import { Event } from "../../../../slices/eventSlice";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { ParseKeys } from "i18next";
import ModalContent from "../../../shared/modals/ModalContent";

/**
 * This component renders the table overview of selected events in edit scheduled events bulk action
 */
interface RequiredFormProps {
	events: Event[],
}

const EditScheduledEventsGeneralPage = <T extends RequiredFormProps>({
	nextPage,
	formik,
}: {
	formik: FormikProps<T>,
	nextPage: (values: T) => void,
}) => {
	const { t } = useTranslation();

	const selectedRows = useAppSelector(state => getSelectedRows(state));
	const user = useAppSelector(state => getUserInformation(state));

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
			<ModalContent modalContentClassName="modal-content active">
				<div className="row">
					{/* Show only if non-scheduled event is selected*/}
					{!isAllScheduleEditable(selectedEvents) && (
						<div className="alert sticky warning">
							<p>{t("BULK_ACTIONS.EDIT_EVENTS.GENERAL.CANNOTSTART")}</p>
						</div>
					)}
					{/* Show only if user doesn't have access to all agents*/}
					{!isAllAgentAccess(selectedEvents, user) && (
						<div className="alert sticky info">
							<p>
								{t("BULK_ACTIONS.EDIT_EVENTS.GENERAL.CANNOTEDITSCHEDULE")}
							</p>
						</div>
					)}
				</div>
				<div className="full-col">
					<div className="obj tbl-list">
						<header>{t("BULK_ACTIONS.EDIT_EVENTS.GENERAL.CAPTION")}</header>
						<div className="obj-container">
							<table className="main-tbl">
								<thead>
									<tr>
										<th className="small">
											<input
												type="checkbox"
												className="select-all-cbox"
												checked={allChecked}
												onChange={e => onChangeAllSelected(e)}
											/>
										</th>
										<th className="full-width">
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
									{/* Repeat for each selected event */}
									{selectedEvents.map((event, key) => (
										<tr
											key={key}
											className={cn(
												{ error: !isScheduleEditable(event) },
												{ info: !isAgentAccess(event, user) },
											)}
										>
											<td>
												<input
													type="checkbox"
													name="events"
													onChange={e => onChangeSelected(e, event.id)}
													checked={event.selected}
												/>
											</td>
											<td>{event.title}</td>
											<td className="nowrap">
												{event.series ? event.series.title : ""}
											</td>
											<td className="nowrap">{t(event.event_status as ParseKeys)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</ModalContent>

			{/* Button for navigation to next page */}
			<WizardNavigationButtons
				formik={formik}
				nextPage={nextPage}
				customValidation={
					!checkValidityUpdateScheduleEventSelection(
						formik.values,
						user,
					)
				}
				isFirst
			/>
		</>
	);
};

export default EditScheduledEventsGeneralPage;
