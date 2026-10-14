import { UploadAssetsTrack } from "./../slices/eventSlice";
import * as Yup from "yup";
import { MetadataCatalog } from "../slices/eventSlice";
import { AnySchema } from "yup";

/**
 * This File contains all schemas used for validation with yup in the context of events and series
 */

/**
 * Dynamically create a schema for a required metadata field
 */
export function createMetadataSchema(
	schema: { [key: string]: AnySchema; },
	config: { id: string; required: boolean; type: string; },
) {
	const { id, required, type } = config;
	if (!required) {
		return schema;
	}

	let validationType: "string" | "array" | "date" = "string";
	const validations: {
		type: string,
		params: unknown[],
	}[] = [
		{
			type: "required",
			params: ["this field is required"],
		},
	];

	if (type === "mixed_text") {
		validationType = "array";
		validations.push({
			type: "min",
			params: [1, "there should be atleast one entry"],
		});
	}

	if (type === "date" || type === "start_date") {
		validationType = "date";
	}

	if (!Yup[validationType as keyof typeof Yup]) {
		return schema;
	}
	let validator = Yup[validationType as "string"]();
	validations.forEach(validation => {
		const { params, type } = validation;
		// @ts-expect-error: Yup needs to fix their typing?
		if (!validator[type]) {
			return;
		}
		// @ts-expect-error: Yup needs to fix their typing?
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
		validator = validator[type](...params);
	});
	schema[id] = validator;
	return schema;
}

/**
 * Dynamically create a schema for required metadata fields
 */
export const MetadataSchema = (catalog: MetadataCatalog) => {
	const schema = catalog.fields.reduce(createMetadataSchema, {});
	const schemaKeyReplace: { [key: string]: AnySchema} = {};
	for (const [key, value] of Object.entries(schema)) {
		schemaKeyReplace[catalog.flavor + "_" + key] = value;
	}

	const validateSchema = Yup.object({
    metadata: Yup.object(schemaKeyReplace),
  });

	return validateSchema;
};


// Validation Schema used in new event wizard (each step has its own yup validation object)

export const NewEventSchema = {
	// For metadata validation see MetadataSchema
	"metadata": Yup.object().shape({}),
	"metadata-extended": Yup.object().shape({}),
	"source": Yup.object().shape({
		uploadAssetsTrack: Yup.array().when("sourceMode", {
			is: (value: string) => value === "UPLOAD",
			then: () => Yup.array().test(
				"at-least-one-uploaded",
				"at least one uploaded",
				(uploadAssetsTrack: UploadAssetsTrack[] | undefined) => {
					return uploadAssetsTrack && uploadAssetsTrack.some(asset => !!asset.file);
				},
			),
		}),
		scheduleStartDate: Yup.date().when("sourceMode", {
			is: (value: string) =>
				value === "SCHEDULE_SINGLE" || value === "SCHEDULE_MULTIPLE",
			then: () => Yup.date().required("Required"),
		}),
		scheduleEndDate: Yup.date().when("sourceMode", {
			is: "SCHEDULE_MULTIPLE",
			then: () => Yup.date().required("Required"),
		}),
		repeatOn: Yup.array().when("sourceMode", {
			is: "SCHEDULE_MULTIPLE",
			then: () => Yup.array().min(1).required("Required"),
		}),
		scheduleStartHour: Yup.string().when("sourceMode", {
			is: (value: string) =>
				value === "SCHEDULE_SINGLE" || value === "SCHEDULE_MULTIPLE",
			then: () => Yup.string().required("Required"),
		}),
		scheduleStartMinute: Yup.string().when("sourceMode", {
			is: (value: string) =>
				value === "SCHEDULE_SINGLE" || value === "SCHEDULE_MULTIPLE",
			then: () => Yup.string().required("Required"),
		}),
		scheduleDurationHours: Yup.string().when("sourceMode", {
			is: (value: string) =>
				value === "SCHEDULE_SINGLE" || value === "SCHEDULE_MULTIPLE",
			then: () => Yup.string().required("Required"),
		}),
		scheduleDurationMinutes: Yup.string().when("sourceMode", {
			is: (value: string) =>
				value === "SCHEDULE_SINGLE" || value === "SCHEDULE_MULTIPLE",
			then: () => Yup.string().required("Required"),
		}),
		scheduleEndHour: Yup.string().when("sourceMode", {
			is: (value: string) =>
				value === "SCHEDULE_SINGLE" || value === "SCHEDULE_MULTIPLE",
			then: () => Yup.string().required("Required"),
		}),
		scheduleEndMinute: Yup.string().when("sourceMode", {
			is: (value: string) =>
				value === "SCHEDULE_SINGLE" || value === "SCHEDULE_MULTIPLE",
			then: () => Yup.string().required("Required"),
		}),
		location: Yup.string().when("sourceMode", {
			is: (value: string) =>
				value === "SCHEDULE_SINGLE" || value === "SCHEDULE_MULTIPLE",
			then: () => Yup.string().required("Required"),
		}),
	}),
	"upload-asset": Yup.object().shape({}),
	"processing": Yup.object().shape({
		workflowId: Yup.string().required("Required"),
	}),
	"access": Yup.object().shape({}),
	"summary": Yup.object().shape({}),
};

