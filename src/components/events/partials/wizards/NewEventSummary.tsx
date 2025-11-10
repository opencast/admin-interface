import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
	getAssetUploadOptions,
	getEventMetadata,
	getExtendedEventMetadata,
} from "../../../../selectors/eventSelectors";
import { getWorkflowDef } from "../../../../selectors/workflowSelectors";
import MetadataSummaryTable from "./summaryTables/MetadataSummaryTable";
import AccessSummaryTable from "./summaryTables/AccessSummaryTable";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { translateOverrideFallback } from "../../../../utils/utils";
import { useAppSelector } from "../../../../store";
import { FormikProps } from "formik";
import { TransformedAcl } from "../../../../slices/aclDetailsSlice";
import { renderValidDate } from "../../../../utils/dateUtils";
import { ParseKeys } from "i18next";
import ModalContentTable from "../../../shared/modals/ModalContentTable";
import { UploadAssetsTrack } from "../../../../slices/eventSlice";

/**
 * This component renders the summary page for new events in the new event wizard.
 */
interface RequiredFormProps {
	processingWorkflow: string
	sourceMode: string
	startDate?: string
	location: string
	scheduleStartDate: string
	scheduleEndDate: string
	scheduleStartHour: string
	scheduleEndHour: string
	scheduleStartMinute: string
	scheduleEndMinute: string
	scheduleDurationHours: string
	scheduleDurationMinutes: string
	repeatOn: ("MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU")[]
	deviceInputs?: string[]
	configuration: { [key: string]: string }
	policies: TransformedAcl[]
	uploadAssetsTrack?: UploadAssetsTrack[]
	[key: string]: unknown,  // Metadata fields
}

