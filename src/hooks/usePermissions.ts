import { useMemo } from "react";
import { User, Diagram } from "@/lib/types";

export const usePermissions = (user: User | null, diagram: Diagram | null) => {
  const permissions = useMemo(() => {
    if (!user || !diagram) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        canShare: false,
        isOwner: false,
        userRole: null,
      };
    }

    const isOwner = diagram.ownerId === user.uid;
    const collaboratorRole = diagram.collaborators[user.uid];

    const canView = isOwner || !!collaboratorRole;
    const canEdit = isOwner || collaboratorRole === "editor";
    const canDelete = isOwner;
    const canShare = isOwner;

    return {
      canView,
      canEdit,
      canDelete,
      canShare,
      isOwner,
      userRole: isOwner ? "owner" : collaboratorRole || null,
    };
  }, [user, diagram]);

  return permissions;
};
