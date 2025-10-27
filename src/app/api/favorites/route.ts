import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { favorites, products, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId || userId.trim() === '') {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    const results = await db
      .select({
        id: favorites.id,
        userId: favorites.userId,
        productId: favorites.productId,
        createdAt: favorites.createdAt,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          category: products.category,
          image: products.image,
          description: products.description,
          createdAt: products.createdAt,
        },
      })
      .from(favorites)
      .leftJoin(products, eq(favorites.productId, products.id))
      .where(eq(favorites.userId, userId.trim()));

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId } = body;

    if (!userId || userId.trim() === '') {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required', code: 'MISSING_PRODUCT_ID' },
        { status: 400 }
      );
    }

    const parsedProductId = parseInt(productId);
    if (isNaN(parsedProductId) || parsedProductId <= 0) {
      return NextResponse.json(
        { error: 'productId must be a valid positive integer', code: 'INVALID_PRODUCT_ID' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, parsedProductId))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if favorite already exists
    const existingFavorite = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId.trim()),
          eq(favorites.productId, parsedProductId)
        )
      )
      .limit(1);

    if (existingFavorite.length > 0) {
      return NextResponse.json(
        {
          error: 'Product already in favorites',
          code: 'DUPLICATE_FAVORITE',
        },
        { status: 409 }
      );
    }

    const newFavorite = await db
      .insert(favorites)
      .values({
        userId: userId.trim(),
        productId: parsedProductId,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newFavorite[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const parsedId = parseInt(id);

    const favorite = await db
      .select()
      .from(favorites)
      .where(eq(favorites.id, parsedId))
      .limit(1);

    if (favorite.length === 0) {
      return NextResponse.json(
        { error: 'Favorite not found', code: 'FAVORITE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(favorites)
      .where(eq(favorites.id, parsedId))
      .returning();

    return NextResponse.json(
      {
        message: 'Favorite removed successfully',
        favorite: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}