const NewEventSummary = <T extends RequiredFormProps>({
	formik,
	previousPage,
	metaDataExtendedHidden,
	assetUploadHidden,
}: {
	formik: FormikProps<T>,
	previousPage: (values: T, twoPagesBack?: boolean) => void,
	metaDataExtendedHidden: boolean,
	assetUploadHidden: boolean,
}) => {
	const { t } = useTranslation();

	// upload asset that user has provided
	const [uploadAssetsNonTrack, setUploadAssetsNonTrack] = useState<{
		name: string,
		translate?: string,
		value: File,
	}[]>([]);

	const uploadAssetOptions = useAppSelector(state => getAssetUploadOptions(state));
	const metadataEvents = useAppSelector(state => getEventMetadata(state));
	const extendedMetadata = useAppSelector(state => getExtendedEventMetadata(state));
	const workflowDef = useAppSelector(state => getWorkflowDef(state));

	// upload asset that user has provided
	useEffect(() => {
		const uploadAssetsNonTrack: {
			name: string,
			translate?: string,
			value: File,
		}[] = [];
		for (let i = 0; uploadAssetOptions.length > i; i++) {
			const fieldValue = formik.values[uploadAssetOptions[i].id] as File;
			if (fieldValue) {
				const displayOverride = uploadAssetOptions[i].displayOverride as ParseKeys;
				setUploadAssetsNonTrack(uploadAssetsNonTrack.concat({
					name: uploadAssetOptions[i].id,
					translate: displayOverride
						? t(displayOverride)
						: translateOverrideFallback(uploadAssetOptions[i], t),
					value: fieldValue,
				}));
			}
		}
	}, [formik.values, t, uploadAssetsNonTrack, uploadAssetOptions]);


	// Get additional information about chosen workflow definition
	const workflowDefinition = workflowDef.find(
		workflow => workflow.id === formik.values.processingWorkflow,
	);

	const endsOnSameDay = formik.values.scheduleStartDate === formik.values.scheduleEndDate;

	return (
		<>
			<ModalContentTable>
				{/* Summary metadata*/}
				<MetadataSummaryTable
					metadataCatalogs={[metadataEvents]}
					// @ts-expect-error: Metadata not correctly typed
					formikValues={formik.values}
					header={"EVENTS.EVENTS.NEW.METADATA.CAPTION"}
				/>

				{/* Summary metadata extended*/}
				{!metaDataExtendedHidden && (
					<MetadataSummaryTable
						metadataCatalogs={extendedMetadata}
						// @ts-expect-error: Metadata not correctly typed
						formikValues={formik.values}
						header={"EVENTS.EVENTS.NEW.METADATA_EXTENDED.CAPTION"}
					/>
				)}

				{/* Summary upload assets*/}
				{/* Show only if asset upload page is not hidden, the sourceMode is UPLOAD and the there
										are actually upload assets provided by the user*/}
				{!assetUploadHidden &&
				formik.values.sourceMode === "UPLOAD" &&
				uploadAssetsNonTrack.length > 0 ? (
					<div className="obj tbl-list">
						<header>
							{t("EVENTS.EVENTS.NEW.UPLOAD_ASSET.CAPTION")}
						</header>
						<div className="obj-container">
							<table className="main-tbl">
								<tbody>
									{/* Insert row for each upload asset user has provided*/}
									{uploadAssetsNonTrack.map((asset, key) => (
										<tr key={key}>
											<td>
												{asset.translate}
											</td>
											<td>{asset.value.name}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				) : null}

				{/* Summary source */}
				<div className="obj tbl-list">
					<header>
						{t("EVENTS.EVENTS.NEW.SOURCE.CAPTION")}
					</header>
					<div className="obj-container">
						{/* Summary source mode UPLOAD*/}
						{formik.values.sourceMode === "UPLOAD" && (
							<table className="main-tbl">
								<tbody>
									{/* Insert row for each upload asset of type track user has provided */}
									{formik.values.uploadAssetsTrack && formik.values.uploadAssetsTrack.map((asset, key) =>
										asset.file ? (
											<tr key={key}>
												<td>
													{translateOverrideFallback(asset, t, "SHORT")}
												</td>
												<td>{asset.file[0].name}</td>
											</tr>
										) : null,
									)}
									{!!formik.values.startDate && (
									<tr>
										<td>
											{t("EVENTS.EVENTS.NEW.SOURCE.DATE_TIME.START_DATE")}
										</td>
										<td>
											{t("dateFormats.dateTime.short", {
												dateTime: renderValidDate(formik.values.startDate),
											})}
										</td>
									</tr>
									)}
								</tbody>
							</table>
						)}
						{/* Summary source mode SCHEDULE-SINGLE/SCHEDULE-MULTIPLE*/}
						{(formik.values.sourceMode === "SCHEDULE_SINGLE" ||
							formik.values.sourceMode === "SCHEDULE_MULTIPLE") && (
							<table className="main-tbl">
								<tbody>
									<tr>
										<td>
											{t("EVENTS.EVENTS.NEW.SOURCE.DATE_TIME.START_DATE")}
										</td>
										<td>
											{t("dateFormats.date.short", {
												date: renderValidDate(formik.values.scheduleStartDate),
											})}
										</td>
									</tr>
									<tr>
										<td>
											{t("EVENTS.EVENTS.NEW.SOURCE.DATE_TIME.START_TIME")}
										</td>
										<td>
											{formik.values.scheduleStartHour}:
											{formik.values.scheduleStartMinute}
										</td>
									</tr>
									{(!endsOnSameDay || formik.values.sourceMode === "SCHEDULE_MULTIPLE") && (
										<tr>
											<td>
												{t("EVENTS.EVENTS.NEW.SOURCE.DATE_TIME.END_DATE")}
											</td>
											<td>
												{t("dateFormats.date.short", {
													date: renderValidDate(formik.values.scheduleEndDate),
												})}
											</td>
										</tr>
									)}
									<tr>
										<td>
											{t("EVENTS.EVENTS.NEW.SOURCE.DATE_TIME.END_TIME")}
										</td>
										<td>
											{formik.values.scheduleEndHour}:
											{formik.values.scheduleEndMinute}
										</td>
									</tr>
									{formik.values.sourceMode === "SCHEDULE_MULTIPLE" && (
										<tr>
											<td>
												{t(
													"EVENTS.EVENTS.NEW.SOURCE.SCHEDULE_MULTIPLE.WEEKDAYS",
												)}
											</td>
											<td>
												{formik.values.repeatOn
													.map(day =>
														t(`EVENTS.EVENTS.NEW.WEEKDAYSLONG.${day}`),
													)
													.join(", ")}
											</td>
										</tr>
									)}
									<tr>
										<td>
											{t("EVENTS.EVENTS.NEW.SOURCE.DATE_TIME.DURATION")}
										</td>
										<td>
											{formik.values.scheduleDurationHours}:
											{formik.values.scheduleDurationMinutes}
										</td>
									</tr>
									<tr>
										<td>
											{t("EVENTS.EVENTS.NEW.SOURCE.PLACEHOLDER.LOCATION")}
										</td>
										<td>{formik.values.location}</td>
									</tr>
									{!!formik.values.deviceInputs && (
										<tr>
											<td>{t("EVENTS.EVENTS.NEW.SUMMARY.SOURCE.INPUT")}</td>
											<td>{formik.values.deviceInputs.join(", ")}</td>
										</tr>
									)}
								</tbody>
							</table>
						)}
					</div>
				</div>

				{/* Summary processing configuration */}
				<div className="obj tbl-list">
					<header>
						{t("EVENTS.EVENTS.NEW.PROCESSING.CAPTION")}
					</header>
					<table className="main-tbl">
						<tbody>
							<tr>
								<td>{t("EVENTS.EVENTS.NEW.PROCESSING.WORKFLOW")}</td>
								<td>
									{workflowDefinition ? workflowDefinition.title : ""}
								</td>
							</tr>
							{/* Repeat entry for each configuration key/value pair */}
							{Object.keys(formik.values.configuration).map(
								(config, key) => (
									<tr key={key}>
										<td>{config}</td>
										<td>
											{formik.values.configuration[config].toString()}
										</td>
									</tr>
								),
							)}
						</tbody>
					</table>
				</div>

				{/* Summary access configuration*/}
				<AccessSummaryTable
					policies={formik.values.policies}
					header={"EVENTS.EVENTS.NEW.ACCESS.CAPTION"}
				/>
			</ModalContentTable>

			{/* Button for navigation to next page and previous page */}
			<WizardNavigationButtons
				isLast
				previousPage={previousPage}
				formik={formik}
			/>
		</>
	);
};

export default NewEventSummary;
