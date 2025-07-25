import { useTranslation } from "react-i18next";
import { getSeriesThemes } from "../../../../selectors/seriesSeletctor";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import DropDown from "../../../shared/DropDown";
import { useAppSelector } from "../../../../store";
import { FormikProps } from "formik";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component renders the theme page for new series in the new series wizard.
 */
interface RequiredFormProps {
	theme: string,
}

const NewThemePage = <T extends RequiredFormProps>({
	formik,
	nextPage,
	previousPage,
}: {
	formik: FormikProps<T>,
	nextPage: (values: T) => void,
	previousPage: (values: T, twoPagesBack?: boolean) => void,
}) => {
	const { t } = useTranslation();

	const seriesThemes = useAppSelector(state => getSeriesThemes(state));

	const getDescription = (id: string) => {
		const theme = seriesThemes.find(theme => theme.id === id);

		return theme?.description;
	};

	const getName = (id: string) => {
		const theme = seriesThemes.find(theme => theme.id === id);

		return theme?.name;
	};

	return (
		<>
			<ModalContentTable>
				<div className="obj quick-actions">
					<header className="no-expand">
						{t("EVENTS.SERIES.NEW.THEME.TITLE")}
					</header>
					<div className="obj-container padded">
						<ul>
							<li>
								<p>{t("EVENTS.SERIES.NEW.THEME.DESCRIPTION.TEXT")}</p>
								{seriesThemes.length > 0 ? (
									<>
										<p>
											<div className="editable">
												<DropDown
													value={formik.values.theme}
													text={
														getName(formik.values.theme) ?? ""
													}
													options={seriesThemes.map(theme => ({ label: theme.name, value: theme.id }))}
													required={false}
													handleChange={element => {
														if (element) {
															formik.setFieldValue("theme", element.value);
														}
													}}
													placeholder={t("EVENTS.SERIES.NEW.THEME.LABEL")}
													customCSS={{ width: "100%" }}
												/>
											</div>
										</p>
										{!!formik.values.theme && (
											<p>{getDescription(formik.values.theme)}</p>
										)}
									</>
								) : (
									<p>{t("EVENTS.SERIES.NEW.THEME.EMPTY")}</p>
								)}
							</li>
						</ul>
					</div>
				</div>
			</ModalContentTable>

			{/* Button for navigation to next page and previous page */}
			<WizardNavigationButtons
				formik={formik}
				nextPage={nextPage}
				previousPage={previousPage}
			/>
		</>
	);
};

export default NewThemePage;
