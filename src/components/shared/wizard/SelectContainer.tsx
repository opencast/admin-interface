import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { useField } from "formik";
import { ParseKeys } from "i18next";
import SearchContainer from "../SearchContainer";
import BaseButton from "../BaseButton";
import { LuArrowRightLeft } from "react-icons/lu";

type Item = {
	name: string
	id?: string
	[key: string]: unknown
}

/**
 * This component renders the select container used for roles and user pages in new group and new user pages.
 */
const SelectContainer = ({
	resource,
	formikField,
	manageable = true,
}: {
	resource: {
		searchable: boolean,
		label: string,
		items: Item[]
	}
	formikField: string
	manageable?: boolean,
}) => {
	const { t } = useTranslation();

	// Formik hook for getting data of specific form field
	// DON'T delete field and meta, hook works with indices not variable names
	const [field, , helpers] = useField<Item[]>(formikField);

	// Search field for filter options/items
	const [searchField, setSearchField] = useState("");
	const [defaultItems, setDefaultItems] = useState<Item[]>([]);
	// arrays an item can be part of depending on its state
	const [items, setItems] = useState<Item[]>([]);
	const [selectedItems, setSelectedItems] = useState<Item[]>(field.value);
	const [markedForAddition, setMarkedForAddition] = useState<string[]>([]);
	const [markedForRemoval, setMarkedForRemoval] = useState<string[]>([]);

	const initialItems = resource.items;

	useEffect(() => {
		// Makes sure that options user already chosen are only shown in right select
		// when coming back again from other page
		// no field value yet --> skip for loop and use all provided items for left
		if (selectedItems.length > 0) {
			for (let i = 0; i < selectedItems.length; i++) {
				// In case we are dealing with Users,
				// we have to also check the combination of "name (id)" as for the key!
				const namesArray = [];
				// Pushing the usual name of selected item into the array, in order to work with other fields like roles etc.
				namesArray.push(selectedItems[i].name);
				// Make sure it is "users" field and then add the combination.
				if (field.name === "users" && selectedItems[i]?.id) {
					namesArray.push(`${selectedItems[i].name} (${selectedItems[i].id})`);
				}
				remove(namesArray, initialItems);
			}
		}

		setItems(initialItems);
		setDefaultItems(initialItems);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	const handleChangeAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const options = e.target.options;
		const selectedOptions = [];

		// put marked options in array
		for (let i = 0; i < options.length; i++) {
			if (options[i].selected) {
				selectedOptions.push(options[i].value);
			}
		}

		// set currently chosen options
		setMarkedForAddition(selectedOptions);
	};

	const handleChangeRemove = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const options = e.target.options;
		const deselectedOptions = [];

		// put all marked options in array
		for (let i = 0; i < options.length; i++) {
			if (options[i].selected) {
				deselectedOptions.push(options[i].value);
			}
		}

		// mark currently marked options for removal
		setMarkedForRemoval(deselectedOptions);
	};

	const handleClickAdd = () => {
		const editableItems = [...items];
		const editableSelectedItems = [...selectedItems];
		const editableDefaultItems = [...defaultItems];

		// move marked items to selected items
		for (let i = 0; i < markedForAddition.length; i++) {
			move(markedForAddition[i], editableItems, editableSelectedItems);

			// Since we are using array of strings as for the remove method!
			const array = [
				markedForAddition[i],
			];
			remove(array, editableDefaultItems);
		}

		// update state with current values
		setSelectedItems(editableSelectedItems);
		setItems(editableItems);
		setMarkedForAddition([]);
		// update items considered for search bar
		setDefaultItems(editableDefaultItems);
		// update formik field
		helpers.setValue(editableSelectedItems);
	};

	const handleClickRemove = () => {
		const editableItems = [...items];
		const editableSelectedItems = [...selectedItems];
		const editableDefaultItems = [...defaultItems];

		// move marked items from selected items back to items
		for (let i = 0; i < markedForRemoval.length; i++) {
			move(markedForRemoval[i], editableSelectedItems, editableItems);

			// add marked item to items considered for search bar if not already containing
			if (
				!editableDefaultItems.some(item => item.name === markedForRemoval[i])
			) {
				editableDefaultItems.push({
					name: markedForRemoval[i],
				});
			}
		}

		// update state with current values
		setSelectedItems(editableSelectedItems);
		setItems(editableItems);
		setMarkedForRemoval([]);
		// update items considered for search bar
		setDefaultItems(editableDefaultItems);
		// update formik field
		helpers.setValue(editableSelectedItems);
	};

	// move item from one array to another when matching key
	const move = (key: string, from: Item[], to: Item[]) => {
		for (let i = 0; i < from.length; i++) {
			if (from[i].name === key) {
				to.push(from[i]);
				from.splice(i, 1);
				return;
			}
		}
	};

	// remove item from array when matching items in keys array
	const remove = (keys: string[], compare: Item[]) => {
		for (let i = 0; i < compare.length; i++) {
			if (keys.includes(compare[i].name)) {
				compare.splice(i, 1);
				return;
			}
		}
	};

	return (
		<div className="row">
			<div className="multi-select-container offset-col-2">
				<div className="multi-select-col">
					<div className="row">
						<label>
							{t(`${resource.label}.LEFT` as ParseKeys)}
							<i className="required" />
						</label>
						{/* Search*/}
						{resource.searchable && (
							<SearchContainer
								value={searchField}
								handleChange={handleChangeSearch}
								clearSearchField={clearSearchField}
								isDisabled={!manageable}
								style={{ marginTop: "10px" }}
							/>
						)}
						{/* Select with options provided by backend*/}
						<select
							multiple
							className={cn("available", { disabled: !manageable })}
							style={manageable ? { minHeight: "11em" } : {}}
							disabled={!manageable}
							value={markedForAddition}
							onChange={e => handleChangeAdd(e)}
						>
							{items.map((item, key) => (
								<option key={key} value={item.name}>
									{item.name}
								</option>
							))}
						</select>
					</div>
					<div className="row">
						<div className="button-container">
							<BaseButton
								className={cn("submit", {
									disabled: !markedForAddition.length || !manageable,
								})}
								aria-disabled={!markedForAddition.length || !manageable}
								onClick={() => handleClickAdd()}
							>
								{t(`${resource.label}.ADD` as ParseKeys)}
							</BaseButton>
						</div>
					</div>
				</div>

				<LuArrowRightLeft className="exchange-icon"/>

				{/* Select with options chosen by user*/}
				<div className="multi-select-col">
					<div className="row">
						<label>{t(`${resource.label}.RIGHT` as ParseKeys)}</label>
						<select
							multiple
							className={cn("selected", { disabled: !manageable })}
							disabled={!manageable}
							style={manageable ? { minHeight: "11em" } : {}}
							onChange={e => handleChangeRemove(e)}
							value={markedForRemoval}
						>
							{selectedItems.map((item, key) => (
								<option key={key} value={item.name}>
									{item.name}
								</option>
							))}
						</select>
					</div>
					<div className="row">
						<div className="button-container">
							<BaseButton
								className={cn("remove", {
									disabled: !markedForRemoval.length || !manageable,
								})}
								aria-disabled={!markedForRemoval.length || !manageable}
								onClick={() => handleClickRemove()}
							>
								{t(`${resource.label}.REMOVE` as ParseKeys)}
							</BaseButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SelectContainer;
