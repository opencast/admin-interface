import React, { useEffect, useState } from "react";
import cn from "classnames";
import { hasAccess } from "../../utils/utils";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../store";
import { getUserInformation } from "../../selectors/userInfoSelectors";
import { ParseKeys } from "i18next";
import ButtonLikeAnchor from "./ButtonLikeAnchor";

// References for detecting a click outside of the container of the dropdown menu
const containerAction = React.createRef<HTMLDivElement>();

/**
 * A dropdown menu displayed above a table. The menu contains actions that can
 * affect one or multiple selected entries in the table.
 */
const TableActionDropdown = ({
	actions,
	disabled = true,
}: {
	actions: React.ComponentProps<typeof Action>[]
	disabled: boolean
}) => {
	const { t } = useTranslation();

	const [displayActionMenu, setActionMenu] = useState(false);

	useEffect(() => {
		// Function for handling clicks outside of an open dropdown menu
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerAction.current &&
				!containerAction.current.contains(e.target as Node)
			) {
				setActionMenu(false);
			}
		};

		// Event listener for handle a click outside of dropdown menu
		window.addEventListener("mousedown", handleClickOutside);

		return () => {
			window.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleActionMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		setActionMenu(!displayActionMenu);
	};

	return (
		<div
			className={cn("drop-down-container", { disabled: disabled })}
			aria-disabled={disabled}
			onClick={e => handleActionMenu(e)}
			ref={containerAction}
		>
			<span>{t("BULK_ACTIONS.CAPTION")}</span>
			{/* show dropdown if actions is clicked*/}
			{displayActionMenu && (
				<ul className="dropdown-ul">
					{actions.map((action, key) =>
						<Action
							key={key}
							{...action}
						/>,
					)}
				</ul>
			)}
		</div>
	);
};

const Action = ({
	accessRole,
	handleOnClick,
	text,
}: {
	accessRole: string[]
	handleOnClick: (() => unknown) | void | undefined
	text: ParseKeys
}) => {
	const { t } = useTranslation();
	const user = useAppSelector(state => getUserInformation(state));

	return (
		!!handleOnClick &&
		accessRole.every(accessRole => hasAccess(accessRole, user)) && (
			<li>
				<ButtonLikeAnchor onClick={handleOnClick}>
					{t(text)}
				</ButtonLikeAnchor>
			</li>
		)
	);
};

export default TableActionDropdown;
