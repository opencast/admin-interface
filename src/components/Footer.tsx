import React from "react";
import {
	getOrgProperties,
	getUserInformation,
} from "../selectors/userInfoSelectors";
import { useAppSelector } from "../store";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Tooltip } from "./shared/Tooltip";

/**
 * Component that renders the footer
 */

const Footer: React.FC = () => {
	const { t } = useTranslation();
	const feedbackUrlPropertyId = "org.opencastproject.admin.feedback.url";

	const user = useAppSelector(state => getUserInformation(state));
	const orgProperties = useAppSelector(state => getOrgProperties(state));

	const version = (user?.ocVersion?.version ?? "")
		.replace(/0\.0\.SNAPSHOT/, "x")
		.replace(/\.([0-9]+)\.0/, ".$1");
	const lastModified = user?.ocVersion?.["last-modified"]
		? new Date(user.ocVersion["last-modified"]).toISOString().substring(0, 10)
		: "unknown";
	const aboutEnabled = (orgProperties["org.opencastproject.admin.display_about"] || "false").toLowerCase() === "true";

	return (
		<footer id="main-footer">
			<div className="default-footer">
				<ul>
					{/* Only render if a version is set */}
					{user.ocVersion && (
						<li>
							{"Opencast "}
							<Tooltip title={t("BUILD.VERSION")}><span>{version}</span></Tooltip>
							{user.isAdmin && (
								<span>
								{user.ocVersion.buildNumber && (
									<>{" – "} <Tooltip title={t("BUILD.COMMIT")}><span>{user.ocVersion.buildNumber}</span></Tooltip></>
								)}
								{lastModified && (
									<>{" – "} <Tooltip title={t("BUILD.DATE_DESC")}><span>{t("BUILD.BUILT_ON")} {lastModified}</span></Tooltip></>
								)}
								</span>
							)}
						</li>
					)}
					{aboutEnabled && (
						<>
						<li><Link to="/about/imprint">{t("ABOUT.IMPRINT")}</Link></li>
						<li><Link to="/about/privacy">{t("ABOUT.PRIVACY")}</Link></li>
						</>
					)}
				</ul>

				{/* Only render if a feedback URL is set*/}
				{!!orgProperties && !!orgProperties[feedbackUrlPropertyId] && (
					<div className="feedback-btn" id="feedback-btn">
						<a href={orgProperties[feedbackUrlPropertyId]}>Feedback</a>
					</div>
				)}
			</div>
		</footer>
	);
};

export default Footer;
