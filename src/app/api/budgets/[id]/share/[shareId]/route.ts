// file: src/app/api/budgets/[id]/share/[shareId]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; shareId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the budget exists and belongs to the user OR the user is removing their own access
    const budget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id }, // User owns the budget
          { 
            sharedWith: {
              some: { 
                id: params.shareId,
                userId: session.user.id // User is removing their own access
              }
            }
          }
        ]
      }
    })

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    // Verify the share exists
    const share = await prisma.budgetShare.findFirst({
      where: {
        id: params.shareId,
        budgetId: params.id
      }
    })

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 })
    }

    // Delete the share
    await prisma.budgetShare.delete({
      where: { id: params.shareId }
    })

    return NextResponse.json({ message: 'Budget access removed successfully' })
  } catch (error) {
    console.error('Remove budget share error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; shareId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { canEdit } = await request.json()

    // Verify the budget exists and belongs to the user (only owner can update permissions)
    const budget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    // Verify the share exists
    const share = await prisma.budgetShare.findFirst({
      where: {
        id: params.shareId,
        budgetId: params.id
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 })
    }

    // Update the share permissions
    const updatedShare = await prisma.budgetShare.update({
      where: { id: params.shareId },
      data: { canEdit: Boolean(canEdit) },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      message: 'Share permissions updated successfully',
      share: updatedShare
    })
  } catch (error) {
    console.error('Update share permissions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}