import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../services/api';
import { Room, RoomType } from '../types';
import { Filter, ChevronDown, Star, Users, Maximize, ArrowRight, ChevronLeft, ChevronRight as ChevronRightIcon, Loader2, ImageOff } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';

export const Rooms: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('All');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | 'default'>('default');
  const [currentPage, setCurrentPage] = useState(0); // API uses 0-based index
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 6;

  const roomTypes = ['All', ...Object.values(RoomType)];

  useEffect(() => {
  const fetchRooms = async () => {
    setLoading(true);
    try {
      let response;
      const sort = priceSort === 'default' ? 'createdDate' : 'pricePerNight';
      const order = priceSort === 'default' ? 'desc' : priceSort;

      if (filterType !== 'All') {
        response = await roomApi.search({
          type: filterType as RoomType,
          page: currentPage,
          size: pageSize,
          sortBy: sort,
          sortOrder: order as any
        });
      } else {
        response = await roomApi.getAll(currentPage, pageSize, sort, order);
      }

      if (response.data.status === "success") {
        // Lọc phòng available
        const availableRooms = response.data.data.content.filter(
          (room) => room.status === 'AVAILABLE'
        );

        setRooms(availableRooms);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch rooms", error);
    } finally {
      setLoading(false);
    }
  };

  fetchRooms();
}, [currentPage, filterType, priceSort]);


  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [filterType, priceSort]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper function to determine the best image to show
  const getDisplayImage = (room: Room) => {
    // Prioritize images list first as it's more likely to be valid/updated
    if (room.images && room.images.length > 0 && room.images[0]) return room.images[0];
    if (room.thumbnailImage) return room.thumbnailImage;
    // Return a nice default hotel placeholder if no images exist
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop';
  };

  return (
    <div className="min-h-screen bg-lux-50 pt-24 pb-20 font-sans animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 mb-6">
          <Breadcrumb items={[{ label: 'Phòng nghỉ & Suites' }]} />
      </div>

      {/* Header */}
      <div className="bg-lux-900 py-16 text-center text-white relative overflow-hidden mb-8">
         <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
         <div className="relative z-10 px-4">
             <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Phòng nghỉ & Suites</h1>
             <p className="text-lux-200 max-w-2xl mx-auto">
                 Lựa chọn không gian nghỉ dưỡng hoàn hảo cho kỳ nghỉ của bạn. Từ sự ấm cúng tinh tế đến vẻ đẹp tráng lệ.
             </p>
         </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-20 z-30 bg-white border-b border-lux-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-lux-50 rounded-lg text-lux-500 font-bold text-sm shrink-0">
                      <Filter size={16}/> Bộ lọc:
                  </div>
                  {roomTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                            filterType === type 
                            ? 'bg-lux-900 text-white shadow-md' 
                            : 'bg-white border border-lux-200 text-lux-600 hover:bg-lux-50'
                        }`}
                      >
                          {type === 'All' ? 'Tất cả' : type.replace(/_/g, ' ')}
                      </button>
                  ))}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-sm font-bold text-lux-600 shrink-0">Sắp xếp:</span>
                  <div className="relative flex-1 md:flex-none">
                      <select 
                        value={priceSort}
                        onChange={(e) => setPriceSort(e.target.value as any)}
                        className="w-full md:w-48 appearance-none pl-4 pr-10 py-2 bg-white border border-lux-200 rounded-lg text-sm font-bold text-lux-900 focus:outline-none focus:border-lux-500 cursor-pointer"
                      >
                          <option value="default">Mặc định</option>
                          <option value="asc">Giá: Thấp đến Cao</option>
                          <option value="desc">Giá: Cao đến Thấp</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-lux-400 pointer-events-none"/>
                  </div>
              </div>
          </div>
      </div>

      {/* Room Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
          {loading ? (
              <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-lux-500" size={48} />
              </div>
          ) : rooms.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {rooms.map((room) => (
                        <div key={room.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-lux-200/50 transition-all duration-500 group border border-lux-100 flex flex-col h-full">
                            {/* Image */}
                            <div className="relative h-64 overflow-hidden cursor-pointer bg-lux-100" onClick={() => navigate(`/room/${room.id}`)}>
                                <img 
                                    src={getDisplayImage(room)} 
                                    alt={room.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    onError={(e) => {
                                        // Fallback to a clean placeholder if image fails to load
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop';
                                    }}
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-lux-900 shadow-sm uppercase tracking-wider z-10">
                                    {room.typeDisplay || room.type}
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60 z-10"></div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 
                                        onClick={() => navigate(`/room/${room.id}`)}
                                        className="text-xl font-serif font-bold text-lux-900 group-hover:text-lux-500 transition-colors cursor-pointer"
                                    >
                                        {room.name}
                                    </h3>
                                </div>
                                
                                <div className="flex items-center gap-4 mb-4 text-xs font-bold text-lux-500">
                                    <div className="flex items-center gap-1"><Maximize size={14}/> {room.size} m²</div>
                                    <div className="flex items-center gap-1"><Users size={14}/> {room.maxOccupancy} Khách</div>
                                    <div className="flex items-center gap-1"><Star size={14} className="text-yellow-400 fill-yellow-400"/> {room.averageRating || 5.0}</div>
                                </div>

                                <p className="text-lux-600 text-sm line-clamp-2 mb-6 flex-1">{room.description}</p>

                                <div className="pt-4 border-t border-lux-50 flex items-center justify-between mt-auto">
                                    <div>
                                        <span className="text-xl font-serif font-bold text-lux-900">${room.pricePerNight.toLocaleString()}</span>
                                        <span className="text-xs text-lux-400 font-bold"> / đêm</span>
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/room/${room.id}`)}
                                        className="px-5 py-2.5 bg-lux-50 text-lux-900 rounded-full text-sm font-bold group-hover:bg-lux-900 group-hover:text-white transition-all flex items-center gap-2"
                                    >
                                        Xem chi tiết <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3">
                         <button 
                             onClick={() => handlePageChange(currentPage - 1)}
                             disabled={currentPage === 0}
                             className="p-3 rounded-full border border-lux-200 bg-white text-lux-900 hover:bg-lux-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                         >
                             <ChevronLeft size={20}/>
                         </button>
                         
                         <span className="text-sm font-bold text-lux-600 px-4">
                             Trang {currentPage + 1} / {totalPages}
                         </span>

                         <button 
                             onClick={() => handlePageChange(currentPage + 1)}
                             disabled={currentPage === totalPages - 1}
                             className="p-3 rounded-full border border-lux-200 bg-white text-lux-900 hover:bg-lux-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                         >
                             <ChevronRightIcon size={20}/>
                         </button>
                    </div>
                )}
              </>
          ) : (
              <div className="text-center py-20">
                  <div className="flex justify-center mb-4">
                      <ImageOff size={48} className="text-lux-200" />
                  </div>
                  <p className="text-lux-500 text-lg">Không tìm thấy phòng nào phù hợp với bộ lọc của bạn.</p>
                  <button onClick={() => setFilterType('All')} className="mt-4 text-lux-900 font-bold hover:underline">Xóa bộ lọc</button>
              </div>
          )}
      </div>
    </div>
  );
};