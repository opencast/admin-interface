import React from "react";
import { useTranslation } from "react-i18next";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { getAssetUploadOptions } from "../../../../selectors/eventSelectors";
import { translateOverrideFallback } from "../../../../utils/utils";
import { useAppSelector } from "../../../../store";
import { FormikProps } from "formik";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import ModalContentTable from "../../../shared/modals/ModalContentTable";

/**
 * This component renders the asset upload page of the new event wizard
 * (only if its not set hidden (see newEventWizardConfig) or user chose UPLOAD as source mode)
 */
interface RequiredFormProps {
	sourceMode: string,
	[key: string]: unknown,
}

const NewAssetUploadPage = <T extends RequiredFormProps>({
	formik,
	nextPage,
	previousPage,
}: {
	formik: FormikProps<T>,
	nextPage: (values: T) => void,
	previousPage: (values: T, twoPagesBack?: boolean) => void,
}) => {
	const { t } = useTranslation();

	const uploadAssetOptions = useAppSelector(state => getAssetUploadOptions(state));

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>, assetId: string) => {
		if (e.target.files) {
			if (e.target.files.length === 0) {
				formik.setFieldValue(assetId, null);
			} else {
				formik.setFieldValue(assetId, e.target.files[0]);
			}
		} else {
			console.warn("File event did not contain any files");
		}
	};

	return (
		<>
			<ModalContentTable>
				<div className="obj tbl-details">
					<header>{t("EVENTS.EVENTS.NEW.UPLOAD_ASSET.SELECT_TYPE")}</header>
					<div className="obj-container">
						<table className="main-tbl">
							<tbody>
								{uploadAssetOptions.length === 0 ? (
									<tr>
										<td>
											{t("EVENTS.EVENTS.NEW.UPLOAD_ASSET.NO_OPTIONS")}
										</td>
									</tr>
								) : (
									uploadAssetOptions.map((asset, key) => (
										<tr key={key}>
											<td>
												{" "}
												{translateOverrideFallback(asset, t)}
											</td>
											<td>
												<div className="file-upload">
													<input
														id={asset.id}
														className="blue-btn file-select-btn"
														accept={asset.accept}
														onChange={e => handleChange(e, asset.id)}
														type="file"
														tabIndex={0}
													/>
													{(() => {
														const val = formik.values[asset.id];
														if (val instanceof File) {
															return (
																<span className="ui-helper">
																	{val.name.substring(0, 50)}
																</span>
															);
														}
														return null;
													})()}
												</div>
											</td>
											{/* Button to remove asset*/}
											<td className="fit">
												<ButtonLikeAnchor
													extraClassName="remove"
													onClick={() => {
														formik.setFieldValue(asset.id, null);
														(document.getElementById(asset.id) as HTMLInputElement).value = "";
													}}
												/>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</ModalContentTable>

			{/* Button for navigation to next page */}
			<WizardNavigationButtons
				noValidation
				nextPage={nextPage}
				previousPage={previousPage}
				formik={formik}
			/>
		</>
	);
};


export default NewAssetUploadPage;
