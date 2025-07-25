import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import i18n from "../i18n/i18n";
import languages from "../i18n/languages";
import opencastLogo from "../img/opencast-white.svg?url";
import { setSpecificServiceFilter } from "../slices/tableFilterSlice";
import { getErrorCount, getHealthStatus } from "../selectors/healthSelectors";
import {
	getOrgProperties,
	getUserInformation,
} from "../selectors/userInfoSelectors";
import { availableHotkeys } from "../configs/hotkeysConfig";
import { studioURL } from "../configs/generalConfig";
import { hasAccess } from "../utils/utils";
import RegistrationModal from "./shared/RegistrationModal";
import HotKeyCheatSheet from "./shared/HotKeyCheatSheet";
import { useHotkeys } from "react-hotkeys-hook";
import { useAppDispatch, useAppSelector } from "../store";
import { HealthStatus, fetchHealthStatus } from "../slices/healthSlice";
import { UserInfoState } from "../slices/userInfoSlice";
import { Tooltip } from "./shared/Tooltip";
import { HiTranslate } from "react-icons/hi";
import { IconContext } from "react-icons";
import ButtonLikeAnchor from "./shared/ButtonLikeAnchor";
import { ModalHandle } from "./shared/modals/Modal";
import { broadcastLogout } from "../utils/broadcastSync";

// References for detecting a click outside of the container of the dropdown menus
const containerLang = React.createRef<HTMLDivElement>();
const containerHelp = React.createRef<HTMLDivElement>();
const containerUser = React.createRef<HTMLDivElement>();
const containerNotify = React.createRef<HTMLDivElement>();

/**
 * Component that renders the header and the navigation in the upper right corner.
 */
