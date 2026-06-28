import { getUsers } from './actions';
import DeleteUserButton from './DeleteUserButton';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="min-h-full p-4 md:p-8 font-sans">
      <div className="max-w-[1440px] mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif uppercase tracking-tighter text-secondary">
              Users Databank
            </h1>
            <p className="text-muted-text uppercase tracking-widest text-sm mt-2">
              Manage Authorized Operators
            </p>
          </div>
        </header>

        {/* Users Table */}
        <section className="space-y-6">
          <div className="bg-card/30 border border-border overflow-hidden flex flex-col min-h-0">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-card text-muted-text uppercase tracking-widest text-[11px] border-b border-border">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 font-normal">ID</th>
                    <th className="px-4 sm:px-6 py-4 font-normal">Discord ID</th>
                    <th className="px-4 sm:px-6 py-4 font-normal">Username</th>
                    <th className="px-4 sm:px-6 py-4 font-normal">Email</th>
                    <th className="px-4 sm:px-6 py-4 font-normal">Last Login</th>
                    <th className="px-4 sm:px-6 py-4 font-normal text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-text font-mono text-xs uppercase">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-card/40 transition-colors">
                        <td className="px-4 sm:px-6 py-4 text-secondary font-mono">
                          #{user.id}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-muted-text font-mono text-xs">
                          {user.discord_id}
                        </td>
                        <td className="px-4 sm:px-6 py-4 font-medium text-foreground">
                          {user.username}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-muted-text font-mono text-xs">
                          {user.email || 'N/A'}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-muted-text font-mono text-xs">
                          {user.last_login ? new Date(user.last_login + 'Z').toLocaleString() : 'Never'}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right">
                          <DeleteUserButton userId={user.id} username={user.username} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
