import opencastConfig from "@opencast/eslint-config-ts-react";

export default [
    ...opencastConfig,

    // Fully ignore some files
    {
        ignores: ["build/"],
    },

    {
        rules: {
            // TODO: We want to turn these on eventually
            "indent": "off",
            "max-len": "off",
            "no-tabs": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/no-misused-promises": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/require-await": "off",
        },
    },
];

