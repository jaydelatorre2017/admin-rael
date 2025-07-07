import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';
import IDCard from './IDCard';
import useSwalTheme from '../../utils/useSwalTheme';
import { API_URL, headername, keypoint } from '../../utils/config';
import { Skeleton } from '@mui/material';

const ParticipantIDGeneratorSingle = () => {
    const [participants, setParticipants] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [index, setIndex] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const cardRef = useRef();
    const SwalInstance = useSwalTheme();

    useEffect(() => {
        const fetchParticipants = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/api/registration/get_data_id`, {
                    headers: { [headername]: keypoint },
                });
                const data = await res.json();
                setParticipants(data);
                setFiltered(data);
                SwalInstance.close();
            } catch (err) {
                SwalInstance.fire({
                    icon: 'error',
                    title: 'Failed to fetch participants',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchParticipants();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const result = participants.filter((p) =>
            p.name?.trim().toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(result);
        setIndex(0);
    }, [search, participants]);

    const saveAsPDF = async () => {
        const participant = filtered[index];
        if (!cardRef.current || !participant) return;

        await document.fonts.ready;

        const CARD_WIDTH_PX = 350;
        const CARD_HEIGHT_PX = 520;
        const SCALE = 3;

        const canvas = await html2canvas(cardRef.current, {
            width: CARD_WIDTH_PX,
            height: CARD_HEIGHT_PX,
            scale: SCALE,
            useCORS: true,
            backgroundColor: null,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = await PDFDocument.create();
        const CARD_WIDTH_PT = (CARD_WIDTH_PX / 96) * 72;
        const CARD_HEIGHT_PT = (CARD_HEIGHT_PX / 96) * 72;

        const page = pdf.addPage([CARD_WIDTH_PT, CARD_HEIGHT_PT]);
        const pngImage = await pdf.embedPng(imgData);

        page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: CARD_WIDTH_PT,
            height: CARD_HEIGHT_PT,
        });

        const pdfBytes = await pdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${participant.name.trim()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const hasData = participants.length > 0;
    const hasMatch = filtered.length > 0;

    return (
        <div
            className={`flex flex-col md:flex-row w-full items-center p-4 md:h-screen md:justify-center pt-10 md:pt-0 bg-cover bg-center ${loading ? 'bg-none' : ''}`}
            style={!loading ? { backgroundImage: "url('/bg.jpg')" } : {}}
        >
            {/* 🔲 Glass Wrapper Container */}
            <div className='flex flex-col md:flex-row w-full max-w-6xl rounded-3xl backdrop-blur-xl bg-white/10 border border-white/30 shadow-2xl p-6'>

                {/* Illustration */}
                <div className='hidden md:flex md:w-1/2 flex-col items-center justify-center h-[700px] relative'>
                    {loading ? (
                        <Skeleton variant='rectangular' width={400} height={400} animation='wave' />
                    ) : (
                        <>
                            <img src='3ds.png' alt='ID Illustration' className='h-full object-contain z-0' />

                            {/* Glass Text Overlay */}
                            <div className='absolute bottom-6 bg-black/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 shadow-md text-center z-10'>
                                <h2 className='text-2xl font-bold text-white tracking-wide drop-shadow'>
                                    Welcome!
                                </h2>
                                <p className='text-base text-white/80 mt-1 drop-shadow-sm'>
                                    Download your Digital ID below
                                </p>
                            </div>
                        </>
                    )}
                </div>



                {/* ID Card Generator */}
                <div className='w-full md:w-1/2 flex flex-col items-center'>

                    {loading ? (
                        <div className='flex flex-col items-center w-full gap-4'>
                            <Skeleton variant='rounded' width={350} height={40} animation='wave' />
                            <Skeleton variant='rounded' width={350} height={520} animation='wave' />
                            <div className='flex flex-row gap-4 mt-4'>
                                <Skeleton variant='rectangular' width={80} height={40} />
                                <Skeleton variant='rectangular' width={140} height={40} />
                                <Skeleton variant='rectangular' width={80} height={40} />
                            </div>
                            <Skeleton width={200} height={20} />
                        </div>
                    ) : hasData && (
                        <div className='flex flex-col items-center w-full  '>


                            <div className='block md:hidden max-w-5xl mx-auto p-4 text-center text-white'>
                                <h2 className='text-2xl font-semibold drop-shadow'>
                                    Download your Digital ID
                                </h2>
                            </div>

                            {/* Search Input */}
                            {/* Search Input */}
                            <div className='w-full max-w-[350px] p-[2px] rounded-full bg-black/40 backdrop-blur-lg shadow-md border border-white/30'>

                                <input
                                    type='text'
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className='w-full bg-black/50 text-white placeholder-white/70 px-4 py-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400'
                                    placeholder='Search your name...'
                                />
                            </div>


                            {/* ID Card Preview */}
                            <div className='w-full overflow-x-auto flex justify-center mt-4'>
                                <div ref={cardRef}>
                                    <IDCard participant={hasMatch ? filtered[index] : participants[index]} />
                                </div>
                            </div>

                            {!hasMatch && (
                                <p className='text-red-500 text-center mt-4'>
                                    No matching participant found. Showing last viewed ID.
                                </p>
                            )}

                            {/* Navigation & Download */}
                            <div className='flex flex-col sm:flex-row gap-4 mt-6 justify-center items-center'>
                                <button
                                    onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
                                    disabled={index === 0}
                                    className='px-5 py-2 rounded-lg border border-white/30 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md'
                                >
                                    Prev
                                </button>

                                <button
                                    onClick={saveAsPDF}
                                    className='px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition shadow-md'
                                >
                                    Download Now
                                </button>

                                <button
                                    onClick={() => setIndex((prev) => Math.min(filtered.length - 1, prev + 1))}
                                    disabled={index >= filtered.length - 1}
                                    className='px-5 py-2 rounded-lg border border-white/30 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md'
                                >
                                    Next
                                </button>
                            </div>

                            <p className='text-sm text-white/80 mt-4 text-center tracking-wide'>
                                Showing <span className='font-semibold text-white'>{hasMatch ? index + 1 : 0}</span> of <span className='font-semibold text-white'>{filtered.length}</span>
                            </p>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );


};

export default ParticipantIDGeneratorSingle;


// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// const TimeoutPage = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4">
//       <div
//         className="w-full max-w-xl h-72 mb-8 bg-center bg-no-repeat bg-contain"
//         style={{
//           backgroundImage:
//             'url("https://cdn.dribbble.com/users/32512/screenshots/5873957/media/0dc76f47bc997dc2c312af2a6fbd5c8f.gif")', // Slow loading / timeout animation
//         }}
//       />
//       <h1 className="text-[80px] sm:text-[100px] font-bold text-gray-800">408</h1>
//       <div className="text-2xl font-semibold text-gray-700 mt-2">
//         Request Timeout
//       </div>
//       <div className="text-base text-gray-500 mt-1 mb-6">
//         The server is taking too long to respond. Try refreshing or come back later.
//       </div>
//       <button
//         onClick={() => navigate('/')}
//         className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition"
//       >
//         Go to Home
//       </button>
//     </div>
//   );
// };

// export default TimeoutPage;
