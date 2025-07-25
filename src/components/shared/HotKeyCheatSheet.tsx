import React from "react";
import { useTranslation } from "react-i18next";
import { availableHotkeys } from "../../configs/hotkeysConfig";
import { useHotkeysContext } from "react-hotkeys-hook";
import { Hotkey } from "react-hotkeys-hook/packages/react-hotkeys-hook/dist/types";
import { Modal, ModalHandle } from "./modals/Modal";
import { ParseKeys } from "i18next";
import ModalContentTable from "./modals/ModalContentTable";

/**
 * This component renders the hotkey cheat sheet showing all available hotkeys
 */
const HotKeyCheatSheet = ({
	modalRef,
}: {
	modalRef: React.RefObject<ModalHandle | null>
}) => {
	const { t } = useTranslation();
	const { hotkeys } = useHotkeysContext();

	const checkHotkeys = (hotkeys: readonly Hotkey[], searchkeys: string[]) => {
		for (const hotkey of hotkeys) {
			if (!hotkey.keys) { continue; }
			if (hotkey.keys.length !== searchkeys.length) { continue; }
			if (hotkey.keys.every((element, index) => element === searchkeys[index])) {
				return true;
			}
		}

		return false;
	};

	return (
		<Modal
			header={t("HOTKEYS.CHEAT_SHEET.TITLE")}
			classId=""
			ref={modalRef}
		>
			<ModalContentTable modalContentClassName="modal-content active">
				<p className="hint">{t("HOTKEYS.CHEAT_SHEET.HINT")}</p>
				{/* Repeat table for each key */}
				{Object.keys(availableHotkeys).map((hotkeyGroup, key) => (
					<div className="obj tbl-list" key={key}>
						<header>
							{t(`HOTKEYS.GROUPS.${hotkeyGroup.toUpperCase()}` as ParseKeys)}
						</header>
						<table className="main-tbl">
							<tbody>
								{/* Repeat row for each hotkey in group*/}
								{Object.keys(availableHotkeys[hotkeyGroup]).map(
									(hotkey, key) => (
										<tr key={key} style={{ opacity: !(hotkeys && checkHotkeys(hotkeys, availableHotkeys[hotkeyGroup][hotkey].sequence)) ? "50%" : "100%" }}>
											<td className="hotkey">
												<p className="combo">
													<span className="chord">
														{/* repeat for each key in hotkey */}
														{availableHotkeys[hotkeyGroup][
															hotkey
														].sequence.map((comboKey, key) => (
															<span key={key}>
																<span>
																	<span className="key">
																		{t(
																			"HOTKEYS.KEYS." +
																				comboKey.toUpperCase(),
																			comboKey,
																		)}
																	</span>
																</span>
																{comboKey ===
																availableHotkeys[hotkeyGroup][hotkey]
																	.sequence[
																	availableHotkeys[hotkeyGroup][hotkey]
																		.sequence.length - 1
																]
																	? ""
																	: " + "}
															</span>
														))}
													</span>
												</p>
											</td>
											<td>
												{t(
													availableHotkeys[hotkeyGroup][hotkey]
														.description,
												)}
											</td>
										</tr>
									),
								)}
							</tbody>
						</table>
					</div>
				))}
			</ModalContentTable>
		</Modal>
	);
};

export default HotKeyCheatSheet;
