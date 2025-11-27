import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { currentAmount, completed } = await request.json()

    const goal = await prisma.goal.update({
      where: {
        id: params.id,
        userId: session.user.id // Ensure user owns this goal
      },
      data: {
        ...(currentAmount !== undefined && { currentAmount: parseFloat(currentAmount) }),
        ...(completed !== undefined && { 
          completed,
          completedAt: completed ? new Date() : null
        })
      }
    })

    // Create notification if goal was just completed
    if (completed && !goal.completedAt) {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'goal_achieved',
          title: 'Goal Achieved! 🎉',
          message: `You've reached your goal: ${goal.title}`,
          data: { goalId: goal.id },
          read: false
        }
      })
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Update goal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.goal.delete({
      where: {
        id: params.id,
        userId: session.user.id // Ensure user owns this goal
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete goal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}