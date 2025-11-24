// file: src/app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-[#8B4513] dark:text-[#E6C875]">
            Your Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
            Overview of your finances
          </p>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="fox-card text-center">
            <h3 className="text-2xl font-heading text-[#8B4513] dark:text-[#E6C875]">Total Balance</h3>
            <p className="text-3xl font-bold mt-2">$0.00</p>
          </div>
          
          <div className="fox-card text-center">
            <h3 className="text-2xl font-heading text-[#8B4513] dark:text-[#E6C875]">This Month</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">$0.00</p>
          </div>
          
          <div className="fox-card text-center">
            <h3 className="text-2xl font-heading text-[#8B4513] dark:text-[#E6C875]">Budget Remaining</h3>
            <p className="text-3xl font-bold mt-2 text-red-600">$0.00</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="fox-card">
            <h3 className="text-2xl font-heading text-[#8B4513] dark:text-[#E6C875] mb-4">Spending by Category</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Pie Chart - Coming Soon
            </div>
          </div>
          
          <div className="fox-card">
            <h3 className="text-2xl font-heading text-[#8B4513] dark:text-[#E6C875] mb-4">Monthly Trend</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Line Chart - Coming Soon
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="fox-card mt-6">
          <h3 className="text-2xl font-heading text-[#8B4513] dark:text-[#E6C875] mb-4">Recent Transactions</h3>
          <div className="text-center text-gray-500 py-8">
            No transactions yet. Add your first transaction to get started!
          </div>
        </div>
      </div>
    </div>
  )
}