import React, { useRef } from "react";
import { Link, useLocation } from "react-router";
import { hasAccess } from "../utils/utils";
import { useAppSelector } from "../store";
import { getUserInformation } from "../selectors/userInfoSelectors";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import MainNav from "./shared/MainNav";
import NewResourceModal, { NewResource } from "./shared/NewResourceModal";
import { useHotkeys } from "react-hotkeys-hook";
import { ModalHandle } from "./shared/modals/Modal";
import { ParseKeys } from "i18next";

/**
 * Component that renders the nav bar
 */
type CreateType = {
	accessRole: string
	onShowModal?: () => Promise<void>
	onHideModal?: () => void
	text: ParseKeys
	isDisplay?: boolean
	resource: NewResource
	hotkeySequence?: string[]
	hotkeyDescription?: ParseKeys
}

const NavBar = ({
	children,
	navAriaLabel,
	displayNavigation,
	setNavigation,
	links,
	create,
} : {
	children?: React.ReactNode
	navAriaLabel?: ParseKeys
	displayNavigation: boolean
	setNavigation: React.Dispatch<React.SetStateAction<boolean>>
	links: {
		path: string
		accessRole: string
		text: ParseKeys
	}[]
	create?: CreateType
}) => {
	const { t } = useTranslation();
	const location = useLocation();

	const user = useAppSelector(state => getUserInformation(state));

	const newResourceModalRef = useRef<ModalHandle>(null);

	const showNewResourceModal = async () => {
		if (create && create.onShowModal) {
			await create.onShowModal();
		}
		newResourceModalRef.current?.open();
	};

	const hideNewResourceModal = () => {
		if (create && create.onHideModal) {
			create.onHideModal();
		}
		newResourceModalRef.current?.close?.();
	};

	const toggleNavigation = () => {
		setNavigation(!displayNavigation);
	};

	useHotkeys(
		(create && create.hotkeySequence) ?? [],
		() => showNewResourceModal(),
		{ description: create && create.hotkeyDescription ? t(create.hotkeyDescription) : undefined },
		[showNewResourceModal],
	);

	return (
		<section className="action-nav-bar" role="navigation">
			{/* Display modal for new resource if add button is clicked */}
			{ create && (create.isDisplay === undefined || create.isDisplay) &&
				<NewResourceModal
					handleClose={hideNewResourceModal}
					resource={create.resource}
					modalRef={newResourceModalRef}
				/>
			}

			{/* Include Burger-button menu */}
			<MainNav isOpen={displayNavigation} toggleMenu={toggleNavigation} />

			<nav aria-label={navAriaLabel && t(navAriaLabel)}>
				{links.map((link, index) => {
					return (hasAccess(link.accessRole, user) && (
						<Link
							key={index}
							to={link.path}
							className={cn({ active: location.pathname === link.path || (location.pathname === "/" && link.path === "/events/events") })}
						>
							{t(link.text)}
						</Link>
					));
				})}
			</nav>

			{children}

			{create &&
				<div className="btn-group">
					{hasAccess(create.accessRole, user) && (
						<button
							className="add"
							onClick={showNewResourceModal}
						>
							<i className="fa fa-plus" />
							<span>{t(create.text)}</span>
						</button>
					)}
				</div>
			}
		</section>
	);
};

export default NavBar;