// Validation Schema used in new series wizard (each step has its own yup validation object)
export const NewSeriesSchema = {
	// For metadata validation see MetadataSchema
	"metadata": Yup.object().shape({
		title: Yup.string().required("Required"),
	}),
	"metadata-extended": Yup.object().shape({}),
	"access": Yup.object().shape({}),
	"theme": Yup.object().shape({}),
	"tobira": Yup.object().shape({}),
	"summary": Yup.object().shape({}),
};

// Validation Schema used in new playlist wizard (each step has its own yup validation object)
export const NewPlaylistSchema = {
	// For metadata validation see MetadataSchema
	"metadata": Yup.object().shape({}),
	"entries": Yup.object().shape({}),
	"access": Yup.object().shape({}),
	"summary": Yup.object().shape({}),
};

// Validation Schema used in new themes wizard (each step has its own yup validation object)
export const NewThemeSchema = {
	"generalForm": Yup.object().shape({
		name: Yup.string().required("Required"),
	}),
	"bumperForm": Yup.object().shape({
		bumperFile: Yup.string().when("bumperActive", {
			is: true,
			then: () => Yup.string().required("Required"),
		}),
	}),
	"trailerForm": Yup.object().shape({
		trailerFile: Yup.string().when("trailerActive", {
			is: true,
			then: () => Yup.string().required("Required"),
		}),
	}),
	"titleSlideForm": Yup.object().shape({
		titleSlideBackground: Yup.string().when("titleSlideMode", {
			is: "upload",
			then: () => Yup.string().required("Required"),
		}),
	}),
	"watermarkForm": Yup.object().shape({
		watermarkFile: Yup.string().when("watermarkActive", {
			is: true,
			then: () => Yup.string().required("Required"),
		}),
	}),
	"summary": Yup.object().shape({}),
	// Theme details tabs
	"usage": Yup.object().shape({}),
};

// Validation Schema used in new ACL wizard (each step has its own yup validation object)
export const NewAclSchema = {
	"metadata": Yup.object().shape({
		name: Yup.string().required("Required"),
	}),
	"access": Yup.object().shape({}),
	"summary": Yup.object().shape({}),
};

// Validation Schema used in new groups wizard (each step has its own yup validation object)
export const NewGroupSchema = {
	"metadata": Yup.object().shape({
		name: Yup.string().required("Required"),
	}),
	"roles": Yup.object().shape({}),
	"users": Yup.object().shape({}),
	"summary": Yup.object().shape({}),
};

