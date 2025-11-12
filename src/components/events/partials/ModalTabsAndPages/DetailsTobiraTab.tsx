import { useTranslation } from "react-i18next";
import Notifications from "../../../shared/Notifications";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { getSeriesDetailsTobiraData, getSeriesDetailsTobiraDataError, getTobiraTabHierarchy } from "../../../../selectors/seriesDetailsSelectors";
import { addNotification } from "../../../../slices/notificationSlice";
import { NOTIFICATION_CONTEXT_TOBIRA } from "../../../../configs/modalConfig";
import { getEventDetailsTobiraData, getEventDetailsTobiraDataError } from "../../../../selectors/eventDetailsSelectors";
import { Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import EventDetailsTabHierarchyNavigation from "./EventDetailsTabHierarchyNavigation";
import NewTobiraPage, { TobiraFormProps } from "./NewTobiraPage";
import { fetchSeriesDetailsTobira, removeSeriesTobiraPath, setTobiraTabHierarchy, TobiraData, updateSeriesTobiraPath } from "../../../../slices/seriesDetailsSlice";
import { fetchSeriesDetailsTobiraNew, TobiraPage } from "../../../../slices/seriesSlice";
import ConfirmModal from "../../../shared/ConfirmModal";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import { ModalHandle } from "../../../shared/modals/Modal";
import { fetchEventDetailsTobira } from "../../../../slices/eventDetailsSlice";
import BaseButton from "../../../shared/BaseButton";
import { LuCircleX, LuCopy, LuSquarePen } from "react-icons/lu";


export type TobiraTabHierarchy = "main" | "edit-path";

/**
 * This component renders the Tobira tab for new series and events
 * in their respective details modal.
 */
type DetailsTobiraTabProps = {
	kind: "series" | "event";
	id: string;
}
const DetailsTobiraTab = ({ kind, id }: DetailsTobiraTabProps) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const tabHierarchy = useAppSelector(state => getTobiraTabHierarchy(state));

	useEffect(() => {
		if (kind === "event") {
			// Needed to dispatch the correct notification if the event is not found.
			// While the data is also fetched in `EventDetails.tsx`, it's used there
			// only to check the error status. The dispatched `NOT_FOUND` notification
			// is removed when switching to another tab.
			dispatch(fetchEventDetailsTobira(id));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const [initialValues, setInitialValues] = useState<TobiraFormProps>({
		breadcrumbs: [],
	});

	const tobiraData = useAppSelector(state => kind === "series"
		? getSeriesDetailsTobiraData(state)
		: getEventDetailsTobiraData(state),
	);
	const error = useAppSelector(state => kind === "series"
		? getSeriesDetailsTobiraDataError(state)
		: getEventDetailsTobiraDataError(state),
	);

	const i18nKey = kind === "series" ? "SERIES" : "EVENTS";
	const prefix = kind === "series" ? "s" : "v";
	const directTobiraLink = tobiraData.baseURL + `/!${prefix}/` + (tobiraData.id.length > 2 ? tobiraData.id.substring(2) : `:${id}`);

	const getBreadcrumbs = (currentPage: TobiraPage) => {
		const homepage = {
			title: undefined,
			path: "/",
			segment: "",
			children: [],
			ancestors: [],
			blocks: [],
		};

		return [homepage, ...currentPage.ancestors];
	};

	const copyTobiraDirectLink = () => {
		navigator.clipboard.writeText(directTobiraLink).then(function () {
			dispatch(addNotification({
				type: "info",
				key: "TOBIRA_COPIED_DIRECT_LINK",
				duration: 3,
				context: NOTIFICATION_CONTEXT_TOBIRA,
			}));
		}, function () {
			dispatch(addNotification({
				type: "error",
				key: "TOBIRA_FAILED_COPYING_DIRECT_LINK",
				duration: 3,
				context: NOTIFICATION_CONTEXT_TOBIRA,
			}));
		});
	};

	const handleSubmit = async (values: TobiraFormProps) => {
		await dispatch(updateSeriesTobiraPath({
			seriesId: id,
			currentPath: values.currentPath,
			selectedPage: values.selectedPage,
			breadcrumbs: values.breadcrumbs,
		}));

		if (values.selectedPage?.path) {
			await dispatch(fetchSeriesDetailsTobira(id));
		}
		dispatch(setTobiraTabHierarchy("main"));
	};

	const handleDelete = async (hostPage: TobiraPage) => {
		await dispatch(removeSeriesTobiraPath({
			seriesId: id,
			currentPath: hostPage.path,
		})).then(() => dispatch(fetchSeriesDetailsTobira(id)));
	};

	const openSubTab = async (tabType: TobiraTabHierarchy, currentPage?: TobiraPage) => {
		if (currentPage) {
			const breadcrumbs = getBreadcrumbs(currentPage);
			// Breadcrumbs always include at least the homepage, so the length is at least 1.
			const hostPage = breadcrumbs[breadcrumbs.length - 1];

			setInitialValues({
				...initialValues,
				currentPath: currentPage.path,
				breadcrumbs,
			});
			await dispatch(fetchSeriesDetailsTobiraNew(hostPage.path));
		} else {
			await dispatch(fetchSeriesDetailsTobiraNew("/"));
		}

		dispatch(setTobiraTabHierarchy(tabType));
	};

	return <>
		<div className="modal-content">
			{tabHierarchy === "edit-path" && <EventDetailsTabHierarchyNavigation
				openSubTab={openSubTab}
				hierarchyDepth={0}
				translationKey0="EVENTS.SERIES.DETAILS.TOBIRA.DISCARD"
				subTabArgument0="main"
			/>}
			{tabHierarchy === "main" && <div className="modal-body">
				{/* Notifications */}
				<Notifications context="tobira" />
				{!error && <>
					<div className="tab-description">
						<a href={directTobiraLink}>
							{t(`EVENTS.${i18nKey}.DETAILS.TOBIRA.DIRECT_LINK`)}
						</a>
						<BaseButton
							className="tobira-copy-direct-link"
							onClick={() => copyTobiraDirectLink()}
							aria-label={t(`EVENTS.${i18nKey}.DETAILS.TOBIRA.COPY_DIRECT_LINK`)}
						>
							<i
								aria-hidden="true"
								title={t(`EVENTS.${i18nKey}.DETAILS.TOBIRA.COPY_DIRECT_LINK`)}
							/>
							<LuCopy />
						</BaseButton>
					</div>
					{kind === "series" && <p className="tab-description">
						{t("EVENTS.SERIES.DETAILS.TOBIRA.DESCRIPTION")}
					</p>}
					<TobiraTable {...{
						tobiraData,
						i18nKey,
						openSubTab,
						dispatch,
						handleDelete,
					}} />
				</>}
			</div>}
		</div>
		{tabHierarchy === "edit-path" && (
			<Formik
				initialValues={initialValues}
				validationSchema={undefined}
				onSubmit={values => handleSubmit(values)}
			>
				{formik => <NewTobiraPage
					mode={{
						edit: true,
						mount: tobiraData.hostPages.length === 0,
					}}
					formik={formik}
					nextPage={() => {}}
					previousPage={() => {}}
				/>}
			</Formik>
		)}
	</>;
};

type TobiraTableProps = {
	tobiraData: TobiraData;
	i18nKey: "SERIES" | "EVENTS";
	openSubTab: (tabType: TobiraTabHierarchy, currentPage?: TobiraPage) => Promise<void>;
	handleDelete: (hostPage: TobiraPage) => Promise<void>;
};

const TobiraTable = ({ tobiraData, i18nKey, openSubTab, handleDelete }: TobiraTableProps) => {
	const { t } = useTranslation();
	const deleteConfirmationModalRef = useRef<ModalHandle>(null);
	const prefix = i18nKey === "SERIES" ? "s" : "v";

	return <div className="obj">
		<header>{t(`EVENTS.${i18nKey}.DETAILS.TOBIRA.PAGES`)}</header>
		<table className="main-tbl">
			<tbody>
				{tobiraData.hostPages.length === 0 && <tr>
					<td className="tobira-not-mounted">
						{t(`EVENTS.${i18nKey}.DETAILS.TOBIRA.NOT_MOUNTED`)}
						{i18nKey === "SERIES" && <ButtonLikeAnchor
							style={{ margin: 5 }}
							className="edit pull-right"
							onClick={() => openSubTab("edit-path")}
							tooltipText="EVENTS.SERIES.DETAILS.TOBIRA.MOUNT_SERIES"
						>
							<LuSquarePen className="pen" />
						</ButtonLikeAnchor>}
					</td>
				</tr>}
				{tobiraData.hostPages.map(hostPage => <tr key={hostPage.path}>
					<td>
						<a href={tobiraData.baseURL + hostPage.path +
							(tobiraData.id.length > 2 ? `/${prefix}/${tobiraData.id.substring(2)}` : "")}>
							{hostPage.path !== "/" && <>
								<span className="tobira-page-separator">/</span>
								{hostPage.ancestors.map((ancestor, key) => (
									<span key={key}>
										{ancestor.title}
										<span className="tobira-page-separator">/</span>
									</span>
								))}
							</>}
							<span className="tobira-leaf-page">
								{hostPage.path !== "/" && <span>
									{hostPage.title}
								</span>}
								{hostPage.path === "/" && <span>
									{t(`EVENTS.${i18nKey}.DETAILS.TOBIRA.HOMEPAGE`)}
								</span>}
							</span>
						</a>
						{i18nKey === "SERIES" && hostPage.blocks?.length === 1 && <>
							<ButtonLikeAnchor
								style={{ margin: 5 }}
								onClick={() => deleteConfirmationModalRef.current?.open()}
								className="action-cell-button remove pull-right"
								tooltipText="EVENTS.SERIES.DETAILS.TOBIRA.REMOVE_PATH"
							>
								<LuCircleX />
							</ButtonLikeAnchor>
							<ButtonLikeAnchor
								style={{ margin: 5 }}
								className="edit pull-right"
								onClick={() => openSubTab("edit-path", hostPage)}
								tooltipText="EVENTS.SERIES.DETAILS.TOBIRA.EDIT_PATH"
							>
								<LuSquarePen className="pen" />
							</ButtonLikeAnchor>
							<ConfirmModal
								close={() => deleteConfirmationModalRef.current?.close?.()}
								resourceName={hostPage.path}
								resourceId={null}
								deleteMethod={() => handleDelete(hostPage)}
								resourceType="TOBIRA_PATH"
								modalRef={deleteConfirmationModalRef}
							/>
						</>}
					</td>
				</tr>)}
			</tbody>
		</table>
	</div>;
};

export default DetailsTobiraTab;
