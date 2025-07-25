import { useEffect, useState } from "react";
import Header from "./Header";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import axios from "axios";
import i18n from "../i18n/i18n";
import DOMPurify from "dompurify";

const About = () => {
	const { t } = useTranslation();
	const location = useLocation();

	const [displayNavigation, setNavigation] = useState(false);
	const [aboutContent, setAboutContent] = useState<string>("");

	useEffect(() => {
		const getURL = (language: string) => {
			return `/ui/config/admin-ui/${location.pathname.split("/").pop()}.${language}.html`;
		};

		// We should be getting HTML from the endpoint
		axios.get<string>(getURL(i18n.language))
			.then(response => {
				setAboutContent(response.data);
			})
			.catch(() => {
				axios.get<string>(getURL(typeof i18n.options.fallbackLng === "string" ? i18n.options.fallbackLng : "en-US"))
					.then(response => {
						setAboutContent(response.data);
					})
					.catch(error => {
						console.error("Error while fetching data:", error);
						setAboutContent(t("ABOUT.NOCONTENT").toString());
					});
			});
           // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname]); // Listen to changes in pathname

	return (
		<span>
			<Header />
			<NavBar
				displayNavigation={displayNavigation}
				setNavigation={setNavigation}
				links={[
					{
						path: "/about/imprint",
						accessRole: "ROLE_UI_USERS_VIEW",
						text: "ABOUT.IMPRINT",
					},
					{
						path: "/about/privacy",
						accessRole: "ROLE_UI_GROUPS_VIEW",
						text: "ABOUT.PRIVACY",
					},
				]}
			>
			</NavBar>
			<div className="about">
				<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(aboutContent) }} ></div>
			</div>
			<Footer />
		</span>
	);
};

export default About;
