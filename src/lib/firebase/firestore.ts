import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./config";
import { Diagram, DiagramFormData } from "../types";

const diagramsCollection = collection(db, "diagrams");

export const createDiagram = async (
  userId: string,
  userEmail: string,
  data: DiagramFormData
): Promise<string> => {
  const diagramData = {
    title: data.title,
    ownerId: userId,
    ownerEmail: userEmail,
    nodes: data.nodes,
    edges: data.edges,
    collaborators: {},
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const docRef = await addDoc(diagramsCollection, diagramData);
  return docRef.id;
};

export const updateDiagram = async (
  diagramId: string,
  data: Partial<DiagramFormData>
): Promise<void> => {
  const diagramRef = doc(db, "diagrams", diagramId);
  await updateDoc(diagramRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteDiagram = async (diagramId: string): Promise<void> => {
  const diagramRef = doc(db, "diagrams", diagramId);
  await deleteDoc(diagramRef);
};

export const getDiagram = async (
  diagramId: string
): Promise<Diagram | null> => {
  const diagramRef = doc(db, "diagrams", diagramId);
  const diagramSnap = await getDoc(diagramRef);

  if (!diagramSnap.exists()) {
    return null;
  }

  return convertDocToDiagram(diagramSnap);
};

export const getUserDiagrams = async (userId: string): Promise<Diagram[]> => {
  // Get diagrams where user is owner
  const ownerQuery = query(diagramsCollection, where("ownerId", "==", userId));

  const ownerSnapshots = await getDocs(ownerQuery);
  // Get diagrams where user is collaborator
  const allDiagramsSnapshot = await getDocs(diagramsCollection);

  const collaboratorDiagrams = allDiagramsSnapshot.docs.filter((doc) => {
    const data = doc.data();
    return data.collaborators && userId in data.collaborators;
  });

  const allDocs = [
    ...ownerSnapshots.docs,
    ...collaboratorDiagrams.filter(
      (doc) => !ownerSnapshots.docs.find((ownerDoc) => ownerDoc.id === doc.id)
    ),
  ];

  return allDocs.map(convertDocToDiagram);
};

export const shareDiagram = async (
  diagramId: string,
  collaboratorId: string,
  role: "editor" | "viewer"
): Promise<void> => {
  const diagramRef = doc(db, "diagrams", diagramId);
  const diagramSnap = await getDoc(diagramRef);

  if (!diagramSnap.exists()) {
    throw new Error("Diagram not found");
  }

  const currentCollaborators = diagramSnap.data().collaborators || {};

  await updateDoc(diagramRef, {
    collaborators: {
      ...currentCollaborators,
      [collaboratorId]: role,
    },
    updatedAt: Timestamp.now(),
  });
};

export const removeDiagramCollaborator = async (
  diagramId: string,
  collaboratorId: string
): Promise<void> => {
  const diagramRef = doc(db, "diagrams", diagramId);
  const diagramSnap = await getDoc(diagramRef);

  if (!diagramSnap.exists()) {
    throw new Error("Diagram not found");
  }

  const currentCollaborators = diagramSnap.data().collaborators || {};
  delete currentCollaborators[collaboratorId];

  await updateDoc(diagramRef, {
    collaborators: currentCollaborators,
    updatedAt: Timestamp.now(),
  });
};

const convertDocToDiagram = (doc: QueryDocumentSnapshot): Diagram => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    ownerId: data.ownerId,
    ownerEmail: data.ownerEmail,
    nodes: data.nodes || [],
    edges: data.edges || [],
    collaborators: data.collaborators || {},
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};
