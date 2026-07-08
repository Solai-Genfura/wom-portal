import { NextRequest, NextResponse } from 'next/server';
import { getWorkOrderById, updateWorkOrder, deleteWorkOrder, UpdateWorkOrderSchema } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const order = await getWorkOrderById(resolvedParams.id);
    if (!order) {
      return NextResponse.json({ error: 'Work order not found.' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error(`API GET work order ${request.url} failed:`, error);
    return NextResponse.json({ error: 'Failed to fetch work order.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const parsedData = UpdateWorkOrderSchema.safeParse(body);

    if (!parsedData.success) {
      // Map validation errors to fields
      const errors: Record<string, string> = {};
      parsedData.error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });

      return NextResponse.json({ errors }, { status: 400 });
    }

    const updated = await updateWorkOrder(resolvedParams.id, parsedData.data);
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`API PUT work order ${request.url} failed:`, error);
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update work order.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    await deleteWorkOrder(resolvedParams.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`API DELETE work order ${request.url} failed:`, error);
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete work order.' }, { status: 500 });
  }
}
