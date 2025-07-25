import { useTranslation } from "react-i18next";
import {
	styleNav,
	styleNavHierarchy,
	styleNavHierarchyInactive,
} from "../../../../utils/eventDetailsUtils";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import { ParseKeys } from "i18next";

/**
 * This component renders the navigation hierarchy for the workflow details sub-tabs of event details modal
 */
const EventDetailsTabHierarchyNavigation = <T, >({
	openSubTab,
	hierarchyDepth,
	translationKey0,
	subTabArgument0,
	translationKey1,
	subTabArgument1,
	translationKey2,
	subTabArgument2,
	translationKey3,
	subTabArgument3,
}: {
	openSubTab: (tabType: T) => void,
	hierarchyDepth: number,
	translationKey0: ParseKeys,
	subTabArgument0: T,
	translationKey1?: ParseKeys,
	subTabArgument1?: T,
	translationKey2?: ParseKeys,
	subTabArgument2?: T,
	translationKey3?: ParseKeys,
	subTabArgument3?: T,
}) => {
	const { t } = useTranslation();

	/* Hierarchy navigation */
	return (
		<nav className="scope" style={styleNav}>
			<ButtonLikeAnchor
				extraClassName="breadcrumb-link scope"
				style={
					hierarchyDepth === 0
						? styleNavHierarchy
						: styleNavHierarchyInactive
				}
				onClick={() => openSubTab(subTabArgument0)}
			>
				{t(translationKey0)}
				{hierarchyDepth > 0 && (
					<span style={styleNavHierarchyInactive}> </span>
				)}
			</ButtonLikeAnchor>
			{hierarchyDepth > 0 && subTabArgument1 && (
				<ButtonLikeAnchor
					extraClassName="breadcrumb-link scope"
					style={
						hierarchyDepth === 1
							? styleNavHierarchy
							: styleNavHierarchyInactive
					}
					onClick={() => openSubTab(subTabArgument1)}
				>
					{translationKey1 && t(translationKey1)}
					{hierarchyDepth > 1 && (
						<span style={styleNavHierarchyInactive}> </span>
					)}
				</ButtonLikeAnchor>
			)}
			{hierarchyDepth > 1 && subTabArgument2 && (
				<ButtonLikeAnchor
					extraClassName="breadcrumb-link scope"
					style={
						hierarchyDepth === 2
							? styleNavHierarchy
							: styleNavHierarchyInactive
					}
					onClick={() => openSubTab(subTabArgument2)}
				>
					{translationKey2 && t(translationKey2)}
				</ButtonLikeAnchor>
			)}
			{hierarchyDepth > 2 && subTabArgument3 && (
				<ButtonLikeAnchor
					extraClassName="breadcrumb-link scope"
					style={styleNavHierarchy}
					onClick={() => openSubTab(subTabArgument3)}
				>
					{translationKey3 && t(translationKey3)}
				</ButtonLikeAnchor>
			)}
		</nav>
	);
};

export default EventDetailsTabHierarchyNavigation;
