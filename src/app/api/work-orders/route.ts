import { NextRequest, NextResponse } from 'next/server';
import { getWorkOrders, createWorkOrder, CreateWorkOrderSchema } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase() || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';

    let orders = await getWorkOrders();

    // 1. Text search by title or description
    if (q) {
      orders = orders.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q)
      );
    }

    // 2. Status Filter
    if (status) {
      orders = orders.filter((o) => o.status === status);
    }

    // 3. Priority Filter
    if (priority) {
      orders = orders.filter((o) => o.priority === priority);
    }

    // 4. Sort by updatedAt descending (newest first)
    orders.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return NextResponse.json(orders);
  } catch (error) {
    console.error('API GET work orders failed:', error);
    return NextResponse.json({ error: 'Failed to fetch work orders.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedData = CreateWorkOrderSchema.safeParse(body);

    if (!parsedData.success) {
      // Map validation errors to fields
      const errors: Record<string, string> = {};
      parsedData.error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });

      return NextResponse.json({ errors }, { status: 400 });
    }

    const newOrder = await createWorkOrder(parsedData.data);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('API POST work order failed:', error);
    return NextResponse.json({ error: 'Failed to create work order.' }, { status: 500 });
  }
}
