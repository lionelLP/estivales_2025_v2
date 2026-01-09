"use client";

import UnauthorizedPage from "@/app/unauthorized/unauthorized";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ManagedUser {
  id: number;
  username: string;
  email: string;
  userType: number;
  created_at?: string;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editForm, setEditForm] = useState({ username: "", email: "", userType: "1" });
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          setIsAuthorized(false);
          return;
        }
        const currentUser = await res.json();
        if (currentUser.userType !== 0) {
          setIsAuthorized(false);
          return;
        }
        setCurrentUserId(currentUser.id ?? null);
        setIsAuthorized(true);
        await loadUsers();
      } catch (err) {
        console.error("Erreur auth:", err);
        setIsAuthorized(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthAndLoad();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/users");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Impossible de charger les utilisateurs");
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    const confirmDelete = window.confirm("Supprimer cet utilisateur ?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/auth/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Suppression impossible");
      }

      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      alert(message);
    }
  };

  const openEdit = (user: ManagedUser) => {
    setEditingUser(user);
    setEditForm({ username: user.username || "", email: user.email || "", userType: String(user.userType) });
  };

  const closeEdit = () => {
    setEditingUser(null);
    setEditForm({ username: "", email: "", userType: "1" });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
  };

  const handleEditSave = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      const payload: any = { username: editForm.username, email: editForm.email, userType: Number(editForm.userType) };

      const res = await fetch(`/api/auth/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Erreur lors de la mise à jour");
      }

      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, username: editForm.username, email: editForm.email, userType: Number(editForm.userType) } : u)));
      closeEdit();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isCheckingAuth) {
    return null;
  }

  if (!isAuthorized) {
    return <UnauthorizedPage />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-sm text-muted-foreground">
            Consultez, ajoutez ou supprimez les comptes existants.
          </p>
        </div>
        <Link
          href="/admin/users/add"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Ajouter un utilisateur
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-200">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-200">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-200">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-200">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {isLoading ? (
              <tr>
                <td className="px-6 py-4" colSpan={5}>Chargement des utilisateurs...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-neutral-500" colSpan={5}>Aucun utilisateur trouvé.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-200">{user.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-neutral-50">{user.username || "(Sans nom)"}</td>
                  <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-200">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${user.userType === 0 ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100"}`}>
                      {user.userType === 0 ? "Administrateur" : "Utilisateur"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-4">
                    <button
                      type="button"
                      onClick={() => openEdit(user)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800">Supprimer</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeEdit} />
          <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-neutral-900">
            <h2 className="text-xl font-semibold mb-4">Modifier l'utilisateur</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Nom d'utilisateur</label>
                <input name="username" value={editForm.username} onChange={handleEditChange} className="w-full rounded border p-2" />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input name="email" type="email" value={editForm.email} onChange={handleEditChange} className="w-full rounded border p-2" />
              </div>
              <div>
                <label className="block text-sm mb-1">Rôle</label>
                <select name="userType" value={editForm.userType} onChange={handleEditChange} className="w-full rounded border p-2">
                  <option value="1">Utilisateur</option>
                  <option value="0">Administrateur</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeEdit} className="px-4 py-2">Annuler</button>
              <button type="button" onClick={handleEditSave} disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded">
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
