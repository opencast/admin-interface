import { useEffect } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router";
import { Tooltip } from "react-tooltip";
import "./App.scss";
import Events from "./components/events/Events";
import Recordings from "./components/recordings/Recordings";
import Jobs from "./components/systems/Jobs";
import Themes from "./components/configuration/Themes";
import Users from "./components/users/Users";
import Statistics from "./components/statistics/Statistics";
import Series from "./components/events/Series";
import Servers from "./components/systems/Servers";
import Services from "./components/systems/Services";
import Groups from "./components/users/Groups";
import Acls from "./components/users/Acls";
import About from "./components/About";
import Playlists from "./components/events/Playlists";
import { useAppDispatch } from "./store";
import { fetchOcVersion, fetchUserInfo } from "./slices/userInfoSlice";
import { subscribeToAuthEvents } from "./utils/broadcastSync";
import { useTableFilterStateValidation } from "./hooks/useTableFilterStateValidation";
import { ErrorBoundary } from "react-error-boundary";
import opencastLogo from "./img/opencast-white.svg?url";

function App() {
	const dispatch = useAppDispatch();

	useTableFilterStateValidation();

	useEffect(() => {
		// Load information about current user on mount
		dispatch(fetchUserInfo());
		// Load information about current opencast version on mount
		dispatch(fetchOcVersion());

		// Subscribe to the auth event to follow the login - logout events!
		subscribeToAuthEvents();

		// Add event listener for back button to check if we are still logged in
		window.addEventListener("popstate", function () {
			dispatch(fetchUserInfo());
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<ErrorBoundary fallback={
			<>
				<header className="primary-header">
					{/* Opencast logo in upper left corner */}
					<div className="header-branding">
						<a href="/" target="_self" className="logo">
							<img src={opencastLogo} alt="Opencast Logo" />
						</a>
					</div>
				</header>
				<div className="about">
					Something went wrong. Please reload the page.
				</div>
			</>
		}>
			<HashRouter>
				<Routes>
					<Route path={"/events/events"} element={<Events />} />

					<Route path={"/events/series"} element={<Series />} />

					<Route path={"/events/playlists"} element={<Playlists />} />

					<Route path={"/recordings/recordings"} element={<Recordings />} />

					<Route path={"/systems/jobs"} element={<Jobs />} />

					<Route path={"/systems/servers"} element={<Servers />} />

					<Route path={"/systems/services"} element={<Services />} />

					<Route path={"/users/users"} element={<Users />} />

					<Route path={"/users/groups"} element={<Groups />} />

					<Route path={"/users/acls"} element={<Acls />} />

					<Route path={"/configuration/themes"} element={<Themes />} />

					<Route path={"/statistics/organization"} element={<Statistics />} />

					<Route path={"/about/imprint"} element={<About />} />

					<Route path={"/about/privacy"} element={<About />} />

					<Route
						path={"*"}
						element={<Navigate to={"/events/events"} replace />}
					/>
				</Routes>
				<Tooltip
					id="my-tooltip"
					clickable
					className="my-tooltip"
					delayShow={100}
					delayHide={150}
				/>
			</HashRouter>
		</ErrorBoundary>
	);
}

export default App;
