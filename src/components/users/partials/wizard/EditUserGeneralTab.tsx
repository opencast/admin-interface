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
				<div className="row">
					<label>
						{t("USERS.USERS.DETAILS.FORM.USERNAME")}
						<i className="required">*</i>
					</label>
					<input
						type="text"
						name="username"
						className={"disabled"}
						disabled
						value={formik.values.username}
					/>
				</div>
				<div className="row">
					<label>{t("USERS.USERS.DETAILS.FORM.NAME")}</label>
					<Field
						type="text"
						name="name"
						disabled={!formik.values.manageable}
						className={cn({
							error: formik.touched.name && formik.errors.name,
							disabled: !formik.values.manageable,
						})}
						value={formik.values.name}
					/>
				</div>
				<div className="row">
					<label>{t("USERS.USERS.DETAILS.FORM.EMAIL")}</label>
					<Field
						type="text"
						name="email"
						disabled={!formik.values.manageable}
						className={cn({
							error: formik.touched.email && formik.errors.email,
							disabled: !formik.values.manageable,
						})}
						value={formik.values.email}
					/>
				</div>
				<div className="row">
					<label>{t("USERS.USERS.DETAILS.FORM.PASSWORD")}</label>
					<Field
						type="password"
						name="password"
						disabled={!formik.values.manageable}
						className={cn({
							error: formik.touched.password && formik.errors.password,
							disabled: !formik.values.manageable,
						})}
						placeholder={t("USERS.USERS.DETAILS.FORM.PASSWORD") + "..."}
					/>
				</div>
				<div className="row">
					<label>{t("USERS.USERS.DETAILS.FORM.REPEAT_PASSWORD")}</label>
					<Field
						type="password"
						name="passwordConfirmation"
						disabled={!formik.values.manageable}
						className={cn({
							error:
								formik.touched.passwordConfirmation &&
								formik.errors.passwordConfirmation,
							disabled: !formik.values.manageable,
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
