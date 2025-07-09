import {render, screen} from '@testing-library/react';
import Users from '../src/components/users/Users';
import {createServer} from './server';
import {renderWithStore} from './usersSetupStore';

createServer([
  {
    path: '/admin-ng/users/users.json',
    method: 'get',
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
              roles: [
                { name: "ROLE_USER", type: "INTERNAL" }
              ],
            },
          ],
        })
      );
    }
  }
]);

describe('username', () => {

it('shows same name in table and header', async () => {
  renderWithStore(<Users />);

  const tableCell = await screen.findByText('Test User');
  const headerButton = await screen.findByRole('button', {
    name: /Test User/i,
  });

  expect(tableCell).toBeInTheDocument();
  expect(headerButton).toBeInTheDocument();
});

}
)
