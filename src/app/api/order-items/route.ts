import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orderItems, orders, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate orderId is provided
    if (!orderId) {
      return NextResponse.json({ 
        error: "orderId is required",
        code: "MISSING_ORDER_ID" 
      }, { status: 400 });
    }

    // Validate orderId is a valid integer
    if (isNaN(parseInt(orderId))) {
      return NextResponse.json({ 
        error: "orderId must be a valid integer",
        code: "INVALID_ORDER_ID" 
      }, { status: 400 });
    }

    const orderIdInt = parseInt(orderId);

    // Query order items filtered by orderId with pagination
    const results = await db.select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderIdInt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, productId, quantity, price } = body;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json({ 
        error: "orderId is required",
        code: "MISSING_ORDER_ID" 
      }, { status: 400 });
    }

    if (!productId) {
      return NextResponse.json({ 
        error: "productId is required",
        code: "MISSING_PRODUCT_ID" 
      }, { status: 400 });
    }

    if (!quantity) {
      return NextResponse.json({ 
        error: "quantity is required",
        code: "MISSING_QUANTITY" 
      }, { status: 400 });
    }

    if (price === undefined || price === null) {
      return NextResponse.json({ 
        error: "price is required",
        code: "MISSING_PRICE" 
      }, { status: 400 });
    }

    // Validate orderId is a valid integer
    if (isNaN(parseInt(orderId))) {
      return NextResponse.json({ 
        error: "orderId must be a valid integer",
        code: "INVALID_ORDER_ID" 
      }, { status: 400 });
    }

    // Validate productId is a valid integer
    if (isNaN(parseInt(productId))) {
      return NextResponse.json({ 
        error: "productId must be a valid integer",
        code: "INVALID_PRODUCT_ID" 
      }, { status: 400 });
    }

    // Validate quantity is a positive integer
    const quantityInt = parseInt(quantity);
    if (isNaN(quantityInt) || quantityInt <= 0) {
      return NextResponse.json({ 
        error: "quantity must be a positive integer",
        code: "INVALID_QUANTITY" 
      }, { status: 400 });
    }

    // Validate price is a positive number
    const priceFloat = parseFloat(price);
    if (isNaN(priceFloat) || priceFloat <= 0) {
      return NextResponse.json({ 
        error: "price must be a positive number",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    const orderIdInt = parseInt(orderId);
    const productIdInt = parseInt(productId);

    // Validate orderId references an existing order
    const existingOrder = await db.select()
      .from(orders)
      .where(eq(orders.id, orderIdInt))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json({ 
        error: "Order not found",
        code: "ORDER_NOT_FOUND" 
      }, { status: 404 });
    }

    // Validate productId references an existing product
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, productIdInt))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({ 
        error: "Product not found",
        code: "PRODUCT_NOT_FOUND" 
      }, { status: 404 });
    }

    // Create new order item
    const newOrderItem = await db.insert(orderItems)
      .values({
        orderId: orderIdInt,
        productId: productIdInt,
        quantity: quantityInt,
        price: priceFloat,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newOrderItem[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}