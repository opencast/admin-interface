import { FormikProps } from "formik";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ModalContent from "../../../shared/modals/ModalContent";
import SearchContainer from "../../../shared/SearchContainer";

/**
 * This component renders the effective role tab of the user details modal
 */
interface RequiredFormProps {
	roles: {
		name: string
	}[]
}

const UserEffectiveRolesTab = <T extends RequiredFormProps>({
	formik,
}: {
	formik: FormikProps<T>
}) => {
	const { t } = useTranslation();

	const [searchField, setSearchField] = useState("");
	const [defaultItems] = useState(formik.values.roles);
	const [items, setItems] = useState(formik.values.roles);

	const clearSearchField = () => {
		setSearchField("");
		setItems(defaultItems);
	};

	const handleChangeSearch = (input: string) => {
		const filtered = defaultItems.filter(item => {
			return item.name.toLowerCase().includes(input.toLowerCase());
		});
		setSearchField(input);
		setItems(filtered);
	};

	return (
		<ModalContent>
			<div className="form-container multi-select-container">
				<label>{t("USERS.USERS.DETAILS.TABS.EFFECTIVEROLES")}</label>
				<p>{t("USERS.USERS.DETAILS.DESCRIPTION.EFFECTIVEROLES")}</p>

				{/* list  all roles a user got */}
				<SearchContainer
					value={searchField}
					handleChange={handleChangeSearch}
					clearSearchField={clearSearchField}
				/>

				<select multiple style={{ height: "26em" }}>
					{items.map((item, key) => (
						<option key={key} value={item.name}>
							{item.name}
						</option>
					))}
				</select>
			</div>
		</ModalContent>
	);
};

export default UserEffectiveRolesTab;
