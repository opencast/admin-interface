import { useTranslation } from "react-i18next";
import { getMetadataCollectionFieldName } from "../../../../../utils/resourceUtils";
import { MetadataCatalog } from "../../../../../slices/eventSlice";
import { isEmpty } from "lodash";
import { isEmptyArray } from "formik";
import { ParseKeys } from "i18next";

/**
 * This component renders the metadata table containing access rules provided by user before in wizard summary pages
 */
const MetadataSummaryTable = ({
	metadataCatalogs,
	formikValues,
	header,
}: {
	metadataCatalogs: MetadataCatalog[],
	formikValues: { [key: string]: string | string[] | boolean | Date },
	header: ParseKeys,
}) => {
	const { t } = useTranslation();

	// metadata that user has provided
	const catalogs = [];
	for (const catalog of metadataCatalogs) {
		const metadataFields = catalog.fields;
		let metadata: {
			name: string,
			label: string,
			value: string | string[] | boolean,
		}[] = [];
		for (let i = 0; metadataFields.length > i; i++) {
			let fieldValue =
				formikValues[catalog.flavor + "_" + metadataFields[i].id];

			if (fieldValue === true) {
				fieldValue = "true";
			} else if (fieldValue === false) {
				fieldValue = "false";
			}

			if (!!fieldValue && (!isEmpty(fieldValue) || !isEmptyArray(fieldValue))) {
				const collection = metadataFields[i].collection;
				if (
					metadataFields[i].type === "text" &&
					!!collection &&
					collection.length > 0
				) {
					fieldValue = getMetadataCollectionFieldName(
						metadataFields[i],
						{
							value: fieldValue,
						},
						t,
					);
				}

				if (fieldValue instanceof Date) {
					fieldValue = t("dateFormats.dateTime.short", { dateTime: fieldValue });
				}

				metadata = metadata.concat({
					name: metadataFields[i].id,
					label: metadataFields[i].label,
					value: fieldValue,
				});
			}
		}
		catalogs.push(metadata);
	}

	return (
		<div className="obj tbl-list">
			<header className="no-expand">{t(header)}</header>
			<div className="obj-container">
				{catalogs.map((catalog, key) => (
					<table key={key} className="main-tbl">
						<tbody>
							{/* Insert row for each metadata entry user has provided*/}
							{catalog.map((entry, key) => (
								<tr key={key}>
									<td>{t(entry.label as ParseKeys)}</td>
									<td>
										{Array.isArray(entry.value)
											? entry.value.join(", ")
											: entry.value}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				))}
			</div>
		</div>
	);
};

export default MetadataSummaryTable;
