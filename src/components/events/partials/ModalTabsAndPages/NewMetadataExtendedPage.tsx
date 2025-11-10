import { FormikProps } from "formik";
import WizardNavigationButtons from "../../../shared/wizard/WizardNavigationButtons";
import { MetadataCatalog } from "../../../../slices/eventSlice";
import NewMetadataPage from "./NewMetadataPage";

const NewMetadataExtendedPage = <T, >({
	formik,
	nextPage,
	previousPage,
	extendedMetadataFields,
}: {
	formik: FormikProps<T>,
	nextPage: (values: T) => void,
	previousPage: (values: T, twoPagesBack?: boolean) => void,
	extendedMetadataFields: MetadataCatalog[],
}) => {

	return (
		<>
			<NewMetadataPage
				metadataCatalogs={extendedMetadataFields}
			/>

			{/* Button for navigation to next page */}
			<WizardNavigationButtons
				noValidation
				nextPage={nextPage}
				previousPage={previousPage}
				formik={formik}
			/>
		</>
	);
};

export default NewMetadataExtendedPage;
