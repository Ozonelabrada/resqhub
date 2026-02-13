import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ExternalLink,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommunityMember } from '@/types/community';

interface VolunteersGridProps {
  volunteers: CommunityMember[];
  onDirectChat: (userId: string, userName: string) => void;
  onViewProfile: (userId: string) => void;
  onAddVolunteer: () => void;
  isEmpty: boolean;
}

/**
 * Volunteers table component with pagination and search
 */
const VolunteersGrid: React.FC<VolunteersGridProps> = ({
  volunteers,
  onDirectChat,
  onViewProfile,
  onAddVolunteer,
  isEmpty,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter(volunteer => {
      const matchesSearch = 
        volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        volunteer.username.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [volunteers, searchQuery]);

  const totalPages = Math.ceil(filteredVolunteers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVolunteers = filteredVolunteers.slice(startIndex, endIndex);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 space-y-4">
        <div className="text-6xl">🤝</div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
          No Volunteers Yet
        </h3>
        <p className="text-slate-500 text-sm font-medium">
          Start by adding volunteers to your community!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all font-bold text-slate-700"
          />
        </div>
        <button
          onClick={onAddVolunteer}
          className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-purple-200 flex items-center gap-2 whitespace-nowrap"
        >
          <UserPlus size={18} />
          Add Volunteer
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Volunteer</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Username</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">Joined</th>
              <th className="px-6 py-4 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedVolunteers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <p className="text-slate-500 font-semibold">No volunteers found</p>
                </td>
              </tr>
            ) : (
              paginatedVolunteers.map((volunteer) => {
                const joinedDate = new Date(volunteer.joinedAt);
                
                return (
                  <tr key={volunteer.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-sm font-black text-white">
                          {volunteer.name?.charAt(0) || 'V'}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{volunteer.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-600">@{volunteer.username}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-600">
                        {joinedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onDirectChat(volunteer.id, volunteer.name)}
                          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-purple-600 transition-all"
                          title="Send message"
                        >
                          <MessageCircle size={18} />
                        </button>
                        <button
                          onClick={() => onViewProfile(volunteer.id)}
                          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-purple-600 transition-all"
                          title="View profile"
                        >
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredVolunteers.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-500">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredVolunteers.length)} of {filteredVolunteers.length} volunteer{filteredVolunteers.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "px-3 py-1 rounded-lg font-bold text-sm transition-all",
                    currentPage === page
                      ? "bg-purple-500 text-white"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteersGrid;
