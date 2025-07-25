import { FormikProps } from "formik";
import { useEffect, useState } from "react";
import { Event } from "../slices/eventSlice";
import { isEvent } from "../slices/tableSlice";

export const usePageFunctions = <initialValuesType>(initialPage: number, initialValues: initialValuesType) => {
	const [page, setPage] = useState(initialPage);
	const [snapshot, setSnapshot] = useState(initialValues);
	const [pageCompleted, setPageCompleted] = useState<{ [key: number]: boolean }>({});

	const nextPage = (values: initialValuesType) => {
		setSnapshot(values);

		// set page as completely filled out
		const updatedPageCompleted = pageCompleted;
		updatedPageCompleted[page] = true;
		setPageCompleted(updatedPageCompleted);

		setPage(page + 1);
	};

	const previousPage = (values: initialValuesType) => {
		setSnapshot(values);
		setPage(page - 1);
	};

	return {
		snapshot,
		page,
		nextPage,
		previousPage,
		setPage,
		pageCompleted,
		setPageCompleted,
	};
};

interface RequiredFormProps {
	events: Event[],
}

export const useSelectionChanges = <T extends RequiredFormProps>(
	formik: FormikProps<T>,
	selectedRows: Event[],
) => {
	const [selectedEvents, setSelectedEvents] = useState(
		formik.values.events.length === 0 ? selectedRows : formik.values.events,
	);
	const [allChecked, setAllChecked] = useState(
		formik.values.events.length === 0
			? true
			: formik.values.events.every(event => event.selected === true),
	);

	// Select or deselect all rows in table
	const onChangeAllSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selected = e.target.checked;
		setAllChecked(selected);
		const changedSelection = selectedEvents.map(event => {
			return {
				...event,
				selected: selected,
			};
		});
		setSelectedEvents(changedSelection);
		formik.setFieldValue("events", changedSelection);
	};

	// Handle change of checkboxes indicating which events to consider further
	const onChangeSelected = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
		const selected = e.target.checked;
		const changedEvents = selectedEvents.map(event => {
			if (isEvent(event) && event.id === id) {
				return {
					...event,
					selected: selected,
				};
			} else {
				return event;
			}
		});
		setSelectedEvents(changedEvents);
		formik.setFieldValue("events", changedEvents);

		if (!selected) {
			setAllChecked(false);
		}
		if (changedEvents.every(event => event.selected === true)) {
			setAllChecked(true);
		}
	};

	return {
		selectedEvents,
		allChecked,
		onChangeSelected,
		onChangeAllSelected,
	};
};

export const useClickOutsideField = (
	childRef: React.RefObject<HTMLDivElement | null>,
	isFirstField?: boolean,
) => {
	// Indicator if currently edit mode is activated
	const [editMode, setEditMode] = useState(isFirstField);

	useEffect(() => {
		// Handle click outside the field and leave edit mode
		const handleClickOutside = (e: MouseEvent) => {
			if (childRef.current && !childRef.current.contains(e.target as Node)) {
				setEditMode(false);
			}
		};

		// Focus current field
		if (childRef && childRef.current && editMode === true) {
			childRef.current.focus();
		}

		// Adding event listener for detecting click outside
		window.addEventListener("mousedown", handleClickOutside);

		return () => {
			window.removeEventListener("mousedown", handleClickOutside);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editMode]);

	return { editMode, setEditMode };
};
