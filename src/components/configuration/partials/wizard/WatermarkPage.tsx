import { useTranslation } from "react-i18next";
import cn from "classnames";
import { FormikProps } from "formik";
import { Field } from "../../../shared/Field";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import FileUpload from "../../../shared/wizard/FileUpload";
import Notifications from "../../../shared/Notifications";
import ModalContentTable from "../../../shared/modals/ModalContentTable";
import BaseButton from "../../../shared/BaseButton";

/**
 * This component renders the watermark page for new themes in the new themes wizard
 * and for themes in themes details modal.
 */
interface RequiredFormProps {
	watermarkActive: boolean,
	watermarkFile: string,
	watermarkPosition: string,
	[key: string]: unknown,
}

const WatermarkPage = <T extends RequiredFormProps>({
	formik,
	nextPage,
	previousPage,
	isEdit,
}: {
	formik: FormikProps<T>,
	nextPage?: (values: T) => void,
	previousPage?: (values: T) => void,
	isEdit?: boolean,
}) => {
	const { t } = useTranslation();

	const handleButtonClick = (position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight") => {
		formik.setFieldValue("watermarkPosition", position);
	};

	return (
		<>
			<ModalContentTable>
				<p>{t("CONFIGURATION.THEMES.DETAILS.WATERMARK.DESCRIPTION")}</p>
				<Notifications context="not_corner" />
				<div className="obj">
					<header>
						{t("CONFIGURATION.THEMES.DETAILS.WATERMARK.CAPTION")}
					</header>
					<div className="obj-container content-list padded">
						<div className="list-row">
							<div className="header-column">
								<label className="large">
									{t("CONFIGURATION.THEMES.DETAILS.WATERMARK.ENABLE")}
								</label>
							</div>
							{/* Checkbox for activating watermark */}
							<div className="content-column">
								<div className="content-container">
									<Field
										id="watermark-toggle"
										type="checkbox"
										name="watermarkActive"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* if checkbox is checked, then render object for uploading files */}
				{formik.values.watermarkActive && (
					<>
						<div className="obj">
							<header>
								{t("CONFIGURATION.THEMES.DETAILS.WATERMARK.UPLOAD")}
							</header>
							<div className="obj-container padded">
								<FileUpload
									acceptableTypes="image/*"
									fileId="watermarkFile"
									fileName="watermarkFileName"
									formik={formik}
									buttonKey="CONFIGURATION.THEMES.DETAILS.WATERMARK.UPLOAD_BUTTON"
									labelKey="CONFIGURATION.THEMES.DETAILS.WATERMARK.UPLOAD_LABEL"
									descriptionKey="CONFIGURATION.THEMES.DETAILS.WATERMARK.FILEUPLOAD_DESCRIPTION"
									isEdit={isEdit}
								/>
							</div>
						</div>

						{/* if file uploaded, then render buttons for choice of position*/}
						{formik.values.watermarkFile && (
							<div className="obj">
								<header>
									{t("CONFIGURATION.THEMES.DETAILS.WATERMARK.POSITION")}
								</header>
								<div className="obj-container padded">
									<div className="video-container">
										<div>
											<div className="position-selection">
												<BaseButton
													className={cn(
														"position-button position-top-left",
														{
															active:
																formik.values.watermarkPosition ===
																"topLeft",
														},
													)}
													onClick={() => handleButtonClick("topLeft")}
												>
													{t(
														"CONFIGURATION.THEMES.DETAILS.WATERMARK.TOP_LEFT",
													)}
												</BaseButton>
												<BaseButton
													className={cn(
														"position-button position-top-right",
														{
															active:
																formik.values.watermarkPosition ===
																"topRight",
														},
													)}
													onClick={() => handleButtonClick("topRight")}
												>
													{t(
														"CONFIGURATION.THEMES.DETAILS.WATERMARK.TOP_RIGHT",
													)}
												</BaseButton>
												<BaseButton
													className={cn(
														"position-button position-bottom-left",
														{
															active:
																formik.values.watermarkPosition ===
																"bottomLeft",
														},
													)}
													onClick={() => handleButtonClick("bottomLeft")}
												>
													{t(
														"CONFIGURATION.THEMES.DETAILS.WATERMARK.BOTTOM_LEFT",
													)}
												</BaseButton>
												<BaseButton
													className={cn(
														"position-button position-bottom-right",
														{
															active:
																formik.values.watermarkPosition ===
																"bottomRight",
														},
													)}
													onClick={() => handleButtonClick("bottomRight")}
												>
													{t(
														"CONFIGURATION.THEMES.DETAILS.WATERMARK.BOTTOM_RIGHT",
													)}
												</BaseButton>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}
					</>
				)}
			</ModalContentTable>
			{/* Show navigation buttons only if page is used for a new theme*/}
			{!isEdit && (
				// Button for navigation to next page
				<WizardNavigationButtons
					formik={formik}
					previousPage={previousPage}
					nextPage={nextPage}
				/>
			)}
		</>
	);
};

export default WatermarkPage;
