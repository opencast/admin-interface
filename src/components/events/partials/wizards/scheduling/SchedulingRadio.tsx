import { useTranslation } from "react-i18next";
import { Field } from "formik";
import { ParseKeys } from "i18next";

const SchedulingRadio = ({
	name,
	inputs,
}: {
	name: string,
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
							type="radio"
							value={input.id}
						/>
						{t(input.value as ParseKeys)}
					</label>
				),
			)}
		</>
	);
};

export default SchedulingRadio;
