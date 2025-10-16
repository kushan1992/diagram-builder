import { Node, Edge } from "reactflow";

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

export interface Diagram {
  id: string;
  title: string;
  ownerId: string;
  ownerEmail: string;
  nodes: Node[];
  edges: Edge[];
  collaborators: Record<string, "editor" | "viewer">; // userId: role
  createdAt: Date;
  updatedAt: Date;
}

export interface DiagramFormData {
  title: string;
  nodes: Node[];
  edges: Edge[];
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

export interface DeletedNode {
  id: string;
}

export type ConfirmToastProps = {
  closeToast?: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: React.ReactNode;
  title: string;
  subTitle: string;
  primaryButton: string;
  secondaryButton: string;
  color: string;
};