// Validation Schema used in new user wizard
export const NewUserSchema = (usernames: string[]) =>
	Yup.object().shape({
		username: Yup.string()
			.required("Required")
			.notOneOf(usernames, "not unique"),
		name: Yup.string().required("Required"),
		email: Yup.string().email().required("Required"),
		password: Yup.string().required("Required"),
		passwordConfirmation: Yup.string()
			.oneOf([Yup.ref("password"), undefined], "Passwords must match")
			.required("Required"),
	});

// Validation Schema used in user details modal
export const EditUserSchema = Yup.object().shape({
	name: Yup.string().required("Required"),
	email: Yup.string().email().required("Required"),
	passwordConfirmation: Yup.string().when("password", {
		is: (value: string) => !!value,
		then: () => Yup.string()
			.oneOf([Yup.ref("password"), undefined], "Passwords must match")
			.required("Required"),
	}),
});

export const PasswordSchema = Yup.object().shape({
	passwordConfirmation: Yup.string().when("password", {
		is: (value: string) => !!value,
		then: () => Yup.string()
			.oneOf([Yup.ref("password"), undefined], "Passwords must match")
			.required("Required"),
	}),
});

// Validation Schema used in group details modal
export const EditGroupSchema = Yup.object().shape({
	name: Yup.string().required("Required"),
});

// Validation Schema used in adopter registration modal
export const AdopterRegistrationSchema = Yup.object().shape({
	email: Yup.string().email(),
});

/**
 * Validation Schema used in lifecycle policy modal
 */
const filterItemSchema = Yup.object({
	filter: Yup.string().required("Required"),
	value: Yup.mixed().required("Required"),
	type: Yup.string().required("Required"),
	must: Yup.boolean(),
});

const targetFiltersSchema = Yup.object()
	.test(
		"has-at-least-one-array",
		"At least one filter group is required",
		function (obj) {
			if (!obj || typeof obj !== "object") { return false; }
			return Object.keys(obj).length > 0;
		},
	)
	.test(
		"has-at-least-one-item",
		"At least one filter must be defined",
		function (obj) {
			if (!obj || typeof obj !== "object") { return false; }

			let total = 0;

			for (const key of Object.keys(obj)) {
				const arr = (obj as Record<string, unknown>)[key];
				if (Array.isArray(arr)) {
					total += arr.length;
				}
			}

			return total > 0;
		},
	)
	.test(
		"validate-items",
		"Invalid filter structure",
		function (obj) {
			if (!obj || typeof obj !== "object") { return false; }

			for (const key of Object.keys(obj)) {
				const arr = (obj as Record<string, unknown>)[key];

				if (!Array.isArray(arr)) {
					return this.createError({
						message: `Filter "${key}" must be an array`,
					});
				}

				for (const item of arr) {
					try {
						filterItemSchema.validateSync(item);
					} catch (err) {
						return this.createError({ message: (err as Error).message });
					}
				}
			}

			return true;
		},
	);

export const LifeCyclePolicySchema = [
	Yup.object().shape({
		title: Yup.string().required("Required"),
		isActive: Yup.bool().required("Required"),
		targetType: Yup.string().required("Required"),
		timing: Yup.string().required("Required"),
		action: Yup.string().required("Required"),
		actionParameters: Yup.object().shape({
			// Property only required if it actually exists on the object
			workflowId: Yup.string().required("Required"),
			// workflowId: Yup.string().when("workflowId", {
			//  is: (exists: any) => !!exists,
			//  then: Yup.string().required("Required"),
			// }),
		}),
		actionDate: Yup.date().when("timing", {
			is: (timing: string) => timing === "SPECIFIC_DATE",
			then: () => Yup.date().required("Required"),
		}),
		cronTrigger: Yup.string().when("timing", {
			is: (timing: string) => timing === "REPEATING",
			then: () => Yup.string().required("Required"),
		}),
		targetFiltersTransformed: targetFiltersSchema,
	}),
];

