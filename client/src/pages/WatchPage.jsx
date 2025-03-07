import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useContentStore } from "../store/content";
import axios from "axios";
import Navbar from "../components/Navbar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReactPlayer from "react-player";
import { ORIGINAL_IMG_BASE_URL, SMALL_IMG_BASE_URL } from "../utils/constants";
import { formatReleaseDate } from "../utils/dateFunction";
import WatchPageSkeleton from "../components/skeletons/WatchPageSkeleton";

const WatchPage = () => {
    const { id } = useParams();
    const [trailers, setTrailers] = useState([]);
    const [currentTrailerIdx, setCurrentTrailerIdx] = useState(-1); // -1: BE, >=0: YT
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState({});
    const [similarContent, setSimilarContent] = useState([]);
    const [videoExists, setVideoExists] = useState(false); // Khởi tạo false để tránh hiển thị sai ban đầu
    const { contentType } = useContentStore();

    const sliderRef = useRef(null);

    // Lấy danh sách trailer từ YouTube
    useEffect(() => {
        const getTrailers = async () => {
            try {
                const res = await axios.get(`/api/v1/${contentType}/${id}/trailers`);
                setTrailers(res.data.trailers);
            } catch (error) {
                if (error.message.includes("404")) {
                    setTrailers([]);
                }
            }
        };
        getTrailers();
    }, [contentType, id]);

    // Lấy danh sách nội dung tương tự
    useEffect(() => {
        const getSimilarContent = async () => {
            try {
                const res = await axios.get(`/api/v1/${contentType}/${id}/similar`);
                setSimilarContent(res.data.similar);
            } catch (error) {
                if (error.message.includes("404")) {
                    setSimilarContent([]);
                }
            }
        };
        getSimilarContent();
    }, [contentType, id]);

    // Lấy chi tiết nội dung
    useEffect(() => {
        const getContentDetails = async () => {
            try {
                const res = await axios.get(`/api/v1/${contentType}/${id}/details`);
                setContent(res.data.content);
            } catch (error) {
                if (error.message.includes("404")) {
                    setContent(null);
                }
            } finally {
                setLoading(false);
            }
        };
        getContentDetails();
    }, [contentType, id]);

    // Kiểm tra video stream từ BE
    useEffect(() => {
        const checkVideo = async () => {
            try {
                await axios.head(`/api/v1/stream/${id}`); // Chỉ kiểm tra header
                setVideoExists(true);
            } catch (error) {
                setVideoExists(false);
            }
        };
        checkVideo();
    }, [id]);

    const handleNext = () => {
        if (currentTrailerIdx < trailers.length - 1) setCurrentTrailerIdx(currentTrailerIdx + 1);
    };
    const handlePrev = () => {
        if (currentTrailerIdx > -1) setCurrentTrailerIdx(currentTrailerIdx - 1);
    };

    const scrollLeft = () => {
        sliderRef.current?.scrollBy({ left: -sliderRef.current.offsetWidth, behavior: "smooth" });
    };
    const scrollRight = () => {
        sliderRef.current?.scrollBy({ left: sliderRef.current.offsetWidth, behavior: "smooth" });
    };

    if (loading) {
        return (
            <div className='min-h-screen bg-black p-10'>
                <WatchPageSkeleton />
            </div>
        );
    }

    if (!content) {
        return (
            <div className='bg-black text-white h-screen'>
                <div className='max-w-6xl mx-auto'>
                    <Navbar />
                    <div className='text-center mx-auto px-4 py-8 h-full mt-40'>
                        <h2 className='text-2xl sm:text-5xl font-bold text-balance'>Content not found 😥</h2>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-black min-h-screen text-white'>
            <div className='mx-auto container px-4 py-8 h-full'>
                <Navbar />

                {/* Nút điều hướng trailer */}
                {trailers.length > 0 && (
                    <div className='flex justify-between items-center mb-4'>
                        <button
                            className={`bg-gray-500/70 hover:bg-gray-500 text-white py-2 px-4 rounded ${
                                currentTrailerIdx === -1 || !videoExists ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={currentTrailerIdx === -1 || !videoExists}
                            onClick={handlePrev}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            className={`bg-gray-500/70 hover:bg-gray-500 text-white py-2 px-4 rounded ${
                                currentTrailerIdx === trailers.length - 1 ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={currentTrailerIdx === trailers.length - 1}
                            onClick={handleNext}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                )}

                {/* Phần phát video */}
                <div className='aspect-video mb-8 p-2 sm:px-10 md:px-32'>
                    <ReactPlayer
                        url={
                            currentTrailerIdx === -1 && videoExists
                                ? `/api/v1/stream/${id}`
                                : trailers.length > 0 && currentTrailerIdx >= 0
                                ? `https://www.youtube.com/watch?v=${trailers[currentTrailerIdx].key}`
                                : null
                        }
                        controls={true}
                        width="100%"
                        height="70vh"
                        className='mx-auto overflow-hidden rounded-lg'
                        config={{
                            file: {
                                attributes: {
                                    crossOrigin: "anonymous",
                                },
                            },
                        }}
                    />
                    {!videoExists && trailers.length === 0 && (
                        <h2 className='text-xl text-center mt-5'>
                            No video available for{" "}
                            <span className='font-bold text-red-600'>{content?.title || content?.name}</span> 😥
                        </h2>
                    )}
                </div>

                {/* Danh sách chọn nguồn video */}
                {(videoExists || trailers.length > 0) && (
                    <div className='mb-8'>
                        <h3 className='text-xl font-semibold mb-2'>Available Videos</h3>
                        <div className='flex gap-4 overflow-x-auto'>
                            {videoExists && (
                                <button
                                    className={`py-2 px-4 rounded ${
                                        currentTrailerIdx === -1 ? "bg-red-600" : "bg-gray-500"
                                    }`}
                                    onClick={() => setCurrentTrailerIdx(-1)}
                                >
                                    Main Video (Stream)
                                </button>
                            )}
                            {trailers.map((trailer, idx) => (
                                <button
                                    key={trailer.key}
                                    className={`py-2 px-4 rounded ${
                                        currentTrailerIdx === idx ? "bg-red-600" : "bg-gray-500"
                                    }`}
                                    onClick={() => setCurrentTrailerIdx(idx)}
                                >
                                    Trailer {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Movie details */}
                <div className='flex flex-col md:flex-row items-center justify-between gap-20 max-w-6xl mx-auto'>
                    <div className='mb-4 md:mb-0'>
                        <h2 className='text-5xl font-bold text-balance'>{content?.title || content?.name}</h2>
                        <p className='mt-2 text-lg'>
                            {formatReleaseDate(content?.release_date || content?.first_air_date)} |{" "}
                            {content?.adult ? (
                                <span className='text-red-600'>18+</span>
                            ) : (
                                <span className='text-green-600'>PG-13</span>
                            )}
                        </p>
                        <p className='mt-4 text-lg'>{content?.overview}</p>
                    </div>
                    <img
                        src={ORIGINAL_IMG_BASE_URL + content?.poster_path}
                        alt='Poster image'
                        className='max-h-[600px] rounded-md'
                    />
                </div>

                {/* Similar content */}
                {similarContent.length > 0 && (
                    <div className='mt-12 max-w-5xl mx-auto relative'>
                        <h3 className='text-3xl font-bold mb-4'>Similar Movies/Tv Show</h3>
                        <div className='flex overflow-x-scroll scrollbar-hide gap-4 pb-4 group' ref={sliderRef}>
                            {similarContent.map((content) => {
                                if (content.poster_path === null) return null;
                                return (
                                    <Link key={content.id} to={`/watch/${content.id}`} className='w-52 flex-none'>
                                        <img
                                            src={SMALL_IMG_BASE_URL + content.poster_path}
                                            alt='Poster path'
                                            className='w-full h-auto rounded-md'
                                        />
                                        <h4 className='mt-2 text-lg font-semibold'>{content.title || content.name}</h4>
                                    </Link>
                                );
                            })}
                            <ChevronRight
                                className='absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer bg-red-600 text-white rounded-full'
                                onClick={scrollRight}
                            />
                            <ChevronLeft
                                className='absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer bg-red-600 text-white rounded-full'
                                onClick={scrollLeft}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WatchPage;