'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, ArrowLeft, Filter, Search, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'

interface Ticket {
  id: string
  userId: string
  userName: string
  category: string
  subject: string
  status: string
  messages: Array<{
    id: string
    from: string
    message: string
    timestamp: string
  }>
  createdAt: string
}

export default function SupportTicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('open')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true'
    if (!isAuthenticated) {
      router.push('/admin')
      return
    }

    fetchTickets()
  }, [router, filter])

  const fetchTickets = async () => {
    try {
      const response = await fetch(`/api/admin/support?status=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (ticketId: string, message: string) => {
    // Implement reply functionality
    alert('Reply functionality would be implemented here')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
                <p className="text-sm text-gray-500">Manage customer support requests</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              {['open', 'assigned', 'resolved', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-6 py-4 font-medium text-sm transition-colors ${
                    filter === status
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({tickets.filter(t => t.status.toUpperCase() === status.toUpperCase()).length})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-colors ${
                  selectedTicket?.id === ticket.id ? 'border-2 border-primary-500' : 'border border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                    <p className="text-sm text-gray-500">{ticket.userName}</p>
                  </div>
                  {ticket.status === 'OPEN' && <Clock className="w-4 h-4 text-yellow-600" />}
                  {ticket.status === 'RESOLVED' && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {ticket.status === 'CLOSED' && <XCircle className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {ticket.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Ticket Detail */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      From: {selectedTicket.userName} • {selectedTicket.category}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTicket.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' :
                    selectedTicket.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>

                {/* Messages */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-lg ${
                        msg.from === 'USER' ? 'bg-gray-50' : 'bg-primary-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">
                          {msg.from === 'USER' ? selectedTicket.userName : 'Admin'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{msg.message}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Section */}
                <div className="border-t pt-4">
                  <textarea
                    placeholder="Type your reply..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 mb-3"
                    rows={4}
                  ></textarea>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium">
                      Send Reply
                    </button>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a ticket to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

