/**
 * Server-side authentication utilities
 *
 * Use these functions in server components and API routes
 * to check authentication status and user permissions.
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

/**
 * Get the current session from server-side
 * Use this in Server Components and API Routes
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Check if current user is authenticated
 */
export async function isAuthenticated() {
  const session = await getSession()
  return !!session
}

/**
 * Check if current user is an admin
 * (All authenticated users are admins since we whitelist emails)
 */
export async function isAdmin() {
  return await isAuthenticated()
}

/**
 * Require authentication for a route
 * Throws error if not authenticated
 */
export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error('Authentication required')
  }
  return session
}

/**
 * Get the admin email whitelist
 */
export function getAdminEmails(): string[] {
  return process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []
}

/**
 * Check if an email is in the admin whitelist
 */
export function isAdminEmail(email: string): boolean {
  const adminEmails = getAdminEmails()
  return adminEmails.includes(email.toLowerCase())
}
