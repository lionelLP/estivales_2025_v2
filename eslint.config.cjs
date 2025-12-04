// eslint.config.cjs
module.exports = [
    {
        files: ["**/*.{js,jsx,ts,tsx}"],

        // Parser pour TypeScript
        languageOptions: {
            parser: require("@typescript-eslint/parser"),
            parserOptions: {
                ecmaVersion: 2021,
                sourceType: "module",
            },
            globals: {
                window: "readonly",
                document: "readonly",
                console: "readonly",
                process: "readonly",
            },
        },

        // Plugins
        plugins: {
            "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
            react: require("eslint-plugin-react"),
            "react-hooks": require("eslint-plugin-react-hooks"),
            jsxA11y: require("eslint-plugin-jsx-a11y"),
            import: require("eslint-plugin-import"),
        },

        rules: {
            "no-console": "off",
            "@typescript-eslint/no-unused-vars": "warn",
            "react/react-in-jsx-scope": "off",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
        },
    },
];
