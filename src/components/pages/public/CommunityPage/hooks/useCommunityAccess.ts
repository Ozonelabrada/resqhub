interface Community {
  id: string | number;
  isMember?: boolean | string;
  memberIsApproved?: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  communityUserRoles?: string[];
  name?: string;
}

export const useCommunityAccess = (community: Community | null) => {
  const safeMembers = Array.isArray((community as any)?.members) ? (community as any).members : [];
  const safeJoinRequests = Array.isArray((community as any)?.joinRequests) ? (community as any).joinRequests : [];
  const isMember = community?.isMember === true || community?.isMember === 'true';
  const memberIsApproved = community?.memberIsApproved === true;
  const isFullMember = isMember && memberIsApproved;
  const isPendingMember = isMember && !memberIsApproved;
  
  // Check both legacy flags and new communityUserRoles array
  const isAdmin = community?.isAdmin || 
    (community?.communityUserRoles?.some(role => role.toLowerCase() === 'admin') || false);
  const isModerator = community?.isModerator || 
    (community?.communityUserRoles?.some(role => role.toLowerCase() === 'moderator') || false);
  const isPrivileged = isAdmin || isModerator;

  return {
    safeMembers,
    safeJoinRequests,
    isMember,
    memberIsApproved,
    isFullMember,
    isPendingMember,
    isAdmin,
    isModerator,
    isPrivileged,
  };
};
