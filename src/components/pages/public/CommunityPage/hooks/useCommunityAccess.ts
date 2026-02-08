interface Community {
  id: string | number;
  isMember?: boolean | string;
  memberIsApproved?: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  name?: string;
}

export const useCommunityAccess = (community: Community | null) => {
  const safeMembers = Array.isArray((community as any)?.members) ? (community as any).members : [];
  const safeJoinRequests = Array.isArray((community as any)?.joinRequests) ? (community as any).joinRequests : [];
  const isMember = community?.isMember === true || community?.isMember === 'true';
  const memberIsApproved = community?.memberIsApproved === true;
  const isFullMember = isMember && memberIsApproved;
  const isPendingMember = isMember && !memberIsApproved;
  const isAdmin = community?.isAdmin || false;
  const isModerator = community?.isModerator || false;
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
