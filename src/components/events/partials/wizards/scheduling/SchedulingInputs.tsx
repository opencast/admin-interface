import { useTranslation } from "react-i18next";
import { Field } from "formik";

const SchedulingInputs = ({
	name = "inputs",
	inputs,
}: {
	// Name of the form field, that holds the ids of the selected inputs
	name?: string,
	inputs: {
		id: string,
		value: string
	}[]
}) => {
	const { t } = useTranslation();

	return (
		<>
			{inputs.map(
				(input, key) => (
					<label key={key}>
						<Field
							name={name}
							type="checkbox"
							value={input.id}
						/>
						{t(input.value, input.id)}
					</label>
				),
			)}
		</>
	);
};

export default SchedulingInputs;
