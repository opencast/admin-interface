import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation, useNavigate } from "react-router";
import {
	getOrgProperties,
	getUserInformation,
} from "../../selectors/userInfoSelectors";
import { hasAccess } from "../../utils/utils";
import { useHotkeys } from "react-hotkeys-hook";
import { availableHotkeys } from "../../configs/hotkeysConfig";
import { useAppSelector } from "../../store";
import { Tooltip } from "./Tooltip";
import ButtonLikeAnchor from "./ButtonLikeAnchor";
import { ParseKeys } from "i18next";
import {
	LuCalendarCheck,
	LuChartNoAxesColumnIncreasing,
	LuMenu,
	LuServer,
	LuSettings,
	LuUser,
	LuVideo,
} from "react-icons/lu";
import { IconType } from "react-icons";

/**
 * This component renders the main navigation that opens when the burger button is clicked
 */
const MainNav = ({
	isOpen,
	toggleMenu,
}: {
	isOpen: boolean,
	toggleMenu: () => void,
}) => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const orgProperties = useAppSelector(state => getOrgProperties(state));

	const statisticsEnabled = (orgProperties["admin.statistics.enabled"] || "false").toLowerCase() === "true";
	const themesEnabled = (orgProperties["admin.themes.enabled"] || "false").toLowerCase() === "true";

	useHotkeys(
		availableHotkeys.general.EVENT_VIEW.sequence,
		() => navigate("/events/events"),
		{ description: t(availableHotkeys.general.EVENT_VIEW.description) ?? undefined },
		[],
	);

	useHotkeys(
		availableHotkeys.general.SERIES_VIEW.sequence,
		() => navigate("/events/series"),
		{ description: t(availableHotkeys.general.SERIES_VIEW.description) ?? undefined },
		[],
	);

	useHotkeys(
		availableHotkeys.general.MAIN_MENU.sequence,
		() => toggleMenu(),
		{ description: t(availableHotkeys.general.MAIN_MENU.description) ?? undefined },
		[toggleMenu],
	);

    // Find current view based on pathname of router
	const location = useLocation();
	let pathname = "";
	let firstPathFragment = "";
	if (location?.pathname.length > 0) {
		pathname = location.pathname;
		if (pathname.startsWith("/")) {
			firstPathFragment = pathname.substring(1, pathname.indexOf("/", 1));
		}
	}

	interface linkMapItem {
		links: (React.ComponentProps<typeof MainNavLink> & {accessRole: string})[]
	}

	const linkMap: { [key: string]: linkMapItem } = {
		"events": {
			links: [
				{
					path: "/events/events",
					accessRole: "ROLE_UI_EVENTS_VIEW",
					tooltipTitle: "NAV.EVENTS.TITLE",
					Icon: LuCalendarCheck,
				},
				{
					path: "/events/series",
					accessRole: "ROLE_UI_SERIES_VIEW",
					tooltipTitle: "NAV.EVENTS.TITLE",
					Icon: LuCalendarCheck,
				},
			],
		},
		"recordings": {
			links: [
				{
					path: "/recordings/recordings",
					accessRole: "ROLE_UI_LOCATIONS_VIEW",
					tooltipTitle: "NAV.CAPTUREAGENTS.TITLE",
					Icon: LuVideo,
				},
			],
		},
		"systems": {
			links: [
				{
					path: "/systems/jobs",
					accessRole: "ROLE_UI_JOBS_VIEW",
					tooltipTitle: "NAV.SYSTEMS.TITLE",
					Icon: LuServer,
				},
				{
					path: "/systems/servers",
					accessRole: "ROLE_UI_SERVERS_VIEW",
					tooltipTitle: "NAV.SYSTEMS.TITLE",
					Icon: LuServer,
				},
				{
					path: "/systems/services",
					accessRole: "ROLE_UI_SERVICES_VIEW",
					tooltipTitle: "NAV.SYSTEMS.TITLE",
					Icon: LuServer,
				},
			],
		},
		"users": {
			links: [
				{
					path: "/users/users",
					accessRole: "ROLE_UI_USERS_VIEW",
					tooltipTitle: "NAV.USERS.TITLE",
					Icon: LuUser,
				},
				{
					path: "/users/groups",
					accessRole: "ROLE_UI_GROUPS_VIEW",
					tooltipTitle: "NAV.USERS.TITLE",
					Icon: LuUser,
				},
				{
					path: "/users/acls",
					accessRole: "ROLE_UI_ACLS_VIEW",
					tooltipTitle: "NAV.USERS.TITLE",
					Icon: LuUser,
				},
			],
		},
		"configuration": {
			links: [
				{
					path: "/configuration/themes",
					accessRole: "ROLE_UI_THEMES_VIEW",
					tooltipTitle: "NAV.CONFIGURATION.TITLE",
					Icon: LuSettings,
				},
			],
		},
		"statistics": {
			links: [
				{
					path: "/statistics/organization",
					accessRole: "ROLE_UI_STATISTICS_ORGANIZATION_VIEW",
					tooltipTitle: "NAV.STATISTICS.TITLE",
					Icon: LuChartNoAxesColumnIncreasing,
				},
			],
		},
	};

	// Link arrays containing more than one link must be sorted so that the
	// current view is always the first element. Otherwise, NavLink will not
	// recognize the current view as active.
	if (firstPathFragment.length > 0) {
		const arrToSort = linkMap[firstPathFragment as keyof typeof linkMap].links;
		if (arrToSort != undefined && arrToSort.length > 1) {
			arrToSort.forEach(item => {
				// @ts-expect-error: TODO: Someone else can fix this
				if (item.path === pathname) { item.tmpIndex = 0; } else { item.tmpIndex = 1; }
			});
			// @ts-expect-error: TODO: Someone else can fix this
			arrToSort.sort((a, b) => a.tmpIndex - b.tmpIndex);
		}
	}

	return (
		<div className="menu-top" >
			<ButtonLikeAnchor onClick={() => toggleMenu()}>
				<Tooltip title={t("HOTKEYS.DESCRIPTIONS.GENERAL.MAIN_MENU")} placement={"right"}>
					<LuMenu />
				</Tooltip>
			</ButtonLikeAnchor>
			{isOpen && (
				<nav id="roll-up-menu">
					<div id="nav-container">
						{/* todo: more than one href? how? roles? (see MainNav admin-ui-frontend)*/}
						<MainNavButton
							accessRole="ROLE_UI_NAV_RECORDINGS_VIEW"
							links={linkMap["events"].links}
						/>
						<MainNavButton
							accessRole="ROLE_UI_NAV_CAPTURE_VIEW"
							links={linkMap["recordings"].links}
						/>
						<MainNavButton
							accessRole="ROLE_UI_NAV_SYSTEMS_VIEW"
							links={linkMap["systems"].links}
						/>
						<MainNavButton
							accessRole="ROLE_UI_NAV_ORGANIZATION_VIEW"
							links={linkMap["users"].links}
						/>
						{themesEnabled &&
							<MainNavButton
								accessRole="ROLE_UI_NAV_CONFIGURATION_VIEW"
								links={linkMap["configuration"].links}
							/>
						}
						{statisticsEnabled &&
							<MainNavButton
								accessRole="ROLE_UI_NAV_STATISTICS_VIEW"
								links={linkMap["statistics"].links}
							/>
						}
					</div>
				</nav>
			)}
		</div>
	);
};

const MainNavButton = ({
	accessRole,
	links,
}: {
	accessRole: string
	links: (React.ComponentProps<typeof MainNavLink> & {accessRole: string})[]
}) => {

	const user = useAppSelector(state => getUserInformation(state));

	const linkProps = links.find(props => hasAccess(props.accessRole, user));

	return (
		hasAccess(accessRole, user) &&
		linkProps &&
			<MainNavLink
				{...linkProps}
			/>
	);
};

const MainNavLink = ({
	path,
	tooltipTitle,
	Icon,
}: {
	path: string
	tooltipTitle: ParseKeys
	Icon: IconType
}) => {
	const { t } = useTranslation();

	return (
		<NavLink to={path}
			className={({ isActive }) => isActive ? "roll-up-menu-active" : ""}>
			<Tooltip title={t(tooltipTitle)} placement={"right"}>
				<Icon className="main-nav-icon"/>
			</Tooltip>
		</NavLink>
	);
};

export default MainNav;
