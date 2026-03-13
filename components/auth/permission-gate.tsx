import { checkPermission } from "@/lib/services/auth/permissions";
import React from "react";

type PermissionGateProps = {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
};

/**
 * A server-side component that renders its children only if the current user
 * has the required permission.
 *
 * @param {PermissionGateProps} props
 * @param {React.ReactNode} props.children - The content to render if the user has the permission.
 * @param {string} props.permission - The permission required to render the children.
 * @param {React.ReactNode} [props.fallback=null] - A fallback to render if the user does not have the permission.
 */
export const PermissionGate = async ({
  children,
  permission,
  fallback = null,
}: PermissionGateProps) => {
  const hasAccess = await checkPermission(permission);

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
