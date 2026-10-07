import { useTranslation } from "react-i18next";
import AccessSummaryTable from "./summaryTables/AccessSummaryTable";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { FormikProps } from "formik";
import { renderValidDate } from "../../../../utils/dateUtils";
import { initialFormValuesNewLifeCyclePolicy } from "../../../../configs/modalConfig";

/**
 * This component renders the summary page for new series in the new series wizard.
 */
// interface RequiredFormProps {

// }

const NewLifeCyclePolicySummary = <T extends typeof initialFormValuesNewLifeCyclePolicy>({
	formik,
	previousPage,
}: {
	formik: FormikProps<T>,
	previousPage: (values: T, twoPagesBack?: boolean) => void,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<div className="modal-content">
				<div className="modal-body">
					<div className="full-col">

						<div className="obj tbl-list">
							<header className="no-expand">{t("LIFECYCLE.POLICIES.NEW.CAPTION")}</header>
							<div className="obj-container">
								<table className="main-tbl">
									<tbody>
										<tr>
											<td>{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.TITLE")}</td>
											<td>{formik.values.title}</td>
										</tr>
										<tr>
											<td>{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.ISACTIVE")}</td>
											<td><input type="checkbox" disabled checked={formik.values.isActive} /></td>
										</tr>
										<tr>
											<td>{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.TARGETTYPE")}</td>
											<td>{formik.values.targetType}</td>
										</tr>
										<tr>
											<td>{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.TIMING")}</td>
											<td>{formik.values.timing}</td>
										</tr>
										<tr>
											<td>{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.ACTION")}</td>
											<td>{formik.values.action}</td>
										</tr>
										<tr>
											<td>{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.ACTIONDATE")}</td>
											<td>{t("dateFormats.dateTime.medium", { dateTime: renderValidDate(formik.values.actionDate) })}</td>
										</tr>
										<tr>
											<td>{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.CRONTRIGGER")}</td>
											<td>{formik.values.cronTrigger}</td>
										</tr>
										<tr>
											<td>{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.TARGETFILTERS.CAPTION")}</td>
											<td>
												{Object.entries(formik.values.targetFiltersTransformed)
													.filter(([outerKey]) => outerKey === "dublincore/episode")
													.map(([_outerKey, filters]) => (
														filters.map((filter, key) => (
															<tr key={key}>
																<td>{filter.filter}</td>
																<td>{filter.value.toString()}</td>
																<td>{filter.type}</td>
																<td>{filter.must.toString()}</td>
															</tr>
														))
												))}
											</td>
										</tr>
										<tr>
											<td>{t("LIFECYCLE.POLICIES.DETAILS.GENERAL.ACTIONPARAMETERS.CAPTION")}</td>
											<td>
												{formik.values.action === "START_WORKFLOW" &&
													<tr>
														{/*  @ts-expect-error: Potentially unknown */}
														<td>{formik.values.actionParameters.workflowId}</td>
														<td>
															{/*  @ts-expect-error: Potentially unknown */}
															{Object.entries(formik.values.actionParameters.workflowParameters).map(([key, value]) => (
																<tr key={key}>
																	<td>{key}</td>
																	<td>{String(value)}</td>
																</tr>
															))}
														</td>
													</tr>
													}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
						{/* Summary access configuration */}
						<AccessSummaryTable
							policies={formik.values.policies}
							header={"EVENTS.SERIES.NEW.ACCESS.CAPTION"}
						/>

					</div>
				</div>
			</div>

			{/* Button for navigation to next page and previous page */}
			<WizardNavigationButtons
				isLast
				previousPage={previousPage}
				formik={formik}
			/>
		</>
	);
};

export default NewLifeCyclePolicySummary;