const Header = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	// State for opening (true) and closing (false) the dropdown menus for language, notification, help and user
	const [displayMenuLang, setMenuLang] = useState(false);
	const [displayMenuUser, setMenuUser] = useState(false);
	const [displayMenuNotify, setMenuNotify] = useState(false);
	const [displayMenuHelp, setMenuHelp] = useState(false);
	const registrationModalRef = useRef<ModalHandle>(null);
	const hotKeyCheatSheetModalRef = useRef<ModalHandle>(null);

	const healthStatus = useAppSelector(state => getHealthStatus(state));
	const errorCounter = useAppSelector(state => getErrorCount(state));
	const user = useAppSelector(state => getUserInformation(state));
	const orgProperties = useAppSelector(state => getOrgProperties(state));

	const loadHealthStatus = async () => {
		await dispatch(fetchHealthStatus());
	};

	const hideMenuHelp = () => {
		setMenuHelp(false);
	};

	const showRegistrationModal = () => {
		registrationModalRef.current?.open();
	};

	const showHotKeyCheatSheet = () => {
		hotKeyCheatSheetModalRef.current?.open();
	};

	const toggleHotKeyCheatSheet = () => {
		if (hotKeyCheatSheetModalRef.current?.isOpen?.()) {
			hotKeyCheatSheetModalRef.current?.close?.();
		} else {
			hotKeyCheatSheetModalRef.current?.open();
		}
	};

	const handleChangeLanguage = (code: string) => {
		// Load json-file of the language with provided code
		i18n.changeLanguage(code);
		// Close the language dropdown menu
		setMenuLang(false);
	};

	useHotkeys(
    availableHotkeys.general.HOTKEY_CHEATSHEET.sequence,
    () => toggleHotKeyCheatSheet(),
		{
			description: t(availableHotkeys.general.HOTKEY_CHEATSHEET.description) ?? undefined,
		},
    [toggleHotKeyCheatSheet],
  );

	useEffect(() => {
		// Function for handling clicks outside of an open dropdown menu
		const handleClickOutside = (e: MouseEvent) => {
			if (containerLang.current && !containerLang.current.contains(e.target as Node)) {
				setMenuLang(false);
			}

			if (containerHelp.current && !containerHelp.current.contains(e.target as Node)) {
				setMenuHelp(false);
			}

			if (containerUser.current && !containerUser.current.contains(e.target as Node)) {
				setMenuUser(false);
			}

			if (
				containerNotify.current &&
				!containerNotify.current.contains(e.target as Node)
			) {
				setMenuNotify(false);
			}
		};

		// Fetching health status information at mount
		loadHealthStatus().then(r => console.info(r));
		// Fetch health status every minute
		const interval = setInterval(() => dispatch(fetchHealthStatus()), 5000);

		// Event listener for handle a click outside of dropdown menu
		window.addEventListener("mousedown", handleClickOutside);

		return () => {
			clearInterval(interval);
			window.removeEventListener("mousedown", handleClickOutside);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<header className="primary-header">
				{/* Opencast logo in upper left corner */}
				<div className="header-branding">
					<a href="/" target="_self" className="logo">
						<img src={opencastLogo} alt="Opencast Logo" />
					</a>
				</div>

				{/* Navigation with icons and dropdown menus in upper right corner */}
				<nav className="header-nav nav-dd-container" id="nav-dd-container">
					{/* Select language */}
					<div className="nav-dd lang-dd" id="lang-dd" ref={containerLang}>
						<Tooltip active={!displayMenuLang} title={t("LANGUAGE")}>
							<button className="lang" onClick={() => setMenuLang(!displayMenuLang)}>
								<IconContext.Provider value={{ style: { fontSize: "20px" } }}>
									<HiTranslate />
								</IconContext.Provider>
							</button>
						</Tooltip>
						{displayMenuLang && <MenuLang handleChangeLanguage={handleChangeLanguage}/>}
					</div>

					{/* Media Module */}
					{/* Show icon only if mediaModuleUrl is set*/}
					{/* The seperated if clauses are intentional because on start up orgProperties are not filled yet,
                    otherwise the app crashes */}
					{!!orgProperties &&
						!!orgProperties["org.opencastproject.admin.mediamodule.url"] && (
							<div className="nav-dd">
								<Tooltip title={t("MEDIAMODULE")}>
									<a
										href={
											orgProperties["org.opencastproject.admin.mediamodule.url"]
										}
										target="_blank" rel="noreferrer"
									>
										<i className="fa fa-play-circle" />
									</a>
								</Tooltip>
							</div>
						)}

					{/* Opencast Studio */}
					{hasAccess("ROLE_STUDIO", user) && (
						<div className="nav-dd">
							<Tooltip title={t("STUDIO")}>
								<a href={studioURL} target="_blank" rel="noreferrer">
									<i className="fa fa-video-camera" />
								</a>
							</Tooltip>
						</div>
					)}

					{/* System warnings and notifications */}
					{user.isAdmin && (
						<div
							className="nav-dd info-dd"
							id="info-dd"
							ref={containerNotify}
						>
							<Tooltip active={!displayMenuNotify} title={t("SYSTEM_NOTIFICATIONS")}>
								<button onClick={() => setMenuNotify(!displayMenuNotify)}>
									<i className="fa fa-bell" aria-hidden="true" />
									{errorCounter !== 0 && (
										<span id="error-count" className="badge">
											{errorCounter}
										</span>
									)}
								</button>
							</Tooltip>
							{/* Click on the bell icon, a dropdown menu with all services in serviceList and their status opens */}
							{displayMenuNotify && (
								<MenuNotify
									healthStatus={healthStatus}
								/>
							)}
						</div>
					)}

					{/* Help */}
					{/* Show only if documentationUrl or restdocsUrl is set */}
					{/* The seperated if clauses are intentional because on start up orgProperties are not filled yet,
                    otherwise the app crashes */}
					{!!orgProperties &&
						(!!orgProperties[
							"org.opencastproject.admin.help.documentation.url"
						] ||
							!!orgProperties[
								"org.opencastproject.admin.help.restdocs.url"
							]) && (
							<div
								className="nav-dd"
								id="help-dd"
								ref={containerHelp}
							>
								<Tooltip active={!displayMenuHelp} title={t("HELP.HELP")}>
									<button
										onClick={() => setMenuHelp(!displayMenuHelp)}
									>
										<span className="fa fa-question-circle"></span>
									</button>
								</Tooltip>
								{/* Click on the help icon, a dropdown menu with documentation, REST-docs and shortcuts (if available) opens */}
								{displayMenuHelp && (
									<MenuHelp
										hideMenuHelp={hideMenuHelp}
										showRegistrationModal={showRegistrationModal}
										showHotKeyCheatSheet={showHotKeyCheatSheet}
										orgProperties={orgProperties}
										user={user}
									/>
								)}
							</div>
						)}

					{/* Username */}
					<div className="nav-dd user-dd" id="user-dd" ref={containerUser}>
						<button
							className="h-nav"
							onClick={() => setMenuUser(!displayMenuUser)}
						>
							{user.user.name || user.user.username}
							<span className="dropdown-icon" />
						</button>
						{/* Click on username, a dropdown menu with the option to logout opens */}
						{displayMenuUser && <MenuUser />}
					</div>
				</nav>
			</header>

			{/* Adopters Registration Modal */}
			<RegistrationModal modalRef={registrationModalRef}/>

			{/* Hotkey Cheat Sheet */}
			<HotKeyCheatSheet modalRef={hotKeyCheatSheetModalRef}/>
		</>
	);
};

const MenuLang = ({ handleChangeLanguage }: { handleChangeLanguage: (code: string) => void }) => {
	// const handleChangeLanguage = (code: string) => {
	// 	handleChangeLanguage(code);
	// };

	return (
		<ul className="dropdown-ul">
			{/* one list item for each available language */}
			{languages.map((language, key) => (
				<li key={key}>
					<ButtonLikeAnchor
						extraClassName={(i18n.language === language.code ? "selected" : "")}
						onClick={() => handleChangeLanguage(language.code)}
					>
						{language.long}
					</ButtonLikeAnchor>
				</li>
			))}
		</ul>
	);
};

const MenuNotify = ({
	healthStatus,
}: {
	healthStatus: HealthStatus[],
}) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const redirectToServices = async () => {
		// set the action filter value of services to true
		await dispatch(setSpecificServiceFilter({ filter: "actions", filterValue: "true" }));
		navigate("/systems/services");
	};

	return (
		<ul className="dropdown-ul">
			{/* For each service in the serviceList (Background Services) one list item */}
			{healthStatus.map((service, key) => (
				<li key={key}>
					{!!service.status && (
						<button
							className="button-like-anchor"
							onClick={() => redirectToServices()}
						>
							<span> {service.name} </span>
							{service.error ? (
								<span className="ng-multi-value ng-multi-value-red">
									{service.status}
								</span>
							) : (
								<span className="ng-multi-value ng-multi-value-green">
									{service.status}
								</span>
							)}
						</button>
					)}
				</li>
			))}
		</ul>
	);
};

