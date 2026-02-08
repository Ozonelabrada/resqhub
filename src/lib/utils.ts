import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CommunityMember } from "@/types/community"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Helper function to check if a community member has a specific role
 * Supports both the new roles array and legacy single role property
 */
export function hasRole(member: CommunityMember, roleToCheck: string): boolean {
  if (!member) return false
  // Check roles array first
  if (member.roles && Array.isArray(member.roles)) {
    return member.roles.includes(roleToCheck as any)
  }
  // Fallback to single role property
  return member.role === roleToCheck
}

/**
 * Helper function to check if a member is a seller
 */
export function isMemberSeller(member: CommunityMember): boolean {
  return hasRole(member, 'seller')
}

/**
 * Helper function to check if a member is a volunteer
 */
export function isMemberVolunteer(member: CommunityMember): boolean {
  return hasRole(member, 'volunteer')
}

/**
 * Helper function to check if a member is a rider
 */
export function isMemberRider(member: CommunityMember): boolean {
  return hasRole(member, 'rider')
}

/**
 * Get all roles for a member (handles both new and legacy formats)
 */
export function getMemberRoles(member: CommunityMember): string[] {
  if (!member) return []
  if (member.roles && Array.isArray(member.roles)) {
    return member.roles
  }
  return [member.role]
}

