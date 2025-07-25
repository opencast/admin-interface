import React from "react";
import ReactDOMClient from "react-dom/client";
import "./index.css";
import App from "./App";
import axios from "axios";

// redux imports
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/lib/integration/react";
import { Provider } from "react-redux";
import store from "./store";

// import i18n (needs to be bundled)
import "./i18n/i18n";

// import css files for certain libraries
import "font-awesome/css/font-awesome.min.css";
import "react-datepicker/dist/react-datepicker.css";
import { HotkeysProvider } from "react-hotkeys-hook";


// Commenting persistent stuff out can help with debugging
const persistor = persistStore(store);

if (import.meta.env.DEV && import.meta.env.VITE_TEST_SERVER_URL) {
	axios.defaults.baseURL = import.meta.env.VITE_TEST_SERVER_URL || "";
	if (import.meta.env.VITE_TEST_SERVER_AUTH) {
		axios.defaults.headers.common["Authorization"] = "Basic " + window.btoa(import.meta.env.VITE_TEST_SERVER_AUTH);
	}
}

const container = document.getElementById("root");
if (!container) {
	throw new Error("Failed to find the root element");
}
const root = ReactDOMClient.createRoot(container);

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<PersistGate loading={<div>loading...</div>} persistor={persistor}>
				<HotkeysProvider>
					<App />
				</HotkeysProvider>
			</PersistGate>
		</Provider>
	</React.StrictMode>,
);
