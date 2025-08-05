import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";
import NewMetadataCommonPage from "../../../src/components/events/partials/ModalTabsAndPages/NewMetadataCommonPage";

const mockMetadata = {
  title: "Example Catalog",
  flavor: "dublincore",
  fields: [
    {
      id: "title",
      label: "Title",
      type: "text",
      required: false,
      readOnly: false,
      value: "",
    },
  ],
};

it("next button is disable when input empty, enabled when typing", async () => {
  render(
    <Formik initialValues={{ dublincoreTitle: "" }} onSubmit={() => {}}>
      {(formikProps) => (
        <NewMetadataCommonPage
          formik={formikProps}
          nextPage={() => {}}
          metadataFields={mockMetadata}
          header="NAV_HOME"
        />
      )}
    </Formik>,
  );

  const input = screen.getByRole("textbox");
  const button = screen.getByRole("button", { name: /next/i });

  expect(button).toBeDisabled();

  await userEvent.type(input, "Hello");

  expect(button).toBeEnabled();
});
