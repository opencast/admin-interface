import axios from "axios";

export const getSourceURL = async () => {
	try {
		// get source url
		const response = await axios.get<{ "org.opencastproject.engage.ui.url": string }>(
			"/api/info/organization/properties/engageuiurl",
		);

		const data = response.data;

		if (data["org.opencastproject.engage.ui.url"]) {
			return data["org.opencastproject.engage.ui.url"];
		} else {
			return "<SERVER_URL>";
		}
	} catch (_e) {
		return "<SERVER_URL>";
	}
};
