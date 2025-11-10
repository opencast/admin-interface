import { useEffect, useState } from "react";
import SelectContainer from "../../../shared/wizard/SelectContainer";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { fetchUsersAndUsernames } from "../../../../slices/userSlice";
import { FormikProps } from "formik";
import ModalContent from "../../../shared/modals/ModalContent";

/**
 * This component renders the user selection page of the new group wizard and group details wizard
 */
const GroupUsersPage = <T, >({
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
	// users that can be chosen by user
	const [users, setUsers] = useState<{ id: string, name: string }[]>([]);
	// flag for API call
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		async function fetchData() {
			// fetch information about users
			setLoading(true);
			const responseUsers = await fetchUsersAndUsernames();

			const userNames = [];
			for (let i = 0; i < responseUsers.length; i++) {
				userNames.push({
					id: responseUsers[i].id,
					name: responseUsers[i].value,
				});
			}

			setUsers(userNames);
			setLoading(false);
		}

		fetchData();
	}, []);

	return (
		<>
			<ModalContent>
				<div className="form-container">
					{/* Select container for roles*/}
					{!loading && (
						<SelectContainer
							resource={{
								searchable: true,
								label: "USERS.GROUPS.DETAILS.USERS",
								items: users,
							}}
							formikField="users"
						/>
					)}
				</div>
			</ModalContent>

			{/* Button for navigation to next page */}
			{!isEdit && (
				<WizardNavigationButtons
					previousPage={previousPage}
					formik={formik}
					nextPage={nextPage}
				/>
			)}
		</>
	);
};

export default GroupUsersPage;
