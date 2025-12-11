import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomApi } from '../services/api';
import { Room, Review } from '../types';
import { ArrowLeft, Star, Users, Maximize, CalendarCheck, Phone, CheckCircle2, Wifi, Coffee, Monitor, Wind, ChevronRight, Sun, Award, ShieldCheck, MessageSquare, Reply, Utensils, Flower2, X, ChevronLeft, Loader2 } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { REVIEWS_DATA } from '../services/mockData';

export const RoomDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | undefined>(undefined);
  const [activeImage, setActiveImage] = useState<string>('');
  const [similarRooms, setSimilarRooms] = useState<Room[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Review Form State
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Helper to safely get the best available image URL
  const getDisplayImage = (roomData: Room): string => {
    if (roomData.images && roomData.images.length > 0 && roomData.images[0]) return roomData.images[0];
    if (roomData.thumbnailImage) return roomData.thumbnailImage;
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop';
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await roomApi.getById(id);
        if (response.data.status === "success") {
          const fetchedRoom = response.data.data;
          setRoom(fetchedRoom);
          setActiveImage(getDisplayImage(fetchedRoom));

          const similarRes = await roomApi.getByType(fetchedRoom.type);
          if (similarRes.data.status === "success") {
             setSimilarRooms(similarRes.data.data.filter(r => r.id !== id).slice(0, 3));
          }
        }
        setReviews(REVIEWS_DATA.filter(r => r.roomId === id && r.status !== 'Hidden'));
      } catch (error) {
        console.error("Error fetching room details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBooking = () => {
    const isLoggedIn = localStorage.getItem('lux_token');
    if (room) {
        if (!isLoggedIn) {
            navigate('/login', { state: { from: `/booking?roomId=${room.id}` } });
        } else {
            navigate(`/booking?roomId=${room.id}`);
        }
    }
  }

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    const isLoggedIn = localStorage.getItem('lux_token');
    if (!isLoggedIn) {
        navigate('/login', { state: { from: `/room/${id}` } });
        return;
    }

    setIsSubmittingReview(true);
    setTimeout(() => {
        const newReview: Review = {
            id: `RV-${Date.now()}`,
            roomId: id || '',
            roomName: room?.name || '',
            userName: 'Bạn',
            userAvatar: 'https://ui-avatars.com/api/?name=You&background=D4AF37&color=fff',
            rating: userRating,
            comment: userComment,
            date: 'Vừa xong',
            status: 'Pending'
        };
        setReviews([newReview, ...reviews]);
        setIsSubmittingReview(false);
        setUserComment('');
        setShowReviewForm(false);
    }, 1000);
  }

  const getAmenityIcon = (text: string): React.JSX.Element => {
    const lower = text.toLowerCase();
    if (lower.includes('wifi')) return <Wifi size={18} />;
    if (lower.includes('bed') || lower.includes('giường')) return <Sun size={18} />;
    if (lower.includes('bar') || lower.includes('bếp') || lower.includes('ăn')) return <Coffee size={18} />;
    if (lower.includes('tv') || lower.includes('màn hình')) return <Monitor size={18} />;
    if (lower.includes('hồ bơi') || lower.includes('tắm')) return <Wind size={18} />;
    return <CheckCircle2 size={18} />;
  }

  const handlePrevImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!room) return;
      const allImages = [...new Set([...(room.images || []), room.thumbnailImage])].filter(Boolean);
      const currentIndex = allImages.indexOf(activeImage);
      const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
      setActiveImage(allImages[prevIndex]);
  }

  const handleNextImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!room) return;
      const allImages = [...new Set([...(room.images || []), room.thumbnailImage])].filter(Boolean);
      const currentIndex = allImages.indexOf(activeImage);
      const nextIndex = (currentIndex + 1) % allImages.length;
      setActiveImage(allImages[nextIndex]);
  }

  if (loading) {
      return (
        <div className="min-h-screen bg-lux-50 pt-24 pb-20 max-w-7xl mx-auto px-4 md:px-6 animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="aspect-video bg-gray-200 rounded-3xl"></div>
                    <div className="flex gap-4">
                        {[1,2,3,4].map(i => <div key={i} className="w-24 h-24 bg-gray-200 rounded-2xl"></div>)}
                    </div>
                    <div className="h-40 bg-gray-200 rounded-3xl"></div>
                </div>
                <div className="space-y-6">
                    <div className="h-80 bg-gray-200 rounded-3xl"></div>
                </div>
            </div>
        </div>
      );
  }

  if (!room) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-lux-50 font-sans pt-20">
        <div className="text-center p-8">
          <h2 className="text-2xl font-serif font-bold text-lux-900 mb-4">Không tìm thấy phòng</h2>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-lux-900 text-white rounded-full font-bold hover:bg-lux-800 transition-colors">
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lux-50 pb-20 animate-fade-in font-sans selection:bg-lux-200 pt-24">
      {/* Lightbox Modal */}
      {lightboxOpen && (
          <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center backdrop-blur-sm" onClick={() => setLightboxOpen(false)}>
              <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X size={32}/>
              </button>
              
              <button onClick={handlePrevImage} className="absolute left-4 md:left-8 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <ChevronLeft size={40}/>
              </button>

              <img 
                  src={activeImage} 
                  alt={room.name} 
                  className="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl animate-scale-in"
                  onClick={(e) => e.stopPropagation()}
              />

              <button onClick={handleNextImage} className="absolute right-4 md:right-8 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <ChevronRight size={40}/>
              </button>
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-bold bg-black/50 px-4 py-2 rounded-full">
                  {room.name}
              </div>
          </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-6">
          <Breadcrumb items={[
              { label: 'Phòng nghỉ & Suites', path: '/rooms' },
              { label: room.name }
          ]} />
          <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-lux-600 hover:text-lux-900 font-bold transition-colors group mt-2"
            >
                <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                Quay lại
            </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="space-y-4">
                <div 
                    className="rounded-3xl overflow-hidden shadow-xl shadow-lux-200/50 border border-lux-100 aspect-video md:aspect-[16/10] relative group bg-white cursor-zoom-in"
                    onClick={() => setLightboxOpen(true)}
                >
                    <img 
                            src={activeImage} 
                            alt={room.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop';
                            }}
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-lux-900 uppercase tracking-wider shadow-sm">
                        {room.typeDisplay || room.type}
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full font-bold text-lux-900 shadow-lg flex items-center gap-2">
                            <Maximize size={16}/> Xem toàn màn hình
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {[...new Set([...(room.images || []), room.thumbnailImage])].filter(Boolean).map((img, idx) => (
                        <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`relative flex-shrink-0 w-24 h-24 md:w-32 md:h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                            activeImage === img 
                            ? 'border-lux-500 ring-4 ring-lux-500/10 opacity-100' 
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                        >
                        <img 
                          src={img} 
                          alt={`View ${idx}`} 
                          className="w-full h-full object-cover" 
                          onError={(e) => e.currentTarget.style.display = 'none'} 
                        />
                        </button>
                    ))}
                </div>
            </div>

            {/* Highlights */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-lux-100 shadow-sm">
                <h3 className="font-serif font-bold text-2xl text-lux-900 mb-6">Điểm nổi bật</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="flex flex-col items-center text-center p-4 bg-lux-50 rounded-2xl hover:bg-lux-100 transition-colors">
                         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-lux-500 shadow-sm mb-3">
                             <Sun size={24}/>
                         </div>
                         <h4 className="font-bold text-lux-900 mb-1">View {room.viewDisplay || room.view}</h4>
                         <p className="text-xs text-lux-600">Tầm nhìn tuyệt đẹp.</p>
                     </div>
                     <div className="flex flex-col items-center text-center p-4 bg-lux-50 rounded-2xl hover:bg-lux-100 transition-colors">
                         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-lux-500 shadow-sm mb-3">
                             <Award size={24}/>
                         </div>
                         <h4 className="font-bold text-lux-900 mb-1">Nội Thất Cao Cấp</h4>
                         <p className="text-xs text-lux-600">Giường {room.bedTypeDisplay || room.bedType}.</p>
                     </div>
                     <div className="flex flex-col items-center text-center p-4 bg-lux-50 rounded-2xl hover:bg-lux-100 transition-colors">
                         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-lux-500 shadow-sm mb-3">
                             <ShieldCheck size={24}/>
                         </div>
                         <h4 className="font-bold text-lux-900 mb-1">Tiện Nghi Đầy Đủ</h4>
                         <p className="text-xs text-lux-600">{room.hasBalcony ? 'Có ban công, ' : ''} {room.hasBathroom ? 'Phòng tắm riêng' : ''}</p>
                     </div>
                </div>
            </div>

            {/* Description */}
             <div className="bg-white p-6 md:p-8 rounded-3xl border border-lux-100 shadow-sm">
                <h2 className="text-2xl font-serif font-bold text-lux-900 mb-4">Mô tả chi tiết</h2>
                <p className="text-lux-600 leading-relaxed text-lg">{room.description}</p>
                {room.notes && (
                    <div className="mt-4 p-4 bg-lux-50 rounded-xl border border-lux-200">
                        <p className="text-sm text-lux-700 italic">Note: {room.notes}</p>
                    </div>
                )}
             </div>

             {/* Amenities */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-lux-100 shadow-sm">
                 <h3 className="font-serif font-bold text-2xl text-lux-900 mb-6">Tiện nghi phòng</h3>
                 <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                     {room.amenities.map((amenity, idx) => (
                         <div key={idx} className="flex items-center gap-4 p-3 hover:bg-lux-50 rounded-xl transition-colors group">
                             <div className="w-10 h-10 rounded-full bg-lux-100 flex items-center justify-center text-lux-600 shrink-0 group-hover:bg-lux-900 group-hover:text-white transition-colors">
                                 {getAmenityIcon(amenity)}
                             </div>
                             <div>
                                 <p className="font-bold text-lux-900 text-sm">{amenity}</p>
                                 <p className="text-xs text-lux-400">Tiêu chuẩn 5 sao</p>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>

             {/* Review Section */}
             <div className="bg-white p-6 md:p-8 rounded-3xl border border-lux-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                     <div>
                         <h2 className="text-2xl font-serif font-bold text-lux-900 mb-2">Đánh giá từ khách hàng</h2>
                         <div className="flex items-center gap-2">
                             <div className="flex text-yellow-400"><Star fill="currentColor" size={20}/></div>
                             <span className="font-bold text-lux-900 text-lg">{room.averageRating || 5.0}</span>
                             <span className="text-lux-500">({room.totalReviews || reviews.length} lượt đánh giá)</span>
                         </div>
                     </div>
                     <button 
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="px-4 py-2 bg-lux-900 text-white rounded-xl font-bold text-sm hover:bg-lux-800 transition-colors flex items-center gap-2 shadow-lg shadow-lux-900/10"
                     >
                         <MessageSquare size={16}/> Viết đánh giá
                     </button>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                    <form onSubmit={handleSubmitReview} className="mb-8 bg-lux-50 p-6 rounded-2xl border border-lux-100 animate-fade-in">
                        <h4 className="font-bold text-lux-900 mb-4">Chia sẻ trải nghiệm của bạn</h4>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-lux-500 uppercase tracking-wider mb-2">Đánh giá của bạn</label>
                            <div className="flex gap-2">
                                {[1,2,3,4,5].map(star => (
                                    <button type="button" key={star} onClick={() => setUserRating(star)} className="focus:outline-none hover:scale-110 transition-transform">
                                        <Star size={24} className={`${star <= userRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'} transition-colors`}/>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-lux-500 uppercase tracking-wider mb-2">Bình luận</label>
                            <textarea 
                                required
                                value={userComment} 
                                onChange={(e) => setUserComment(e.target.value)}
                                rows={3} 
                                className="w-full p-3 rounded-xl border border-lux-200 outline-none focus:border-lux-500 text-sm focus:ring-2 focus:ring-lux-200"
                                placeholder="Hãy cho chúng tôi biết cảm nhận của bạn..."
                            ></textarea>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowReviewForm(false)} className="px-4 py-2 text-lux-600 font-bold text-sm hover:bg-lux-100 rounded-lg">Hủy</button>
                            <button disabled={isSubmittingReview} type="submit" className="px-6 py-2 bg-lux-900 text-white rounded-xl font-bold text-sm hover:bg-lux-800 disabled:opacity-70 flex items-center gap-2">
                                {isSubmittingReview && <Loader2 size={14} className="animate-spin"/>}
                                {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="space-y-6">
                    {reviews.length > 0 ? reviews.map(review => (
                        <div key={review.id} className="border-b border-lux-50 last:border-0 pb-6 last:pb-0 animate-fade-in-up">
                            <div className="flex gap-4">
                                <img src={review.userAvatar} className="w-10 h-10 rounded-full object-cover border border-lux-100" alt={review.userName}/>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-lux-900 text-sm">{review.userName}</h4>
                                        <span className="text-xs text-lux-400">{review.date}</span>
                                    </div>
                                    <div className="flex gap-0.5 mb-2">
                                        {Array.from({length: 5}).map((_, i) => (
                                            <Star key={i} size={12} className={`${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}/>
                                        ))}
                                    </div>
                                    <p className="text-lux-700 text-sm leading-relaxed mb-3">{review.comment}</p>
                                    
                                    {review.reply && (
                                        <div className="bg-lux-50 p-3 rounded-xl border border-lux-100 flex gap-3 mt-2">
                                            <div className="w-6 h-6 rounded-full bg-lux-900 flex items-center justify-center text-lux-500 shrink-0 mt-0.5">
                                                <Reply size={12}/>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-lux-900 mb-1">Phản hồi từ Moon Palace</p>
                                                <p className="text-xs text-lux-600 leading-relaxed">{review.reply}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-lux-500 text-center py-4">Chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm!</p>
                    )}
                </div>
             </div>
          </div>

          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg shadow-lux-200/50 border border-lux-100  top-24">
               
               <div className="mb-6 border-b border-lux-50 pb-6">
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-lux-900 leading-tight mb-2">{room.name}</h1>
                  <div className="flex items-center gap-2 mb-4">
                      <Star className="text-yellow-400 fill-yellow-400" size={18} />
                      <span className="font-bold text-lux-900">{room.averageRating || 5.0}</span>
                  </div>
                  
                  <div className="flex items-end gap-2">
                      <span className="text-4xl font-serif font-bold text-lux-900">${room.pricePerNight.toLocaleString()}</span>
                      <span className="text-lux-500 font-medium mb-1">/ đêm</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-lux-50 rounded-xl">
                      <Maximize className="text-lux-400" size={20} />
                      <div>
                          <p className="text-xs text-lux-400 uppercase font-bold">Diện tích</p>
                          <p className="text-lux-900 font-bold">{room.size} m²</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-lux-50 rounded-xl">
                      <Users className="text-lux-400" size={20} />
                      <div>
                          <p className="text-xs text-lux-400 uppercase font-bold">Sức chứa</p>
                          <p className="text-lux-900 font-bold">{room.maxOccupancy} Người</p>
                      </div>
                  </div>
               </div>

               <button onClick={handleBooking} className="w-full bg-lux-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-lux-800 transition-all shadow-xl shadow-lux-900/20 flex items-center justify-center gap-2 group transform active:scale-[0.98]">
                   <CalendarCheck size={20} />
                   Đặt phòng ngay
               </button>
               <p className="text-xs text-center text-lux-400 mt-3 flex items-center justify-center gap-1">
                   <CheckCircle2 size={12}/> Xác nhận tức thì • Không cần thẻ tín dụng
               </p>
            </div>
            
            {/* Cross-sell Services */}
            <div className="bg-white p-6 rounded-3xl border border-lux-100 shadow-sm">
                <h3 className="font-serif font-bold text-xl text-lux-900 mb-4">Nâng tầm trải nghiệm</h3>
                <div className="space-y-3">
                    <div onClick={() => navigate('/menu')} className="flex items-center gap-3 p-3 bg-lux-50 rounded-xl cursor-pointer hover:bg-lux-100 transition-colors group">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-lux-500 group-hover:text-lux-900">
                            <Utensils size={20}/>
                        </div>
                        <div>
                            <p className="font-bold text-lux-900 text-sm">Đặt bàn tối</p>
                            <p className="text-xs text-lux-500">Nhà hàng The Eclipse</p>
                        </div>
                        <ChevronRight size={16} className="ml-auto text-lux-300 group-hover:text-lux-500"/>
                    </div>
                    <div onClick={() => navigate('/services')} className="flex items-center gap-3 p-3 bg-lux-50 rounded-xl cursor-pointer hover:bg-lux-100 transition-colors group">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-lux-500 group-hover:text-lux-900">
                            <Flower2 size={20}/>
                        </div>
                        <div>
                            <p className="font-bold text-lux-900 text-sm">Spa & Relax</p>
                            <p className="text-xs text-lux-500">Giảm 20% cho khách đặt phòng</p>
                        </div>
                        <ChevronRight size={16} className="ml-auto text-lux-300 group-hover:text-lux-500"/>
                    </div>
                </div>
            </div>

             <div className="bg-gradient-to-br from-lux-50 to-white p-6 rounded-2xl border border-lux-100 flex items-center gap-4 shadow-sm">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-lux-500 shadow-md border border-lux-50">
                     <Phone size={24} />
                 </div>
                 <div>
                     <p className="font-serif font-bold text-lux-900 text-lg">0909 123 456</p>
                     <p className="text-xs text-lux-500 uppercase tracking-wider font-bold">Hỗ trợ 24/7</p>
                 </div>
             </div>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-lux-100">
            <h2 className="text-3xl font-serif font-bold text-lux-900 mb-8">Có thể bạn sẽ thích</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {similarRooms.map((similar) => (
                    <div key={similar.id} onClick={() => navigate(`/room/${similar.id}`)} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-lux-100 hover:shadow-xl transition-all cursor-pointer group">
                        <div className="h-48 overflow-hidden relative">
                             <img 
                                src={getDisplayImage(similar)} 
                                alt={similar.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop';
                                }}
                             />
                             <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-lg text-xs font-bold text-lux-900">{similar.typeDisplay || similar.type}</div>
                        </div>
                        <div className="p-5">
                            <h4 className="font-bold text-lux-900 text-lg mb-1 group-hover:text-lux-500 transition-colors">{similar.name}</h4>
                            <div className="flex justify-between items-center">
                                <span className="text-lux-500 font-bold">${similar.pricePerNight.toLocaleString()}<span className="text-xs text-lux-400 font-normal">/đêm</span></span>
                                <div className="w-8 h-8 rounded-full bg-lux-50 flex items-center justify-center text-lux-900 group-hover:bg-lux-900 group-hover:text-white transition-colors">
                                    <ChevronRight size={16}/>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};