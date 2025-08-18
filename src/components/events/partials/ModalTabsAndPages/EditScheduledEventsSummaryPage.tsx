import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { getMetadataCollectionFieldName } from "../../../../utils/resourceUtils";
import { getSchedulingSeriesOptions } from "../../../../selectors/eventSelectors";
import { useAppSelector } from "../../../../store";
import { FormikProps } from "formik";
import { EditedEvents } from "../../../../slices/eventSlice";
import { ParseKeys } from "i18next";
import ModalContent from "../../../shared/modals/ModalContent";
import { LuTriangleAlert } from "react-icons/lu";

/**
 * This component renders the summary page of the edit scheduled bulk action
 */
interface RequiredFormProps {
	editedEvents: EditedEvents[],
	changedEvents: string[],
}

type Change = {
	eventId: string,
	title: string,
	changes: {
		type: ParseKeys,
		previous: string,
		next: string
	}[]
}

const EditScheduledEventsSummaryPage = <T extends RequiredFormProps>({
	previousPage,
	formik,
} : {
	previousPage: (values: T) => void,
	formik: FormikProps<T>,
}) => {
	const { t } = useTranslation();

	// Changes applied to events
	const [changes, setChanges] = useState<Change[]>([]);

	const seriesOptions = useAppSelector(state => getSchedulingSeriesOptions(state));

	useEffect(() => {
		// Check on mount if changes on events where applied on page before
		checkForChanges();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const checkForChanges = () => {
		const changed: Change[] = [];

		// Loop through each event selected for editing and compare original values and changed values
		for (const event of formik.values.editedEvents) {
			const eventChanges: Change = {
				eventId: event.eventId,
				title: event.title,
				changes: [],
			};
			if (isChanged(event.title, event.changedTitle)) {
				eventChanges.changes.push({
					type: "EVENTS.EVENTS.DETAILS.METADATA.TITLE",
					previous: event.title,
					next: event.changedTitle,
				});
			}
			if (isChanged(event.series, event.changedSeries)) {
				eventChanges.changes.push({
					type: "EVENTS.EVENTS.DETAILS.METADATA.SERIES",
					previous: getMetadataCollectionFieldName(
						{ collection: seriesOptions },
						{ value: event.series },
						t,
					),
					next: getMetadataCollectionFieldName(
						{ collection: seriesOptions },
						{ value: event.changedSeries },
						t,
					),
				});
			}
			if (
				isChanged(
					event.startTimeHour + ":" + event.startTimeMinutes,
					event.changedStartTimeHour + ":" + event.changedStartTimeMinutes,
				)
			) {
				eventChanges.changes.push({
					type: "EVENTS.EVENTS.TABLE.START",
					previous: event.startTimeHour + ":" + event.startTimeMinutes,
					next:
						event.changedStartTimeHour + ":" + event.changedStartTimeMinutes,
				});
			}
			if (
				isChanged(
					event.endTimeHour + ":" + event.endTimeMinutes,
					event.changedEndTimeHour + ":" + event.changedEndTimeMinutes,
				)
			) {
				eventChanges.changes.push({
					type: "EVENTS.EVENTS.TABLE.END",
					previous: event.endTimeHour + ":" + event.endTimeMinutes,
					next: event.changedEndTimeHour + ":" + event.changedEndTimeMinutes,
				});
			}
			if (isChanged(event.location, event.changedLocation)) {
				eventChanges.changes.push({
					type: "EVENTS.EVENTS.TABLE.LOCATION",
					previous: event.location,
					next: event.changedLocation,
				});
			}
			/* the following six lines can be commented in, when the possibility of a selection of individual inputs is desired and the backend has been adapted to support it
            if (isArrayChanged(event.deviceInputs.split(','), event.changedDeviceInputs)){
                eventChanges.changes.push({
                    type: 'EVENTS.EVENTS.DETAILS.SOURCE.PLACEHOLDER.INPUTS',
                    previous: event.deviceInputs,
                    next: event.changedDeviceInputs.join(',')
                });
            }*/
			if (isChanged(event.weekday, event.changedWeekday)) {
				eventChanges.changes.push({
					type: "EVENTS.EVENTS.TABLE.WEEKDAY",
					previous: t(`EVENTS.EVENTS.NEW.WEEKDAYSLONG.${event.weekday}`),
					next: t(`EVENTS.EVENTS.NEW.WEEKDAYSLONG.${event.changedWeekday}`),
				});
			}

			// If there were changes push them to changed array
			if (eventChanges.changes.length > 0) {
				changed.push(eventChanges);
				// Keep ids of changed events (used later)
				formik.setFieldValue(
					"changedEvent",
					formik.values.changedEvents.push(event.eventId),
				);
			}
		}

		// Set changes state
		setChanges(changed);
	};

	// Compare two values
	const isChanged = (oldValue: string, newValue: string) => {
		return oldValue !== newValue;
	};

	return (
		<>
			<ModalContent modalContentClassName="modal-content active">
				{changes.length > 0 ? (
					<div className="full-col">
						{/* Repeat for each changed event*/}
						{changes.map((event, key) => (
							<div key={key} className="obj tbl-list">
								<header>
									{t(
										"BULK_ACTIONS.EDIT_EVENTS.SUMMARY.SINGLE_EVENT_CAPTION",
										{ title: event.title },
									)}
								</header>
								<div className="obj-container">
									<table className="main-tbl">
										<thead>
											<tr>
												<th className="fit">
													{t("BULK_ACTIONS.EDIT_EVENTS.SUMMARY.TYPE")}
												</th>
												<th className="fit">
													{t("BULK_ACTIONS.EDIT_EVENTS.SUMMARY.PREVIOUS")}
												</th>
												<th className="fit">
													{t("BULK_ACTIONS.EDIT_EVENTS.SUMMARY.NEXT")}
												</th>
											</tr>
										</thead>
										<tbody>
											{/* Add table row with old value and new one if something has changed */}
											{event.changes.map((row, key) => (
												<tr key={key}>
													<td>{t(row.type)}</td>
													<td>{row.previous}</td>
													<td className="highlighted-cell">{row.next}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="row">
						{/* Show only if there no changes*/}
						<div className="alert sticky warning">
							<LuTriangleAlert className="warning-symbol-warning"/>
							<p>{t("BULK_ACTIONS.EDIT_EVENTS.GENERAL.NOCHANGES")}</p>
						</div>
					</div>
				)}
			</ModalContent>

			{/* Navigation buttons */}
			<WizardNavigationButtons
				isLast
				formik={formik}
				previousPage={previousPage}
			/>
		</>
	);
};

export default EditScheduledEventsSummaryPage;
