/**
 * Password Reset Confirmation API Route
 * POST /api/auth/password-reset/confirm
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, hashPassword } from '@/lib/auth/users';
import { verifyPasswordResetToken, revokeAllUserSessions } from '@/lib/auth/session';
import { validateRequest, passwordResetSchema } from '@/lib/auth/validation';
import { promises as fs } from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequest(passwordResetSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: validation.errors
        },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Verify reset token
    const tokenData = await verifyPasswordResetToken(token);

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Get user by email (password reset tokens contain email, not userId)
    const user = await getUserByEmail(tokenData.email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    const usersData = await fs.readFile(USERS_FILE, 'utf-8');
    const users = JSON.parse(usersData);
    const userIndex = users.findIndex((u: any) => u.id === user.id);

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    users[userIndex].password = hashedPassword;
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');

    // Revoke all existing sessions for security
    await revokeAllUserSessions(user.id);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.',
    });
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
