import { ReactNode, useState } from "react";
import Header from "../Header";
import NavBar, { CreateType, NavBarLink } from "../NavBar";
import MainView from "../MainView";
import Footer from "../Footer";

/**
 * This component renders a generic page with a table
 */
const MainPage = ({
	navBarLinks,
	navBarCreate,
	navBarChildren,
	children,
}: {
	navBarLinks: NavBarLink[]
	navBarCreate?: CreateType
	navBarChildren?: ReactNode
	children?: ReactNode
}) => {
	const [displayNavigation, setNavigation] = useState(false);

	return (
		<>
			<Header />
			<NavBar
				displayNavigation={displayNavigation}
				setNavigation={setNavigation}
				links={navBarLinks}
				create={navBarCreate}
			>
				{navBarChildren}
			</NavBar>

			<MainView open={displayNavigation}>
				{children}
			</MainView>
			<Footer />
		</>
	);
};

export default MainPage;
