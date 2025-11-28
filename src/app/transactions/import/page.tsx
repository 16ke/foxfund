'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, Download, AlertCircle } from 'lucide-react'

export default function ImportTransactionsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/transactions/import', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(`Successfully imported ${result.imported} transactions!`)
        
        // Redirect to transactions page after 2 seconds
        setTimeout(() => {
          router.push('/transactions')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to import transactions')
      }
    } catch {
      setError('Failed to upload file. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = `date,amount,type,description,merchant,category
2024-01-15,25.50,expense,Coffee shop,Starbucks,Food & Dining
2024-01-16,1500.00,income,Monthly salary,Company Inc,Income
2024-01-17,89.99,expense,Online shopping,Amazon,Shopping`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = 'foxfund-template.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/transactions" className="text-[#F8F4E6] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64] transition-colors font-button">
            ← Back to Transactions
          </Link>
          <h1 className="text-4xl font-heading text-[#F8F4E6] dark:text-[#A86A3D] mt-4">
            Import Transactions
          </h1>
          <p className="text-lg text-[#F8F4E6] dark:text-[#8B4513] mt-2">
            Upload a CSV file to import multiple transactions at once
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="fox-card">
            <h2 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875] mb-6">
              Upload CSV File
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-lg font-heading text-[#A86A3D] dark:text-[#E6C875] mb-3">
                  Select CSV File
                </label>
                <div className="border-2 border-dashed border-[#8B4513] dark:border-[#A86A3D] rounded-lg p-8 text-center transition-colors hover:border-solid hover:bg-[#8B4513] hover:bg-opacity-10">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={loading}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className={`cursor-pointer flex flex-col items-center justify-center gap-3 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload className="w-12 h-12 text-[#8B4513] dark:text-[#A86A3D]" />
                    <div>
                      <p className="text-lg font-button text-[#8B4513] dark:text-[#A86A3D]">
                        {loading ? 'Processing...' : 'Click to upload CSV'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Supports .csv files only
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-[#F8F4E6] dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
                  File Requirements:
                </h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• CSV format with header row</li>
                  <li>• Required columns: date, amount, type</li>
                  <li>• Optional columns: description, merchant, category</li>
                  <li>• Date format: YYYY-MM-DD</li>
                  <li>• Type: &quot;income&quot; or &quot;expense&quot;</li>
                  <li>• Amount: Positive numbers only</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Template & Instructions */}
          <div className="fox-card">
            <h2 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875] mb-6">
              CSV Template & Format
            </h2>

            <div className="space-y-6">
              {/* Download Template */}
              <div>
                <button
                  onClick={downloadTemplate}
                  className="w-full fox-button flex items-center justify-center gap-3"
                >
                  <Download className="w-5 h-5" />
                  Download Template
                </button>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                  Use our template to ensure proper formatting
                </p>
              </div>

              {/* Format Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
                    Expected Columns:
                  </h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      date, amount, type, description, merchant, category
                    </code>
                  </div>
                </div>

                <div>
                  <h4 className="font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
                    Example Data:
                  </h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto">
                    <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre">
{`date,amount,type,description,merchant,category
2024-01-15,25.50,expense,Coffee shop,Starbucks,Food & Dining
2024-01-16,1500.00,income,Monthly salary,Company Inc,Income
2024-01-17,89.99,expense,Online shopping,Amazon,Shopping`}
                    </pre>
                  </div>
                </div>

                <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 rounded-lg p-4">
                  <h4 className="font-heading text-yellow-800 dark:text-yellow-200 mb-2">
                    Important Notes:
                  </h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• Categories will be created if they don&apos;t exist</li>
                    <li>• Duplicate transactions may be skipped</li>
                    <li>• Maximum file size: 5MB</li>
                    <li>• Transactions are imported for your account only</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}