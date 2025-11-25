// file: src/app/categories/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  color: string
  _count: {
    transactions: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh the categories list
        const updatedResponse = await fetch('/api/categories')
        if (updatedResponse.ok) {
          const data = await updatedResponse.json()
          setCategories(data)
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete category')
      }
    } catch (error) {
      alert('Failed to delete category')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875]">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-heading text-[#F8F4E6] dark:text-[#A86A3D]">
              Categories
            </h1>
            <p className="text-lg text-[#F8F4E6] dark:text-[#8B4513] mt-2">
              Organize your spending into categories
            </p>
          </div>
          <Link 
            href="/categories/new" 
            className="fox-button text-lg px-6 py-3"
          >
            Add Category
          </Link>
        </div>

        <div className="fox-card">
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className="p-6 rounded-lg border-2 transition-all hover:scale-105"
                  style={{ 
                    backgroundColor: `${category.color}20`,
                    borderColor: category.color
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 
                      className="text-2xl font-heading font-bold"
                      style={{ color: category.color }}
                    >
                      {category.name}
                    </h3>
                    <div className="flex gap-2">
                      <Link 
                        href={`/categories/${category.id}/edit`}
                        className="text-[#8B4513] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64] transition-colors"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(category.id, category.name)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {category._count?.transactions || 0} transactions
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                No categories yet
              </p>
              <Link 
                href="/categories/new" 
                className="fox-button text-lg px-6 py-3 inline-block"
              >
                Create Your First Category
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}