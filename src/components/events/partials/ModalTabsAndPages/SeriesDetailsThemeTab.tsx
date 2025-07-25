import { useTranslation } from "react-i18next";
import { Formik, FormikProps } from "formik";
import _ from "lodash";
import Notifications from "../../../shared/Notifications";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import { hasAccess } from "../../../../utils/utils";
import DropDown from "../../../shared/DropDown";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { updateSeriesTheme } from "../../../../slices/seriesDetailsSlice";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

type SeriesTheme = { id: string; value: string; };

/**
 * This component renders the tab for editing the theme of a certain series
 */
const SeriesDetailsThemeTab = ({
	theme,
	themeNames,
	seriesId,
}: {
	theme: SeriesTheme | null,
	themeNames: SeriesTheme[],
	seriesId: string
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const user = useAppSelector(state => getUserInformation(state));

	const handleSubmit = (values: { theme: SeriesTheme | null }) => {
		dispatch(updateSeriesTheme({ id: seriesId, values: values }));
	};

	const checkValidity = (formik: FormikProps<{theme: SeriesTheme | null }>) => {
		if (formik.dirty && formik.isValid) {
			// check if user provided values differ from initial ones
			return !_.isEqual(formik.values, formik.initialValues);
		} else {
			return false;
		}
	};

	return (
		<Formik
			enableReinitialize
			initialValues={{ theme: theme }}
			onSubmit={values => handleSubmit(values)}
		>
			{formik => (
				<>
					<ModalContentTable>
						{/* Notifications */}
						<Notifications context="not_corner" />
						<div className="obj quick-actions">
							<header>{t("CONFIGURATION.NAVIGATION.THEMES")}</header>
							<div className="obj-container padded">
								<ul>
									<li>
										<p>{t("EVENTS.SERIES.NEW.THEME.DESCRIPTION.TEXT")}</p>
										{themeNames.length > 0 && (
											<div className="editable">
												<DropDown
													value={formik.values.theme?.id}
													text={formik.values.theme?.value || ""}
													options={themeNames.map(names => ({ label: names.value, value: names.id }))}
													required={false}
													handleChange={element => {
														if (element) {
															formik.setFieldValue("theme", { id: element.value, value: element.label });
														}
													}}
													placeholder={t("EVENTS.SERIES.NEW.THEME.LABEL")}
													disabled={
														!hasAccess(
															"ROLE_UI_SERIES_DETAILS_THEMES_EDIT",
															user,
														)
													}
													customCSS={{ width: "100%" }}
												/>
											</div>
										)}
									</li>
								</ul>
							</div>
							{formik.dirty && (
								<>
									{/* Render buttons for updating theme */}
									<WizardNavigationButtons
										formik={formik}
										customValidation={!checkValidity(formik)}
										previousPage={() => formik.resetForm()}
										createTranslationString="SAVE"
										cancelTranslationString="CANCEL"
										isLast
									/>
								</>
							)}
						</div>
					</ModalContentTable>
				</>
			)}
		</Formik>
	);
};

export default SeriesDetailsThemeTab;
