import { useTranslation } from "react-i18next";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { NOTIFICATION_CONTEXT } from "../../../configs/modalConfig";
import { useAppDispatch } from "../../../store";
import { addNotification } from "../../../slices/notificationSlice";
import { FormikProps } from "formik";
import { ParseKeys } from "i18next";

/**
 * This component renders a custom file upload button in wizards.
 */
interface RequiredFormProps {
	[key: string]: unknown,
}

const FileUpload = <T extends RequiredFormProps>({
	descriptionKey,
	labelKey,
	buttonKey,
	acceptableTypes,
	fileId,
	fileName,
	formik,
	isEdit,
}: {
	descriptionKey?: ParseKeys,
	labelKey: ParseKeys,
	buttonKey: ParseKeys,
	acceptableTypes: string,
	fileId: string,
	fileName: string,
	formik: FormikProps<T>,
	isEdit?: boolean,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	// Temporary storage for uploaded file
	const [file, setFile] = useState<File | undefined>();
	// how much is uploaded; used for progress bar
	const [loaded, setLoaded] = useState(0);

	// reference used for activating file input when button is clicked
	const hiddenFileInput = useRef<HTMLInputElement>(null);

	// Trigger formik validation
	// Setting formik fields in a promise callback does not trigger formik
	// validation (or at the very least, does not trigger it with the new
	// values). Therefore, this useEffect gets manually triggered, causing an
	// additional rerender which then triggers formik validation.
	useEffect(() => {
		formik.validateForm();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formik.values.fileId, formik.values.fileName, loaded]);


	const handleDelete = () => {
		setFile(undefined);
		setLoaded(0);
		formik.setFieldValue(fileId, "");
		formik.setFieldValue(fileName, "");
	};

	// upload file to backend
	const upload = (file: File) => {
		const data = new FormData();
		data.append("BODY", file, file.name);
		axios
			.post("/staticfiles/", data, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				onUploadProgress: ProgressEvent => {
					// update loaded with current progress
					setLoaded(ProgressEvent.total ? (ProgressEvent.loaded / ProgressEvent.total) * 100 : 0);
				},
			})
			.then(res => {
				if (res.status === 201) {
					// set information about file later needed for POST request and summary
					formik.setFieldValue(fileId, res.data);
					formik.setFieldValue(fileName, file.name);
					// Purely for triggering useEffect. The state change does not matter.
					setLoaded(1337);
				}
			})
			.catch(() => {
				dispatch(addNotification({
					type: "error",
					key: "NOTIFICATIONS.BUMPER_UPLOAD_ERROR",
					duration: -1,
					context: NOTIFICATION_CONTEXT,
				}));
			});
	};

	const handleClick = () => {
		hiddenFileInput.current?.click();
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFile(e.target.files[0]);
			upload(e.target.files[0]);
		}
	};

	return (
		<div className="list-row file-upload">
			{!!descriptionKey && <p className="description">{t(descriptionKey)}</p>}

			<div className="list-sub-row">
				<div className="header-column">
					<label className="large">{t(labelKey)}</label>
				</div>
				<div className="content-column">
					<div className="content-container">
						{/* If user already uploaded a file, its name and a delete button is rendered */}
						{/* else render button for upload */}
						{!!formik.values[fileId] && file ? (
							<div className="upload-file-info">
								<p
									style={
										isEdit ? { padding: "0px 10px" } : { padding: "4px 10px" }
									}
								>
									<a href={URL.createObjectURL(file)} target="_blank" rel="noreferrer">
										{formik.values[fileName] as string}
									</a>
								</p>
								<div className="button-container">
									<button
										id="remove-file-1"
										className="remove-file-button"
										onClick={() => handleDelete()}
									>
										<div className="remove-icon" />
									</button>
								</div>
							</div>
						) : (
							<>
								<button className="upload-button" onClick={() => handleClick()}>
									{t(buttonKey)}
								</button>
								<input
									type="file"
									style={{ display: "none" }}
									accept={acceptableTypes}
									ref={hiddenFileInput}
									onChange={e => {
										handleChange(e);
									}}
								/>
							</>
						)}
					</div>
				</div>
			</div>

			{/* render progress bar while loaded is under 100 and a file is in the upload */}
			{!!file && !!file.name && loaded < 100 && (
				<div className="list-sub-row file-management">
					<div className="progress-container">
						<div className="progress compact">
							<div
								className="progress-bar"
								role="progressbar"
								aria-valuenow={loaded}
								aria-valuemin={0}
								aria-valuemax={100}
								style={{ width: loaded + "%" }}
							>
								<span className="sr-only">{loaded}% Complete</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default FileUpload;
