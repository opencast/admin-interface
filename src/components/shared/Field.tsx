import { FastField as FormikFastField, FastFieldConfig } from "formik";

/**
 * Wrapper for the Formik Fields.
 *
 * `FormikFastField` itself is typed as `React.FC<any>`, so
 * `React.ComponentProps<typeof FormikFastField>` would just resolve to `any`.
 * We derive from Formik's own `FastFieldConfig` instead (rather than hand-
 * copying its shape), so this stays correct if Formik's config props change.
 * `component`/`as` are re-typed more loosely than Formik declares them: this
 * app passes app-specific extra props (e.g. `metadataField`) into custom
 * components via sibling attributes on `<Field>`, which isn't something
 * Formik's own types can verify either - it types its `Field` the same way.
 */
type FieldProps<V> = Omit<FastFieldConfig<V>, "component" | "as"> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: string | React.ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as?: string | React.ComponentType<any>,
} & Record<string, unknown>;

export const Field = <V = string>(props: FieldProps<V>) => {
  return (
    <FormikFastField
      {...props}
      onKeyDown={(event: KeyboardEvent) => {
        // Handler for basic html inputs to remove focus, if no custom component is passed
        if (event.key === "Enter" || event.key === "Escape") {
          (event.currentTarget as HTMLInputElement).blur();
        }
      }}
    />
  );
};
