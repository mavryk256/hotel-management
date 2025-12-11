import React, { useState, useMemo } from 'react';
import { MessageSquare, Star, CheckCircle, EyeOff, Reply, ExternalLink, Filter, AlertCircle, BedDouble, ChevronDown } from 'lucide-react';
import { REVIEWS_DATA, ROOM_DATA } from '../../services/mockData';
import { Review } from '../../types';
import { useNavigate } from 'react-router-dom';

export const AdminReviews: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>(REVIEWS_DATA);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved' | 'Hidden'>('All');
  const [filterRoom, setFilterRoom] = useState<string>('All');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);

  // Advanced Filtering
  const filteredReviews = useMemo(() => {
      return reviews.filter(r => {
          const statusMatch = filterStatus === 'All' || r.status === filterStatus;
          const roomMatch = filterRoom === 'All' || r.roomId === filterRoom;
          return statusMatch && roomMatch;
      });
  }, [reviews, filterStatus, filterRoom]);

  // Calculate Average Rating for current view
  const averageRating = useMemo(() => {
      if (filteredReviews.length === 0) return 0;
      const total = filteredReviews.reduce((acc, curr) => acc + curr.rating, 0);
      return (total / filteredReviews.length).toFixed(1);
  }, [filteredReviews]);

  const handleStatusChange = (id: string, newStatus: 'Approved' | 'Hidden') => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, isNew: false } : r));
  };

  const handleReplySubmit = (id: string) => {
    if (!replyText[id]) return;
    setReviews(prev => prev.map(r => r.id === id ? { ...r, reply: replyText[id], status: 'Approved', isNew: false } : r));
    setOpenReplyId(null);
  };

  // Helper to get room image
  const getRoomImage = (roomId: string) => {
      const room = ROOM_DATA.find(r => r.id === roomId);
      return room ? room.images[0] : '';
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-lux-900 mb-1">Đánh giá & Phản hồi</h1>
                <p className="text-lux-500">Quản lý tiếng nói của khách hàng và chất lượng dịch vụ.</p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-lux-200 shadow-sm">
                <div className="text-right">
                    <p className="text-xs text-lux-500 font-bold uppercase tracking-wider">Đánh giá TB</p>
                    <div className="flex items-center gap-1 justify-end">
                        <span className="text-2xl font-serif font-bold text-lux-900">{averageRating}</span>
                        <Star size={16} className="text-yellow-400 fill-yellow-400 mb-1"/>
                    </div>
                </div>
                <div className="h-8 w-px bg-lux-100"></div>
                <div className="text-right">
                    <p className="text-xs text-lux-500 font-bold uppercase tracking-wider">Tổng số</p>
                    <p className="text-2xl font-serif font-bold text-lux-900">{filteredReviews.length}</p>
                </div>
            </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-lux-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
             <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <span className="text-sm font-bold text-lux-600 shrink-0 mr-2">Trạng thái:</span>
                {['All', 'Pending', 'Approved', 'Hidden'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilterStatus(f as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                            filterStatus === f 
                            ? 'bg-lux-900 text-white shadow-md' 
                            : 'bg-lux-50 text-lux-600 hover:bg-lux-100'
                        }`}
                    >
                        {f === 'All' ? 'Tất cả' : f === 'Pending' ? 'Chờ duyệt' : f === 'Approved' ? 'Đã duyệt' : 'Đã ẩn'}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
                 <Filter size={18} className="text-lux-500 shrink-0"/>
                 <div className="relative w-full md:w-64">
                     <select 
                        value={filterRoom}
                        onChange={(e) => setFilterRoom(e.target.value)}
                        className="w-full appearance-none bg-lux-50 border border-lux-200 text-lux-900 text-sm font-bold rounded-xl px-4 py-2 pr-10 outline-none focus:border-lux-500 cursor-pointer transition-colors"
                     >
                         <option value="All">Tất cả các phòng</option>
                         {ROOM_DATA.map(room => (
                             <option key={room.id} value={room.id}>{room.name}</option>
                         ))}
                     </select>
                     <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-lux-400 pointer-events-none"/>
                 </div>
            </div>
        </div>
      </header>

      <div className="space-y-6">
          {filteredReviews.length > 0 ? (
              filteredReviews.map(review => (
                  <div key={review.id} className={`bg-white rounded-2xl border ${review.isNew ? 'border-lux-500 ring-1 ring-lux-500 shadow-md' : 'border-lux-200'} shadow-sm relative transition-all hover:shadow-md overflow-hidden`}>
                      {review.isNew && (
                          <div className="absolute top-0 right-0 z-10 bg-lux-500 text-lux-900 text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
                              <AlertCircle size={10}/> Mới
                          </div>
                      )}
                      
                      <div className="flex flex-col md:flex-row">
                          {/* Room Context Section (New) */}
                          <div className="bg-lux-50 p-6 md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-lux-100 flex flex-col gap-4">
                                <div className="flex items-center gap-2 text-lux-500 mb-1">
                                    <BedDouble size={16}/>
                                    <span className="text-xs font-bold uppercase tracking-wider">Phòng được review</span>
                                </div>
                                
                                <div 
                                    onClick={() => navigate(`/room/${review.roomId}`)}
                                    className="group cursor-pointer"
                                >
                                    <div className="aspect-video rounded-lg overflow-hidden mb-3 border border-lux-200 relative">
                                        <img src={getRoomImage(review.roomId)} alt={review.roomName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                                    </div>
                                    <h4 className="font-bold text-lux-900 text-sm group-hover:text-lux-600 transition-colors flex items-center gap-1">
                                        {review.roomName} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                                    </h4>
                                    <p className="text-xs text-lux-400 font-mono mt-1">ID: {review.roomId}</p>
                                </div>
                          </div>

                          {/* Review Content Section */}
                          <div className="p-6 flex-1 flex flex-col">
                              {/* User Header */}
                              <div className="flex items-center gap-3 mb-4">
                                  <img src={review.userAvatar} alt={review.userName} className="w-10 h-10 rounded-full object-cover border border-lux-100 shadow-sm"/>
                                  <div>
                                      <h4 className="font-bold text-lux-900 text-sm">{review.userName}</h4>
                                      <p className="text-xs text-lux-500">{review.date}</p>
                                  </div>
                                  <div className="ml-auto flex gap-0.5 bg-lux-50 px-2 py-1 rounded-lg border border-lux-100">
                                      {Array.from({length: 5}).map((_, i) => (
                                          <Star key={i} size={14} className={`${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}/>
                                      ))}
                                  </div>
                              </div>

                              <div className="flex-1">
                                   <div className="relative pl-4 border-l-2 border-lux-200 mb-4">
                                       <p className="text-lux-800 leading-relaxed italic">"{review.comment}"</p>
                                   </div>

                                   {/* Reply Section */}
                                   {review.reply ? (
                                       <div className="bg-lux-50 p-4 rounded-xl border border-lux-100 flex gap-3 animate-fade-in">
                                           <div className="w-8 h-8 rounded-full bg-lux-900 flex items-center justify-center text-lux-500 shrink-0">
                                               <Reply size={14}/>
                                           </div>
                                           <div>
                                               <p className="text-xs font-bold text-lux-900 mb-1">Phản hồi từ Admin</p>
                                               <p className="text-sm text-lux-600">{review.reply}</p>
                                           </div>
                                       </div>
                                   ) : openReplyId === review.id ? (
                                       <div className="mt-4 animate-fade-in bg-lux-50 p-4 rounded-xl border border-lux-200">
                                           <textarea 
                                              className="w-full p-3 border border-lux-300 rounded-xl text-sm focus:outline-none focus:border-lux-500 focus:ring-2 focus:ring-lux-200 mb-3 bg-white"
                                              placeholder="Nhập nội dung phản hồi khách hàng..."
                                              rows={3}
                                              value={replyText[review.id] || ''}
                                              onChange={(e) => setReplyText({...replyText, [review.id]: e.target.value})}
                                           ></textarea>
                                           <div className="flex gap-2 justify-end">
                                               <button 
                                                  onClick={() => setOpenReplyId(null)}
                                                  className="px-4 py-2 bg-white border border-lux-200 text-lux-600 text-xs font-bold rounded-lg hover:bg-lux-50"
                                               >
                                                   Hủy
                                               </button>
                                               <button 
                                                  onClick={() => handleReplySubmit(review.id)}
                                                  className="px-4 py-2 bg-lux-900 text-white text-xs font-bold rounded-lg hover:bg-lux-800"
                                               >
                                                   Gửi phản hồi
                                               </button>
                                           </div>
                                       </div>
                                   ) : (
                                       <button 
                                          onClick={() => setOpenReplyId(review.id)}
                                          className="text-xs font-bold text-lux-500 hover:text-lux-900 flex items-center gap-1 mt-2 transition-colors px-3 py-1.5 hover:bg-lux-50 rounded-lg w-fit"
                                       >
                                           <Reply size={14}/> Trả lời đánh giá này
                                       </button>
                                   )}
                              </div>

                              {/* Footer Actions */}
                              <div className="pt-4 mt-4 border-t border-lux-50 flex items-center justify-between">
                                  <div className="text-xs font-bold text-lux-400 uppercase tracking-wider">
                                      Trạng thái: <span className={`${review.status === 'Approved' ? 'text-green-600' : review.status === 'Hidden' ? 'text-red-500' : 'text-yellow-600'}`}>{review.status}</span>
                                  </div>
                                  <div className="flex gap-2">
                                      {review.status === 'Pending' && (
                                          <button 
                                            onClick={() => handleStatusChange(review.id, 'Approved')}
                                            className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors border border-green-200"
                                          >
                                              <CheckCircle size={14}/> Duyệt
                                          </button>
                                      )}
                                      {review.status !== 'Hidden' && (
                                          <button 
                                            onClick={() => handleStatusChange(review.id, 'Hidden')}
                                            className="px-3 py-1.5 bg-lux-50 text-lux-500 hover:text-lux-900 hover:bg-lux-100 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors border border-lux-200"
                                          >
                                              <EyeOff size={14}/> Ẩn
                                          </button>
                                      )}
                                      {review.status === 'Hidden' && (
                                           <button 
                                            onClick={() => handleStatusChange(review.id, 'Approved')}
                                            className="px-3 py-1.5 bg-lux-50 text-lux-500 hover:text-green-700 hover:bg-green-50 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors border border-lux-200 hover:border-green-200"
                                          >
                                              <CheckCircle size={14}/> Hiện lại
                                          </button>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              ))
          ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-lux-200">
                  <div className="w-16 h-16 bg-lux-50 rounded-full flex items-center justify-center text-lux-300 mx-auto mb-4">
                      <MessageSquare size={32}/>
                  </div>
                  <p className="text-lux-500 font-medium mb-2">Không tìm thấy đánh giá nào.</p>
                  <button 
                    onClick={() => {setFilterStatus('All'); setFilterRoom('All')}}
                    className="text-lux-900 font-bold text-sm hover:underline"
                  >
                      Xóa bộ lọc
                  </button>
              </div>
          )}
      </div>
    </div>
  );
};