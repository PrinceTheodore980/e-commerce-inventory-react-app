import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';

// Helper function to exclude password from user objects
function excludePassword<T extends { password?: string }>(user: T): Omit<T, 'password'> {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single user by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(id)))
        .limit(1);

      if (user.length === 0) {
        return NextResponse.json(
          { error: 'User not found', code: 'USER_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(excludePassword(user[0]), { status: 200 });
    }

    // List all users with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(users);

    if (search) {
      query = query.where(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    const results = await query.limit(limit).offset(offset);

    // Exclude password from all users
    const usersWithoutPassword = results.map(user => excludePassword(user));

    return NextResponse.json(usersWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required', code: 'MISSING_PASSWORD' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Check email uniqueness
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists', code: 'EMAIL_EXISTS' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = await db
      .insert(users)
      .values({
        email: email.toLowerCase().trim(),
        password: password,
        name: name.trim(),
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(excludePassword(newUser[0]), { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updates: Partial<{
      email: string;
      password: string;
      name: string;
    }> = {};

    if (email !== undefined) {
      // Validate email format
      if (!isValidEmail(email)) {
        return NextResponse.json(
          { error: 'Invalid email format', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }

      // Check email uniqueness (excluding current user)
      const emailCheck = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase().trim()))
        .limit(1);

      if (emailCheck.length > 0 && emailCheck[0].id !== parseInt(id)) {
        return NextResponse.json(
          { error: 'Email already exists', code: 'EMAIL_EXISTS' },
          { status: 400 }
        );
      }

      updates.email = email.toLowerCase().trim();
    }

    if (password !== undefined) {
      updates.password = password;
    }

    if (name !== undefined) {
      updates.name = name.trim();
    }

    // If no fields to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(excludePassword(existingUser[0]), { status: 200 });
    }

    // Update user
    const updatedUser = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, parseInt(id)))
      .returning();

    return NextResponse.json(excludePassword(updatedUser[0]), { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete user
    const deleted = await db
      .delete(users)
      .where(eq(users.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'User deleted successfully',
        user: excludePassword(deleted[0]),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}