import { useTranslation } from "react-i18next";
import cn from "classnames";
import ButtonLikeAnchor from "../ButtonLikeAnchor";
import { ParseKeys } from "i18next";

/**
 * This component renders the navigation in details modals
 */
const ModalNavigation = ({
	tabInformation,
	page,
	openTab,
}: {
	tabInformation: {
		accessRole: string,
		tabTranslation: ParseKeys
	}[],
	page: number,
	openTab: (key: number) => unknown,
}) => {
	const { t } = useTranslation();

	return (
		<nav className="modal-nav" id="modal-nav">
			{tabInformation.map(
				(tab, key) =>
					<ButtonLikeAnchor
						key={key}
						extraClassName={cn({ active: page === key })}
						onClick={() => openTab(key)}
						editAccessRole={tab.accessRole}
					>
						{t(tab.tabTranslation)}
					</ButtonLikeAnchor>,
			)}
		</nav>
	);
};

export default ModalNavigation;
