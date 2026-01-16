import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar className="hidden md:flex" />
      <div className="flex-1 flex flex-col md:ml-64">
        <AdminHeader />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
