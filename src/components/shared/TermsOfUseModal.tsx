import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Field, Formik } from "formik";
import cn from "classnames";
import axios from "axios";
import i18n from "../../i18n/i18n";
import DOMPurify from "dompurify";

// Generate URL for terms based on the languae
const getURL = (language: string) => {
	return `/ui/config/admin-ui/terms.${language}.html`;
};

const TermsOfUseModal = () => {
	const { t } = useTranslation();
	const [termsContent, setTermsContent] = useState("");
	const [agreedToTerms, setAgreedToTerms] = useState(true);

	// Check if already accepted terms
	useEffect(() => {
		const checkTerms = async () => {
			try {
				type FetchUserSettings = {
					total: number,
					offset: number,
					limit: number,
					results: {
						id: number,
						value: string,
						key: string
					}[]
				};
				const response = await axios.get<FetchUserSettings>("/admin-ng/user-settings/settings.json");
				const agreedResult = response.data.results.find(result => result.key === "agreedToTerms");
				const isAgreed = agreedResult?.value === "true";
				setAgreedToTerms(isAgreed);
			} catch (error) {
				console.error("Error while retrieving data: ", error);
				setAgreedToTerms(false);
			}
		};

		checkTerms();
	}, []);

	// Fetch terms
	useEffect(() => {
		axios.get<string>(getURL(i18n.language))
			.then(response => {
				setTermsContent(response.data);
			})
			.catch(() => {
				axios.get<string>(getURL(typeof i18n.options.fallbackLng === "string" ? i18n.options.fallbackLng : "en-US"))
					.then(response => {
						setTermsContent(response.data);
					})
					.catch(error => {
						console.error("Error while fetching data:", error);
						setTermsContent(t("TERMS.NOCONTENT"));
					});
			});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [agreedToTerms]); // Listen to changes in agreedToTerms

	// Set terms to user settings
	const handleSubmit = async (values: {agreedToTerms: boolean}) => {
		const body = new URLSearchParams();
		body.append("key", "agreedToTerms");
		body.append("value", values.agreedToTerms ? "true" : "false");

		await axios.post("/admin-ng/user-settings/setting", body, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});
		setAgreedToTerms(true);
	};

	// If already accepted terms, dont display anything
	if (agreedToTerms) {
		return null;
	}

	// Else display terms
	return (
		<>
			<div className="modal-animation modal-overlay" />
			<section id="registration-modal" className="modal active modal-open modal-animation">
				<header>
					<h2>{t("TERMS.TITLE")}</h2>
				</header>

				<div className="modal-content" style={{ display: "block" }}>
					<div className="modal-body">
						<div>
							<div className="row">
								<div className="scrollbox">
									<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(termsContent) }} ></div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<Formik
					initialValues={{ agreedToTerms: false }}
					enableReinitialize
					onSubmit={handleSubmit}
				>
					{formik => (<>
						<div className="modal-content" style={{ display: "block" }}>
							<div className="modal-body">
								<div>
									<fieldset>
										<legend>{t("TERMS.TITLE")}</legend>
										<div className="form-group form-group-checkbox">
											<Field
												type="checkbox"
												name="agreedToTerms"
												id="agreedToTerms"
												className="form-control"
											/>
											<label htmlFor="agreedToTerms">
												<span>{t("TERMS.AGREE")}</span>
											</label>
										</div>
									</fieldset>
								</div>
							</div>
						</div>

						<footer>
							<div className="pull-right">
								<button
									disabled={
										!(formik.isValid && formik.values.agreedToTerms)
									}
									onClick={() => formik.handleSubmit()}
									className={cn("submit", {
										active:
											formik.isValid && formik.values.agreedToTerms,
										inactive: !(
											formik.isValid && formik.values.agreedToTerms
										),
									})}
								>
									{t("SUBMIT")}
								</button>
							</div>
						</footer>
					</>)}
				</Formik>
			</section>
		</>
	);
};

export default TermsOfUseModal;
