import { render, screen } from "@testing-library/react";
import Users from "../../src/components/users/Users";
import { createServer } from "../server";
import { renderWithStore } from "./usersSetupStore";

createServer([
  {
    path: "/admin-ng/users/users.json",
    method: "get",
    res: (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          limit: 10,
          count: 1,
          offset: 0,
          total: 1,
          results: [
            {
              provider: "system",
              manageable: true,
              name: "Test User",
              username: "testuser",
              email: "testuser@example.com",
              roles: [{ name: "ROLE_USER", type: "INTERNAL" }],
            },
          ],
        }),
      );
    },
  },
  {
    path: "/services/health.json",
    method: "get",
    res: (_, res, ctx) => res(ctx.json({ healthy: true })),
  },

  {
    path: "/admin-ng/resources/users/filters.json",
    method: "get",
    res: (_, res, ctx) => res(ctx.json([])),
  },
]);

describe("username", () => {
  it("displays users from the backend in the table", async () => {
    renderWithStore(<Users />, {}, "/users/");

    const userInTable = await screen.findByText(/Test User/i);
    expect(userInTable).toBeInTheDocument();
  });

  it("displays current user's name in the header", async () => {
    renderWithStore(<Users />, {}, "/users/");

    const headerUserName = await screen.findByText(/Test User/i);
    expect(headerUserName).toBeInTheDocument();
  });
});
