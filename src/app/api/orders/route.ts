import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, users, orderItems, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const VALID_STATUSES = ['pending', 'processing', 'completed', 'cancelled'] as const;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single order by ID with order items and product details
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { 
            error: 'Valid ID is required',
            code: 'INVALID_ID' 
          },
          { status: 400 }
        );
      }

      const order = await db.select()
        .from(orders)
        .where(eq(orders.id, parseInt(id)))
        .limit(1);

      if (order.length === 0) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      // Fetch order items with product details
      const items = await db
        .select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          createdAt: orderItems.createdAt,
          product: {
            id: products.id,
            name: products.name,
            price: products.price,
            category: products.category,
            image: products.image,
            description: products.description,
          }
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, parseInt(id)));

      return NextResponse.json({ ...order[0], items }, { status: 200 });
    }

    // List orders with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const userIdParam = searchParams.get('userId');
    const statusParam = searchParams.get('status');

    let query = db.select().from(orders);

    // Build filter conditions
    const conditions = [];

    if (userIdParam) {
      if (isNaN(parseInt(userIdParam))) {
        return NextResponse.json(
          { 
            error: 'Valid userId is required',
            code: 'INVALID_USER_ID' 
          },
          { status: 400 }
        );
      }
      conditions.push(eq(orders.userId, parseInt(userIdParam)));
    }

    if (statusParam) {
      if (!VALID_STATUSES.includes(statusParam as any)) {
        return NextResponse.json(
          { 
            error: 'Invalid status. Must be one of: pending, processing, completed, cancelled',
            code: 'INVALID_STATUS' 
          },
          { status: 400 }
        );
      }
      conditions.push(eq(orders.status, statusParam));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    // Fetch order items with product details for each order
    const ordersWithItems = await Promise.all(
      results.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            quantity: orderItems.quantity,
            price: orderItems.price,
            createdAt: orderItems.createdAt,
            product: {
              id: products.id,
              name: products.name,
              price: products.price,
              category: products.category,
              image: products.image,
              description: products.description,
            }
          })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        return { ...order, items };
      })
    );

    return NextResponse.json(ordersWithItems, { status: 200 });

  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, total, status } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'userId is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    if (total === undefined || total === null) {
      return NextResponse.json(
        { 
          error: 'total is required',
          code: 'MISSING_TOTAL' 
        },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { 
          error: 'status is required',
          code: 'MISSING_STATUS' 
        },
        { status: 400 }
      );
    }

    // Validate userId is a valid integer
    if (isNaN(parseInt(userId))) {
      return NextResponse.json(
        { 
          error: 'userId must be a valid integer',
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Validate total is a positive number
    const totalValue = parseFloat(total);
    if (isNaN(totalValue) || totalValue <= 0) {
      return NextResponse.json(
        { 
          error: 'total must be a positive number',
          code: 'INVALID_TOTAL' 
        },
        { status: 400 }
      );
    }

    // Validate status
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { 
          error: 'status must be one of: pending, processing, completed, cancelled',
          code: 'INVALID_STATUS' 
        },
        { status: 400 }
      );
    }

    // Validate userId references an existing user
    const user = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND' 
        },
        { status: 400 }
      );
    }

    // Create order
    const newOrder = await db.insert(orders)
      .values({
        userId: parseInt(userId),
        total: totalValue,
        status: status,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newOrder[0], { status: 201 });

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await db.select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, total } = body;

    // Validate at least one field is provided
    if (status === undefined && total === undefined) {
      return NextResponse.json(
        { 
          error: 'At least one field (status or total) must be provided',
          code: 'NO_FIELDS_TO_UPDATE' 
        },
        { status: 400 }
      );
    }

    // Build update object
    const updates: any = {};

    // Validate and add status if provided
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { 
            error: 'status must be one of: pending, processing, completed, cancelled',
            code: 'INVALID_STATUS' 
          },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    // Validate and add total if provided
    if (total !== undefined) {
      const totalValue = parseFloat(total);
      if (isNaN(totalValue) || totalValue <= 0) {
        return NextResponse.json(
          { 
            error: 'total must be a positive number',
            code: 'INVALID_TOTAL' 
          },
          { status: 400 }
        );
      }
      updates.total = totalValue;
    }

    // Update order
    const updated = await db.update(orders)
      .set(updates)
      .where(eq(orders.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error: any) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await db.select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Delete order
    const deleted = await db.delete(orders)
      .where(eq(orders.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      { 
        message: 'Order deleted successfully',
        order: deleted[0]
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}