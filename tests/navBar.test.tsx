import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import NavBar from "../src/components/NavBar";
import renderWithStore from "./navBarSetupStore";

describe("NavBar", () => {
  it("renders Add button and calls onShowModal when clicked", async () => {
    const onShowModal = vi.fn();

    const preloadedState = {
      userInfo: {
        user: { name: "Test User" },
        roles: ["admin"],
        org: { id: "org1", properties: {} },
      },
      events: {
      uploadSourceOptions: [],
      uploadAssetOptions: [],
      isFetchingAssetUploadOptions: false,
      metadata: { title: "event", flavor: "someFlavor", fields: [] },
      extendedMetadata: [],
      total: 0,
  },
    };

    const { getByRole } = renderWithStore(
      <NavBar
        displayNavigation={true}
        setNavigation={() => {}}
        links={[]}
        create={{
          accessRole: "admin",
          text: "SUBMIT",
          resource: "events",
          onShowModal,
          onHideModal: () => {},
          isDisplay: true,
        }}
      />,
      preloadedState
    );

    const user = userEvent.setup();

    const button = getByRole("button", { name: /submit/i });
    await user.click(button);

    expect(onShowModal).toHaveBeenCalled();
  });
});
