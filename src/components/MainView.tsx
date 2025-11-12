import React from "react";
import cn from "classnames";

/**
 * Component that renders the main view
 */
const MainView: React.FC<{ open: boolean, children: React.ReactNode }> = ({ open, children }) => {
	return (
		<main
			className={cn("main-view", { open: open })}
			role="main"
		>
			{children}
		</main>
	);
};

export default MainView;
