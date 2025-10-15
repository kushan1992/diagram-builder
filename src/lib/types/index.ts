export type UserRole = "editor" | "viewer";

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface Collaborator {
  email: string;
  role: "editor" | "viewer";
  addedAt: Date;
}

export interface ShareInvite {
  diagramId: string;
  invitedEmail: string;
  role: "editor" | "viewer";
  invitedBy: string;
  invitedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}
