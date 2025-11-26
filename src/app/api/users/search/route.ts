// file: src/app/api/users/search/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } }
        ],
        NOT: {
          id: session.user.id // Exclude current user
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      },
      take: 10 // Limit results
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('User search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}