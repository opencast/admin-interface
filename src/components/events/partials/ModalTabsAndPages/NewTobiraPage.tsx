import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { FormikProps } from "formik";
import Notifications from "../../../shared/Notifications";
import { OurNotification, addNotification, removeNotificationByKey, removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { TobiraPage, fetchSeriesDetailsTobiraNew, setErrorTobiraPage, setTobiraPage } from "../../../../slices/seriesSlice";
import { getSeriesTobiraPage, getSeriesTobiraPageError } from "../../../../selectors/seriesSeletctor";
import { NOTIFICATION_CONTEXT_TOBIRA } from "../../../../configs/modalConfig";
import { SaveEditFooter } from "../../../shared/SaveEditFooter";
import { Tooltip } from "../../../shared/Tooltip";
import ModalContent from "../../../shared/modals/ModalContent";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import { LuChevronRight, LuCircleX } from "react-icons/lu";

/**
 * This component renders the theme page for new series in the new series wizard.
 */
export type TobiraFormProps = {
	breadcrumbs: TobiraPage[],
	selectedPage?: TobiraPage,
	currentPath?: string,
}

const NewTobiraPage = <T extends TobiraFormProps>({
	formik,
	nextPage,
	previousPage,
	mode,
}: {
	formik: FormikProps<T>,
	nextPage: (values: T) => void,
	previousPage:(values: T) => void,
	editMode?: boolean,
	mode: {
		edit?: boolean,
		mount?: boolean,
	},
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const [isValid, setIsValid] = useState(false);
	const [editing, setEditing] = useState(false);

	const error = useAppSelector(state => getSeriesTobiraPageError(state));
	const currentPage = useAppSelector(state => getSeriesTobiraPage(state));

	// Check if valid
	useEffect(() => {
		function check(
			type: OurNotification["type"],
			key: OurNotification["key"],
			context: OurNotification["context"],
			callback: () => boolean,
		) {
			const toggle = callback();
			if (toggle) {
				dispatch(addNotification({
					type: type,
					key: key,
					duration: -1,
					context: context,
					noDuplicates: true,
				}));
			} else {
				dispatch(removeNotificationByKey({ key, context }));
			}

			if (toggle && type !== "info") {
				return false;
			}

			return true;
		}

		let valid = true;

		valid = valid && check("info", "TOBIRA_OVERRIDE_NAME", NOTIFICATION_CONTEXT_TOBIRA, () => {
			return !!formik.values.selectedPage && !!formik.values.selectedPage.title;
		});

		if (!editing) {
			dispatch(removeNotificationWizardForm());
			setIsValid(valid);
			return;
		}

		if (currentPage.children.length === 0) {
			setIsValid(valid);
			return;
		}
		const newPage = currentPage.children[currentPage.children.length - 1];

		valid = valid && check("warning", "TOBIRA_NO_PATH_SEGMENT", NOTIFICATION_CONTEXT_TOBIRA, () => !newPage.segment);

		valid = valid && check("warning", "TOBIRA_PATH_SEGMENT_INVALID", NOTIFICATION_CONTEXT_TOBIRA, () => (
			newPage.segment.length <= 1 || [
				// eslint-disable-next-line no-control-regex
				/[\u0000-\u001F\u007F-\u009F]/u,
				/[\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/u,
				/[<>"[\\\]^`{|}#%/?]/u,
				/^[-+~@_!$&;:.,=*'()]/u,
			].some(regex => regex.test(newPage.segment))
		));

		valid = valid && check("warning", "TOBIRA_PATH_SEGMENT_UNIQUE", NOTIFICATION_CONTEXT_TOBIRA, () => (
			currentPage.children.some(child => child !== newPage && child.segment === newPage.segment)
		));

		setIsValid(valid);
	}, [currentPage.children, dispatch, editing, formik.values.selectedPage]);

	const back = (index: number) => {
		goto(formik.values.breadcrumbs.splice(index)[0]);
	};

	const select = (page?: TobiraPage) => {
		if (!page || !page.new) {
			setEditing(false);
		}
		if (!page || formik.values.selectedPage === page) {
			formik.setFieldValue("selectedPage", undefined);
		} else {
			formik.setFieldValue("selectedPage", page);
		}
	};

	const updatePath = (page: TobiraPage, lastSegment: string) => {
		return formik.values.breadcrumbs
			.concat(page)
			.map(page => page.segment)
			.join("/")
			.replace(/([^/]+$)/, lastSegment);
	};

	const goto = (page: TobiraPage) => {
		dispatch(removeNotificationWizardForm());
		setErrorTobiraPage(null);

		if (page.new) {
			select(undefined);
			dispatch(setTobiraPage(page));
			formik.setFieldValue("breadcrumbs", [...formik.values.breadcrumbs, page]);
		} else {
			// fetch tobira resource
			dispatch(fetchSeriesDetailsTobiraNew(page.path));
		}
	};

	useEffect(() => {
		// After changing to another page
		if (formik.values.breadcrumbs.length === 0
			|| (formik.values.breadcrumbs.length > 0
				&& formik.values.breadcrumbs[formik.values.breadcrumbs.length - 1].path !== currentPage.path
			)
		) {
			select(undefined);
			formik.setFieldValue("breadcrumbs", [...formik.values.breadcrumbs, currentPage]);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage]);

	const addChild = () => {
		setEditing(true);
		const newPage: TobiraPage = {
			new: true,
			children: [],
			ancestors: [],
			path: "",
			subpages: "",
			blocks: [],
			segment: "",
		};
		dispatch(setTobiraPage({ ...currentPage, children: [...currentPage.children, newPage] }));
	};

	const setPage = (
		key: number,
		e: React.ChangeEvent<HTMLInputElement>,
		kind: "title" | "segment",
	) => dispatch(setTobiraPage({
		...currentPage,
		children: currentPage.children.map((p, k) => {
			if (k === key) {
				const newPage = {
					...p,
					...kind === "title"
						? { title: e.target.value }
						: {
							path: updatePath({ ...p, segment: e.target.value }, e.target.value),
							segment: e.target.value,
						},
				};

				return newPage;
			}
			return { ...p };
		}),
	}));

	// This will either highlight the selected page
	// (first condition),
	// or the page the series is currently mounted in,
	// if no other page is selected (second condition).
	// It is also used to disable the text input of the title field
	// for newly added sub-pages.
	const checkboxActive = (page: TobiraPage, key: number) => (
		isValid && formik.values.selectedPage?.path === currentPage.children[key].path
	) || (
		page.path === formik.values.currentPath && !formik.values.selectedPage
	);

	return <>
		<ModalContent>
			<p className="tab-description">{t("EVENTS.SERIES.NEW.TOBIRA.DESCRIPTION")}</p>
			{!error && <>
				<div className="obj-container padded">
					<div className="obj">
						<header>
							<span>{t("EVENTS.SERIES.NEW.TOBIRA.SELECT_PAGE")}</span>
						</header>
						<div className="breadcrumb">
							{formik.values.breadcrumbs.map((breadcrumb, key) => (
								<ButtonLikeAnchor
									key={key}
									className="breadcrumb-link"
									onClick={() => back(key)}
								>
									{breadcrumb.segment === ""
										? t("EVENTS.SERIES.NEW.TOBIRA.HOMEPAGE")
										: breadcrumb.title
									}
								</ButtonLikeAnchor>
							))}
						</div>
						<table className="main-tbl highlight-hover">
							<thead>
								<tr>
									{currentPage.children.length > 0 && <th className="small"/>}
									<th>
										{t("EVENTS.SERIES.NEW.TOBIRA.PAGE_TITLE") /* Title */}
									</th>
									<th>
										{t("EVENTS.SERIES.NEW.TOBIRA.PATH_SEGMENT") /* Path segment */}
									</th>
									<th>
										{t("EVENTS.SERIES.NEW.TOBIRA.SUBPAGES") /* Sub-pages */}
									</th>
									{editing && <th />}
								</tr>
							</thead>
							<tbody>
								{currentPage.children.map((page, key) => <tr key={key}>
									<Tooltip
										title={t("EVENTS.SERIES.NEW.TOBIRA.MOUNT_DISCLAIMER")}
										active={!!page.blocks?.length}
										placement="left"
									>
										<td>
											<input
												type="checkbox"
												checked={checkboxActive(page, key)}
												disabled={!!page.blocks?.length}
												onChange={() => page.blocks?.length || select(page)}
											/>
										</td>
									</Tooltip>
									<td>
										{page.new
											? <input
												placeholder={t("EVENTS.SERIES.NEW.TOBIRA.PAGE_TITLE")}
												disabled={checkboxActive(page, key)}
												value={checkboxActive(page, key)
													? t("EVENTS.SERIES.NEW.TOBIRA.TITLE_OF_SERIES")
													: (page.title ?? "")
												}
												onChange={e => setPage(key, e, "title")}
											/>
											: <ButtonLikeAnchor
												className={
													(!page.blocks?.length
														? "tobira-selectable"
														: "tobira-button-disabled"
													)
												}
												disabled={!!page.blocks?.length}
												onClick={() => page.blocks?.length || select(page)}
											>{checkboxActive(page, key) && formik.values.selectedPage
												? t("EVENTS.SERIES.NEW.TOBIRA.TITLE_OF_SERIES")
												: page.title
											}</ButtonLikeAnchor>
										}
									</td>
									<td>
										<code className="tobira-path">
											{page.new
												? <input
													placeholder={t("EVENTS.SERIES.NEW.TOBIRA.PATH_SEGMENT")}
													value={page.segment ?? ""}
													onChange={e => setPage(key, e, "segment")}
												/>
												: <span style={{ fontWeight: "inherit" }}>
													{page.segment}
												</span>
											}
										</code>
									</td>
									<td>
										{((!page.new || isValid) && page.title) && <ButtonLikeAnchor
											className="details-link"
											onClick={() => goto(page)}
										>
											{t("EVENTS.SERIES.NEW.TOBIRA.SUBPAGES")}
											<LuChevronRight className="details-link-icon"/>
										</ButtonLikeAnchor>}
									</td>
									{editing && <td>
										{page.new && <ButtonLikeAnchor
											onClick={() => {
												dispatch(setTobiraPage({
													...currentPage,
													children: currentPage.children.filter((_, idx) => (
														idx !== currentPage.children.length - 1
													)),
												}));
												select(undefined);
											}}
											title={t("EVENTS.SERIES.NEW.TOBIRA.CANCEL")}
											className="action-cell-button remove"
										>
											<LuCircleX />
										</ButtonLikeAnchor>}
									</td>}
								</tr>)}
								{!editing && <tr>
									<td colSpan={4}>
										<ButtonLikeAnchor
											onClick={() => addChild()}
										>
											+ {t("EVENTS.SERIES.NEW.TOBIRA.ADD_SUBPAGE")}
										</ButtonLikeAnchor>
									</td>
								</tr>}
							</tbody>
						</table>
					</div>
					{/* Notifications */}
					<Notifications context={NOTIFICATION_CONTEXT_TOBIRA} />
				</div>

				<p style={{ margin: "12px 0", fontSize: 12 }}>
					{(!!formik.values.selectedPage && formik.values.selectedPage?.path !== "" && isValid)
						? <>
							{t("EVENTS.SERIES.NEW.TOBIRA.SELECTED_PAGE")}:
							<code className="tobira-path">
								{formik.values.selectedPage?.path}
							</code>
						</>
						: (mode.edit && !mode.mount
							? t("EVENTS.SERIES.NEW.TOBIRA.NO_PAGE_SELECTED_EDIT")
							: t("EVENTS.SERIES.NEW.TOBIRA.NO_PAGE_SELECTED")
						)
					}
				</p>
				{!mode.edit && <p style={{ fontSize: 12 }}>{t("EVENTS.SERIES.NEW.TOBIRA.DIRECT_LINK")}</p>}
			</>}
		</ModalContent>
		{/* Render buttons for saving or resetting updated path */}
		{mode.edit && <SaveEditFooter
			active={formik.values.selectedPage !== undefined}
			reset={() => formik.setFieldValue("selectedPage", undefined)}
			submit={() => formik.handleSubmit()}
			{...{ isValid }}
		/>}

		{/* Button for navigation to next page and previous page */}
		{!mode.edit && <WizardNavigationButtons
			formik={formik}
			nextPage={nextPage}
			previousPage={previousPage}
			customValidation={!isValid}
		/>}
	</>;
};

export default NewTobiraPage;
