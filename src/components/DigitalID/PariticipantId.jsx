import { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';
import { useLocation } from 'react-router-dom';
import IDCard from './IDCard';
import { API_URL, headername, keypoint } from '../../utils/config';
import NotFoundPage from '../NotFoundPage';
import { Skeleton } from '@mui/material';

const useQuery = () => new URLSearchParams(useLocation().search);

const ParticipantIDGeneratorSingle = () => {
    const [participant, setParticipant] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(false);
    const cardRef = useRef();
    const query = useQuery();
    const participantId = query.get('participant_id');

    useEffect(() => {
        if (!participantId) {
            setNotFound(true);
            return;
        }

        const fetchParticipant = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `${API_URL}/api/registration/get_participant?participant_id=${participantId}`,
                    {
                        headers: { [headername]: keypoint },
                    }
                );
                const data = await res.json();

                if (!res.ok || !data || !data.id) {
                    setNotFound(true);
                } else {
                    setParticipant(data);
                }
            } catch (err) {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchParticipant();
    }, [participantId]);

    const saveAsPDF = async () => {
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
        a.download = `${participant.name?.trim() || 'participant'}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (notFound) return <NotFoundPage />;

    return (
        <div
            className='flex flex-col md:flex-row w-full items-center p-4 md:h-screen md:justify-center pt-10 md:pt-0 bg-cover bg-center'
            style={{ backgroundImage: "url('/bg.jpg')" }}
        >
            <div className='flex flex-col md:flex-row w-full max-w-6xl rounded-3xl backdrop-blur-xl bg-white/10 border border-white/30 shadow-2xl p-6'>
                {/* Illustration */}
                <div className='hidden md:flex md:w-1/2 flex-col items-center justify-center h-[700px] relative'>
                    <img src='id3d.png' alt='ID Illustration' className='h-full object-contain z-0 ' />
                    <div className='absolute bottom-6 bg-black/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 shadow-md text-center z-10'>
                        <h2 className='text-2xl font-bold text-white tracking-wide drop-shadow'>Welcome!</h2>
                          <h4 className='text-base font-bold text-white/80 mt-1 drop-shadow-sm'> Participant No.1</h4>
                        <p className='text-base text-white/80 mt-1 drop-shadow-sm'> Please Download your Digital ID</p>
                    </div>
                </div>

                {/* ID Generator */}
                <div className='w-full md:w-1/2 flex flex-col mt-8 items-center md:mt-12'>
                    <div className='block md:hidden max-w-5xl mx-auto p-4 text-center text-white'>
                        <h2 className='text-2xl font-bold text-white tracking-wide drop-shadow'>Welcome! </h2>
                            <h4 className='text-base font-bold text-white/80 mt-1 drop-shadow-sm'> Participant No.1</h4>
                       <p className='text-base text-white/80 mt-1 drop-shadow-sm'> Please Download your Digital ID</p>
                    </div>

                    {/* ID Card Preview */}
                    <div className='w-full overflow-x-auto flex justify-center mt-4'>
                        <div ref={cardRef}>
                            {loading ? (
                                <Skeleton
                                    variant='rectangular'
                                    width={350}
                                    height={520}
                                    animation='wave'
                                    sx={{ borderRadius: 4 }}
                                />
                            ) : participant ? (
                                <IDCard participant={participant} />
                            ) : null}
                        </div>
                    </div>

                    {/* Download Button */}
                    {participant && !loading && (
                        <div className='flex justify-center mt-6'>
                            <button
                                onClick={saveAsPDF}
                                className='px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition shadow-md'
                            >
                                Download Now
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ParticipantIDGeneratorSingle;
