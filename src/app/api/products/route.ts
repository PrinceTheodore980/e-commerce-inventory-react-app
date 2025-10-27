import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, like, and, or } from 'drizzle-orm';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single product by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, parseInt(id)))
        .limit(1);

      if (product.length === 0) {
        return NextResponse.json(
          { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(product[0], { status: 200 });
    }

    // List all products with pagination, search, and category filter
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    let query = db.select().from(products);

    // Build filter conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(products.name, `%${search}%`),
          like(products.description, `%${search}%`)
        )
      );
    }

    if (category) {
      conditions.push(eq(products.category, category));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
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
    const { name, price, category, image, description } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (price === undefined || price === null) {
      return NextResponse.json(
        { error: 'price is required', code: 'MISSING_PRICE' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'category is required', code: 'MISSING_CATEGORY' },
        { status: 400 }
      );
    }

    // Validate price is a positive number
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      return NextResponse.json(
        { error: 'price must be a positive number', code: 'INVALID_PRICE' },
        { status: 400 }
      );
    }

    // Create new product
    const newProduct = await db
      .insert(products)
      .values({
        name: name.trim(),
        price: priceValue,
        category: category.trim(),
        image: image || null,
        description: description || null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newProduct[0], { status: 201 });
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
    const { name, price, category, image, description } = body;

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updates: Partial<{
      name: string;
      price: number;
      category: string;
      image: string | null;
      description: string | null;
    }> = {};

    if (name !== undefined) {
      updates.name = name.trim();
    }

    if (price !== undefined) {
      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue <= 0) {
        return NextResponse.json(
          { error: 'price must be a positive number', code: 'INVALID_PRICE' },
          { status: 400 }
        );
      }
      updates.price = priceValue;
    }

    if (category !== undefined) {
      updates.category = category.trim();
    }

    if (image !== undefined) {
      updates.image = image || null;
    }

    if (description !== undefined) {
      updates.description = description || null;
    }

    // If no fields to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(existingProduct[0], { status: 200 });
    }

    // Update product
    const updatedProduct = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedProduct[0], { status: 200 });
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

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete product
    const deleted = await db
      .delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Product deleted successfully',
        product: deleted[0],
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