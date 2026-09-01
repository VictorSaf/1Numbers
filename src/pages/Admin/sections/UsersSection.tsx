import { useEffect, useState } from 'react';
import { Search, Shield, User as UserIcon, MoreVertical, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { API_BASE } from '@/lib/apiBase';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  /** free | premium | pro. Cine n-are abonament activ apare ca free. */
  plan?: string;
}

/**
 * Rolul și planul sunt lucruri diferite, și panoul le ține separate.
 *
 * Rolul spune cine poate administra; planul spune ce a cumpărat. Un admin pe
 * plan free e combinația obișnuită aici. Amestecate într-un singur selector,
 * ar deveni imposibil de exprimat.
 *
 * Nimic din aplicație nu aplică încă planurile: setarea lor e o decizie
 * înregistrată, nu o poartă închisă. Se vede în badge, ca să nu pară altfel.
 */
const PLANS = ['free', 'premium', 'pro'] as const;

/**
 * Codurile serverului, spuse pe limba omului.
 *
 * Serverul răspunde cu coduri fiindcă îi vorbește altui program: `email_taken`
 * e precis, și e pentru noi. Pus într-un toast, e o ghicitoare -- iar exact
 * asta s-a văzut: un cont creat cu succes, o a doua încercare pe același
 * email, și un dreptunghi roșu scriind „email_taken”. Omul a înțeles „nu mă
 * lasă să creez”, nu „ai reușit deja”.
 *
 * Ce nu e în tabel rămâne cum vine: un cod necunoscut îmbrăcat într-o
 * explicație inventată e mai rău decât unul spus ca atare.
 */
const SAYS: Record<string, string> = {
  email_taken: 'That email already has an account. Look for it in the list below.',
  unknown_plan: 'That plan does not exist. Pick free, premium or pro.',
  invalid_request:
    'Something in the form is not accepted. Check the email, and that the password has at least 6 characters.',
  'Access token required': 'You are signed out. Sign in again and reopen this page.',
  'Invalid or expired token': 'Your session expired. Sign in again.',
  'Admin access required': 'This account is not an administrator.',
};

const human = (raw: unknown): string => {
  const text = String(raw ?? '');
  const key = Object.keys(SAYS).find((k) => text.includes(k));
  return key ? SAYS[key] : text || 'Unknown error.';
};

