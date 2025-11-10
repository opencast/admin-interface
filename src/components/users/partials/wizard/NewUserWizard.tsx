import { useEffect, useState } from "react";
import { Formik } from "formik";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import NewUserGeneralTab from "./NewUserGeneralTab";
import UserRolesTab from "./UserRolesTab";
import { initialFormValuesNewUser } from "../../../../configs/modalConfig";
import { getUsernames } from "../../../../selectors/userSelectors";
import { NewUserSchema } from "../../../../utils/validate";
import { NewUser, postNewUser, UserRole } from "../../../../slices/userSlice";
import { useAppDispatch, useAppSelector } from "../../../../store";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { Role } from "../../../../slices/aclSlice";

/**
 * This component renders the new user wizard
 */
const NewUserWizard = ({
	close,
}: {
	close: () => void,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const usernames = useAppSelector(state => getUsernames(state));

	const [tab, setTab] = useState(0);

	const openTab = (tabNr: number) => {
		setTab(tabNr);
	};

	const handleSubmit = (values: {
			username: string,
			name: string,
			email: string,
			password: string,
			roles: Role[],
			assignedRoles: UserRole[],
	}) => {
		const newValues: NewUser = {
			username: values.username,
			name: values.name,
			email: values.email,
			password: values.password,
			roles: values.assignedRoles,
		};
		const response = dispatch(postNewUser(newValues));
		console.info(response);
		close();
	};

	return (
		<>
			{/* Head navigation*/}
			<nav className="modal-nav">
				<ButtonLikeAnchor
					className={cn("wider", { active: tab === 0 })}
					onClick={() => openTab(0)}
				>
					{t("USERS.USERS.DETAILS.TABS.USER")}
				</ButtonLikeAnchor>
				<ButtonLikeAnchor
					className={cn("wider", { active: tab === 1 })}
					onClick={() => openTab(1)}
					tooltipText="USERS.USERS.DETAILS.DESCRIPTION.ROLES"
				>
					{t("USERS.USERS.DETAILS.TABS.ROLES")}
				</ButtonLikeAnchor>
			</nav>

			{/* Initialize overall form */}
			<Formik
				initialValues={initialFormValuesNewUser}
				validationSchema={NewUserSchema(usernames)}
				onSubmit={values => handleSubmit(values)}
			>
				{/* Render wizard tabs depending on current value of tab variable */}
				{formik => {
					// eslint-disable-next-line react-hooks/rules-of-hooks
					useEffect(() => {
						formik.validateForm();
					// eslint-disable-next-line react-hooks/exhaustive-deps
					}, [tab]);

					return (
						<>
							{tab === 0 && <NewUserGeneralTab formik={formik} />}
							{tab === 1 && <UserRolesTab formik={formik} />}

							{/* Navigation buttons and validation */}
							<WizardNavigationButtons
								isLast
								formik={formik}
								nextPage={() => formik.handleSubmit()}
								previousPage={() => close()}
								cancelTranslationString={"CANCEL"}
							/>
						</>
					);
				}}
			</Formik>
		</>
	);
};

export default NewUserWizard;
