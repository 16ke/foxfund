// file: src/app/categories/[id]/edit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  color: string
  _count: {
    transactions: number
  }
}

const COLOR_OPTIONS = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#84CC16', // Lime
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#8B4513', // Brown
  '#D4AF37', // Gold
]

export default function EditCategoryPage() {
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const params = useParams()

  const [formData, setFormData] = useState({
    name: '',
    color: COLOR_OPTIONS[0]
  })

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${params.id}`)
        if (response.ok) {
          const categoryData = await response.json()
          setCategory(categoryData)
          setFormData({
            name: categoryData.name,
            color: categoryData.color
          })
        }
      } catch (err) {
        console.error('Failed to fetch category:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/categories/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/categories')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update category')
      }
    } catch {
      alert('Failed to update category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/categories')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete category')
      }
    } catch {
      alert('Failed to delete category')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
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

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875]">
          Category not found
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/categories"
            className="text-[#F8F4E6] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64] transition-colors font-button"
          >
            ← Back to Categories
          </Link>
          <h1 className="text-4xl font-heading text-[#F8F4E6] dark:text-[#A86A3D] mt-4">
            Edit Category
          </h1>
        </div>

        <div className="fox-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Name */}
            <div>
              <label className="block text-lg font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
                Category Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="fox-input"
                placeholder="e.g., Food & Dining, Transportation, Entertainment"
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-lg font-heading text-[#A86A3D] dark:text-[#E6C875] mb-4">
                Color *
              </label>
              <div className="grid grid-cols-5 gap-4">
                {COLOR_OPTIONS.map((color) => (
                  <div key={color} className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-12 h-12 rounded-full border-4 transition-all hover:scale-110 ${
                        formData.color === color
                          ? 'border-[#8B4513] dark:border-[#E6C875]'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                    {formData.color === color && (
                      <span className="text-xs mt-1 text-[#8B4513] dark:text-[#E6C875] font-medium">
                        Selected
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 rounded-lg border-2 border-[#8B4513] dark:border-[#A86A3D] bg-[#F8F4E6] dark:bg-[#333333]">
                <p className="text-sm text-[#8B4513] dark:text-[#E6C875] text-center">
                  Preview: Your category will look like this
                </p>
                <div
                  className="mt-2 p-3 rounded-lg text-center font-heading text-lg font-bold"
                  style={{
                    backgroundColor: `${formData.color}20`,
                    color: formData.color,
                    border: `2px solid ${formData.color}`
                  }}
                >
                  {formData.name || 'Category Name'}
                </div>
              </div>
            </div>

            {/* Transaction Count Warning */}
            {category._count.transactions > 0 && (
              <div className="p-4 rounded-lg border-2 border-amber-500 bg-amber-50 dark:bg-amber-900/20">
                <p className="text-amber-800 dark:text-amber-200 text-center">
                  ⚠️ This category has {category._count.transactions} transaction(s). 
                  If you delete it, those transactions will become uncategorized.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="fox-button text-lg px-8 py-3 disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Category'}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="px-8 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors font-button text-lg"
              >
                Delete
              </button>

              <Link
                href="/categories"
                className="px-8 py-3 border-2 border-[#8B4513] dark:border-[#A86A3D] text-[#F8F4E6] dark:text-[#E6C875] rounded-lg hover:bg-[#8B4513] hover:text-white dark:hover:bg-[#A86A3D] dark:hover:text-white transition-colors font-button text-lg"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
