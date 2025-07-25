import { useTranslation } from "react-i18next";
import cn from "classnames";
import { Field } from "../../../shared/Field";
import { FormikProps } from "formik";
import { NotificationComponent } from "../../../shared/Notifications";
import ModalContent from "../../../shared/modals/ModalContent";

/**
 * This component renders the general user information tab in the users details modal.
 */
interface RequiredFormProps {
	manageable: boolean,
	username: string,
	name: string,
	email: string,
	password: string,
	passwordConfirmation: string,
}

const EditUserGeneralTab = <T extends RequiredFormProps>({
	formik,
}: {
	formik: FormikProps<T>
}) => {
	const { t } = useTranslation();

	// style used in user details modal
	const editStyle = {
		color: "#666666",
		fontSize: "14px",
	};

	// style for input fields when disabled
	const disabledStyle = {
		backgroundColor: "#eeeff0",
	};

	return (
		<ModalContent>
			<div className="form-container">
				{!formik.values.manageable && (
					<NotificationComponent
						notification={{
							type: "warning",
							message: "NOTIFICATIONS.USER_NOT_MANAGEABLE",
							id: 0,
						}}
					/>
				)}
				<div className="row" style={editStyle}>
					<label>
						{t("USERS.USERS.DETAILS.FORM.USERNAME")}
						<i className="required">*</i>
					</label>
					<input
						type="text"
						name="username"
						style={disabledStyle}
						disabled
						value={formik.values.username}
					/>
				</div>
				<div className="row" style={editStyle}>
					<label>{t("USERS.USERS.DETAILS.FORM.NAME")}</label>
					<Field
						type="text"
						name="name"
						style={formik.values.manageable ? {} : disabledStyle}
						disabled={!formik.values.manageable}
						className={cn({
							error: formik.touched.name && formik.errors.name,
						})}
						value={formik.values.name}
					/>
				</div>
				<div className="row" style={editStyle}>
					<label>{t("USERS.USERS.DETAILS.FORM.EMAIL")}</label>
					<Field
						type="text"
						name="email"
						style={formik.values.manageable ? {} : disabledStyle}
						disabled={!formik.values.manageable}
						className={cn({
							error: formik.touched.email && formik.errors.email,
						})}
						value={formik.values.email}
					/>
				</div>
				<div className="row" style={editStyle}>
					<label>{t("USERS.USERS.DETAILS.FORM.PASSWORD")}</label>
					<Field
						type="password"
						name="password"
						style={formik.values.manageable ? {} : disabledStyle}
						disabled={!formik.values.manageable}
						className={cn({
							error: formik.touched.password && formik.errors.password,
						})}
						placeholder={t("USERS.USERS.DETAILS.FORM.PASSWORD") + "..."}
					/>
				</div>
				<div className="row" style={editStyle}>
					<label>{t("USERS.USERS.DETAILS.FORM.REPEAT_PASSWORD")}</label>
					<Field
						type="password"
						name="passwordConfirmation"
						style={formik.values.manageable ? {} : disabledStyle}
						disabled={!formik.values.manageable}
						className={cn({
							error:
								formik.touched.passwordConfirmation &&
								formik.errors.passwordConfirmation,
						})}
						placeholder={
							t("USERS.USERS.DETAILS.FORM.REPEAT_PASSWORD") + "..."
						}
					/>
				</div>
			</div>
		</ModalContent>
	);
};

export default EditUserGeneralTab;
