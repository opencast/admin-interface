import { useNavigate } from "react-router";
import { setSpecificEventFilter } from "../../slices/tableFilterSlice";
import { useAppDispatch } from "../../store";
import ButtonLikeAnchor from "./ButtonLikeAnchor";
import { ParseKeys } from "i18next";
import { ReactNode } from "react";

/**
 * This component renders the name cells of recordings in the table view
 */
const RedirectCell = ({
	path,
	filterName,
	filterValue,
	tooltipText,
	children,
}: {
	path: string
	filterName: string
	filterValue: string
	tooltipText?: ParseKeys
	children: ReactNode
}) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const redirectToResource = async (filterValue: string) => {
		// Set filter before redirecting
		await dispatch(setSpecificEventFilter({ filter: filterName, filterValue }));
		navigate(path);
	};

	return (
		<ButtonLikeAnchor
			className="button-like-anchor crosslink"
			tooltipText={tooltipText}
			onClick={() => redirectToResource(filterValue)}
		>
			{children}
		</ButtonLikeAnchor>
	);
};

export default RedirectCell;