export const UsersSection = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);
  /**
 * Contul și harta, dintr-o singură acțiune.
 *
 * Utilizatorul nu-și mai poate face harta proprie -- ea E accesul, iar accesul
 * se acordă. Deci ăsta e singurul loc din care harta cuiva poate lua ființă,
 * și trebuie să ia numele de naștere cu data. Împreună sau deloc: serverul
 * refuză jumătate de hartă, fiindcă jumătate de hartă nu e o hartă.
 */
  const [form, setForm] = useState({
    email: '',
    name: '',
    password: '',
    plan: 'free',
    birthName: '',
    birthDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Un corp de răspuns care poate să nu fie JSON.
   *
   * `await response.json()` pe un corp gol aruncă „Unexpected end of JSON
   * input” -- adevărat despre parser și fără niciun înțeles pentru om. Se
   * întâmplă real: tunelul răspunde 404 cu zero octeți la /api/admin, deci
   * orice cerere plecată din pagina greșită ajunge exact acolo.
   *
   * Ce iese de aici e ori obiectul, ori un motiv care spune ce s-a întâmplat.
   */
  const readBody = async (response: Response): Promise<Record<string, unknown>> => {
    const text = await response.text();
    if (!text) {
      return {
        error:
          response.status === 404
            ? 'The API did not answer on this address. Open the panel on the machine that serves it.'
            : `The server answered ${response.status} with an empty body.`,
      };
    }
    try {
      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      return { error: `The server answered ${response.status} with something that is not JSON.` };
    }
  };

  const authFetch = (path: string, init: RequestInit = {}) =>
    fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        ...(init.headers ?? {}),
      },
    });

  const updateUserPlan = async (userId: number, plan: string) => {
    try {
      const response = await authFetch(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ plan }),
      });
      if (!response.ok) throw new Error(human((await readBody(response)).error));
      toast({ title: 'Plan updated', description: `Now on ${plan}` });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Could not change the plan',
        description: error instanceof Error ? error.message : 'unknown error',
        variant: 'destructive',
      });
    }
  };

  const createUser = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // Câmpurile de hartă pleacă doar dacă sunt amândouă completate: goale,
      // ar fi picat validarea „împreună sau deloc”.
      const { birthName, birthDate, ...account } = form;
      const body =
        birthName.trim() && birthDate
          ? { ...account, birthName: birthName.trim(), birthDate }
          : account;

      const response = await authFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const data = await readBody(response);
      if (!response.ok) throw new Error(human(data.error));
      toast({
        title: 'Account created',
        description: (data.user as { hasMap?: boolean } | undefined)?.hasMap
          ? `${form.email} on ${form.plan}, with their map`
          : `${form.email} on ${form.plan} — no map yet`,
      });
      // Parola nu rămâne în memoria paginii după ce a plecat.
      setForm({ email: '', name: '', password: '', plan: 'free', birthName: '', birthDate: '' });
      setCreating(false);
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Could not create the account',
        description: error instanceof Error ? error.message : 'unknown error',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setListError(null);
        return;
      }
      // Lista goală și lista care n-a putut fi citită arată la fel pe ecran, iar
      // „No users found” pentru o cerere respinsă e o minciună liniștită.
      const body = await readBody(response);
      setListError(body.error ? human(body.error) : `The server answered ${response.status}.`);
    } catch (error) {
      setListError(error instanceof Error ? error.message : 'Could not reach the API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast({
          title: 'User updated',
          description: `User role changed to ${newRole}`,
        });
        fetchUsers();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update user',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="card-mystic">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold mb-2">Users</h2>
        <p className="text-muted-foreground">Manage accounts, roles and plans</p>
      </div>

      <Card className="card-mystic">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">New account</CardTitle>
            <Button variant={creating ? 'ghost' : 'default'} onClick={() => setCreating(!creating)}>
              <UserPlus className="mr-2 h-4 w-4" />
              {creating ? 'Cancel' : 'Create user'}
            </Button>
          </div>
        </CardHeader>
        {creating && (
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                placeholder="Name (optional)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                type="password"
                placeholder="Password (at least 6 characters)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <select
                aria-label="Plan"
                value={form.plan}
                onChange={(e) => setForm({ ...form, plan: e.target.value })}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm"
              >
                {PLANS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <Input
                placeholder="Full name at birth (for the map)"
                value={form.birthName}
                onChange={(e) => setForm({ ...form, birthName: e.target.value })}
              />
              <Input
                type="date"
                aria-label="Date of birth"
                max={new Date().toISOString().slice(0, 10)}
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button onClick={createUser} disabled={saving || !form.email || form.password.length < 6}>
                {saving ? 'Creating…' : 'Create account'}
              </Button>
              <span className="text-sm text-muted-foreground">
                {form.birthName.trim() || form.birthDate
                  ? 'Birth name and date go together — half a map is not a map.'
                  : 'Leave the birth fields empty to create the account without a map.'}
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="card-mystic">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">{users.length} users</Badge>
          </div>
          {/* Lista goală și lista care n-a putut fi citită arată la fel pe
              ecran. „No users found” pentru o cerere respinsă e o minciună
              liniștită, iar asta e chiar ce s-a văzut: „0 users” în timp ce
              API-ul răspundea 404 cu corp gol. */}
          {listError && <p className="mt-3 text-sm text-tension">{listError}</p>}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    {user.role === 'admin' ? (
                      <Shield className="h-5 w-5 text-primary" />
                    ) : (
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{user.name || 'No name'}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                  <select
                    aria-label={`Plan for ${user.email}`}
                    value={user.plan ?? 'free'}
                    onChange={(e) => updateUserPlan(user.id, e.target.value)}
                    className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {PLANS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <div className="text-sm text-muted-foreground">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')
                        }
                      >
                        {user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
