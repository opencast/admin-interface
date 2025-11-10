import axios from "axios";

// get information about adopter
export const fetchAdopterRegistration = async () => {
	type FetchRegistration = {
		contactMe: boolean,
		allowsStatistics: boolean,
		allowsErrorReports: boolean,
		agreedToPolicy: boolean,
		registered: boolean,
		termsVersionAgreed: string,
		deleteMe: boolean,
	};
	// fetch current information about adopter
	const response = await axios.get<FetchRegistration>("/admin-ng/adopter/registration");

	return response.data;
};

// get statistics information about adopter
export const fetchAdopterStatisticsSummary = async () => {
	type FetchSummary = {
		general: {
			contact_me: boolean,
			send_errors: boolean,
			send_usage: boolean,
		},
		statistics: {
			job_count: number,
			event_count: number,
			series_count: number,
			user_count: number,
			ca_count: number,
			total_minutes: number,
			tenant_count: number,
			hosts: {
				cores: number,
				max_load: number,
				memory: number,
				hostname: string,
				disk_space: number,
				services: string,
			}[]
		},
	};
	const response = await axios.get<FetchSummary>("/admin-ng/adopter/summary");

	return response.data;
};

export type Registration = {
	contactMe: boolean,
 	systemType: string,
	allowsStatistics: boolean,
	allowsErrorReports: boolean,
	organisationName: string,
	departmentName: string,
	country: string,
	postalCode: string,
	city: string,
	firstName: string,
	lastName: string,
	street: string,
	streetNo: string,
	email: string,
	agreedToPolicy: boolean,
}

// post request for adopter information
export const postRegistration = async (
	values: Registration,
) => {
	// build body
	const body = new URLSearchParams();
	body.append("contactMe", values.contactMe.toString());
	body.append("systemType", values.systemType);
	body.append("allowsStatistics", values.allowsStatistics.toString());
	body.append("allowsErrorReports", values.allowsErrorReports.toString());
	body.append("organisationName", values.organisationName);
	body.append("departmentName", values.departmentName);
	body.append("country", values.country);
	body.append("postalCode", values.postalCode);
	body.append("city", values.city);
	body.append("firstName", values.firstName);
	body.append("lastName", values.lastName);
	body.append("street", values.street);
	body.append("streetNo", values.streetNo);
	body.append("email", values.email);
	body.append("agreedToPolicy", values.agreedToPolicy.toString());
	body.append("registered", "true");

	// save adopter information and return next state
	await axios.post("/admin-ng/adopter/registration", body, {
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	});
};

// delete adopter information
export const deleteAdopterRegistration = async () => {
	// delete adopter information
	await axios.delete("/admin-ng/adopter/registration", {
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	});
};