const MenuHelp = ({
	hideMenuHelp,
	showRegistrationModal,
	showHotKeyCheatSheet,
	user,
	orgProperties,
}: {
	hideMenuHelp: () => void,
	showRegistrationModal: () => void,
	showHotKeyCheatSheet: () => void,
	user: UserInfoState,
	orgProperties: { [key: string]: string },
}) => {
	const { t } = useTranslation();

	// show Adopter Registration Modal and hide drop down
	const showAdoptersRegistrationModal = () => {
		showRegistrationModal();
		hideMenuHelp();
	};

	// show Hotkeys Cheat Sheet and hide drop down
	const showHotKeys = () => {
		showHotKeyCheatSheet();
		hideMenuHelp();
	};

	return (
		<>
			<ul className="dropdown-ul">
				{/* Show only if documentationUrl is set */}
				{!!orgProperties[
					"org.opencastproject.admin.help.documentation.url"
				] && (
					<li>
						<a
							href={
								orgProperties[
									"org.opencastproject.admin.help.documentation.url"
								]
							}
							target="_blank" rel="noreferrer"
						>
							<span>{t("HELP.DOCUMENTATION")}</span>
						</a>
					</li>
				)}
				{/* Show only if restUrl is set */}
				{!!orgProperties["org.opencastproject.admin.help.restdocs.url"] && user.isAdmin && (
						<li>
							<a
								target="_blank" rel="noreferrer"
								href={
									orgProperties["org.opencastproject.admin.help.restdocs.url"]
								}
							>
								<span>{t("HELP.REST_DOC")}</span>
							</a>
						</li>
					)}
				<li>
					<ButtonLikeAnchor onClick={() => showHotKeys()}>
						<span>{t("HELP.HOTKEY_CHEAT_SHEET")}</span>
					</ButtonLikeAnchor>
				</li>
				{/* Adoter registration Modal */}
				{user.isAdmin && (
					<li>
						<ButtonLikeAnchor onClick={() => showAdoptersRegistrationModal()}>
							<span>{t("HELP.ADOPTER_REGISTRATION")}</span>
						</ButtonLikeAnchor>
					</li>
				)}
			</ul>
		</>
	);
};

const MenuUser = () => {
	const { t } = useTranslation();

	const logout = () => {
		// Here we broadcast logout, in order to redirect other tabs to login page!
		broadcastLogout();
		window.location.href = "/j_spring_security_logout";
	};
	return (
		<ul className="dropdown-ul">
			<li>
				<ButtonLikeAnchor onClick={() => logout()}>
					<span className="logout-icon">{t("LOGOUT")}</span>
				</ButtonLikeAnchor>
			</li>
		</ul>
	);
};

export default Header;
