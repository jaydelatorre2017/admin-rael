import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';
import { Download, NavigateBefore, NavigateNext } from '@mui/icons-material';
import useSwalTheme from '../utils/useSwalTheme';
import { API_URL, headername, keypoint } from '../utils/config';

const Certificate = React.forwardRef(({ participant }, ref) => (
  <div
    ref={ref}
    className="w-[816px] h-[672px] bg-white shadow-lg rounded-xl relative overflow-hidden"
  >
    <img src="/image2.png" alt="Background" className="absolute w-[161px] h-[78px] top-[470px] left-[328px]" />
    <img src="/rectangle2.png" alt="Decoration" className="absolute w-[57px] h-[57px] top-[100px] left-[380px]" />
    <img src="/Vector.png" alt="Logo" className="absolute w-[700px] h-[525px] top-[60px] left-[58px]" />

    <div className="absolute w-full top-[180px] px-8 text-center text-black text-[12px]">
      <span className="font-[UnifrakturMaguntia] block">Republic of the Philippines</span>
      <span className="font-[UnifrakturMaguntia] text-[18px] block">Department of Education</span>
      <span className="font-bold text-[10px] block">Region V - Bicol<br />SCHOOLS DIVISION OFFICE OF CAMARINES NORTE</span>
    </div>

    <div className="absolute w-full top-[260px] px-8 text-center text-black text-[36px] font-[UnifrakturMaguntia] font-bold">
      Certificate of Appearance
    </div>

    <p className="absolute w-[640px] top-[345px] left-[88px] text-justify text-[17px] text-black font-[Crimson_Text] leading-7">
      <span>This is to certify that Mr./Ms. </span>
      <span className="underline">{participant?.full_name || 'Name'}</span>
      <span> of </span>
      <span className="underline">{participant?.school || 'School'}</span>
      <span> attended the </span>
      <span className="font-bold">Regional Assembly of Educational Leaders (RAEL)</span>
      <span> held at {participant?.venue || 'Venue'} on {participant?.start_date || 'Start Date'} to {participant?.end_date || 'End Date'}.</span>
    </p>

    <p className="absolute w-full top-[510px] px-8 text-center text-black text-[12px] font-[Crimson_Text]">
      <span className="font-bold block">CRESTITO M. MORCILLA, CESO V</span>
      <span className="text-[11px]">Schools Division Superintendent</span>
    </p>
  </div>
));

const ParticipantCertificateGeneratorSingle = () => {
  const [participants, setParticipants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');
  const cardRef = useRef();
  const SwalInstance = useSwalTheme();

  useEffect(() => {
    const fetchParticipants = async () => {
      SwalInstance.fire({
        title: 'Loading...',
        allowOutsideClick: false,
        didOpen: () => SwalInstance.showLoading(),
      });

      try {
        const res = await fetch(`${API_URL}/api/registration/get_data_certificate`, {
          headers: { [headername]: keypoint },
        });
        const data = await res.json();
        setParticipants(data);
        setFiltered(data);
        SwalInstance.close();

        if (data.length === 0) {
          SwalInstance.fire({
            icon: 'info',
            title: 'No data available',
            text: 'No participants have been registered yet.',
          });
        }
      } catch (err) {
        SwalInstance.fire({
          icon: 'error',
          title: 'Failed to fetch participants',
        });
      }
    };

    fetchParticipants();
    // eslint-disable-next-line 
  }, []);

  useEffect(() => {
    const result = participants.filter((p) =>
      p.full_name?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
    setIndex(0);
  }, [search, participants]);

  const saveAsPDF = async () => {
    if (!cardRef.current || !filtered[index]) return;
    await document.fonts.ready;

    const el = cardRef.current;
    const prevTransform = el.style.transform;
    el.style.transform = 'none';

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });

    el.style.transform = prevTransform;

    const imgData = canvas.toDataURL('image/png');
    const pdf = await PDFDocument.create();
    const widthPt = 612;
    const heightPt = 504;
    const page = pdf.addPage([widthPt, heightPt]);

    const pngImage = await pdf.embedPng(imgData);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: widthPt,
      height: heightPt,
    });

    const pdfBytes = await pdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${filtered[index].full_name?.replace(/\s+/g, '_') || 'certificate'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="flex flex-col min-h-screen items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="w-full max-w-6xl rounded-3xl backdrop-blur-lg bg-white/30 border border-white/50 shadow-2xl p-6 text-white">
        <div className="py-4 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold">Download Your Certificate</h1>
          <p className="text-sm sm:text-lg mt-1 font-semibold">
            Regional Assembly of Educational Leaders
          </p>
        </div>

      <div className="flex justify-center mb-4">
  <input
    type="text"
    placeholder="Search Participant Name"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-[816px] max-w-full rounded-full p-2 text-black placeholder-gray-600 border border-white/30 bg-white/20 backdrop-blur-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white"
  />
</div>


        {filtered.length > 0 && (
          <div className="text-center">
            <div className="w-full overflow-x-auto flex justify-center mb-6">
              <div className="origin-top">
                <Certificate participant={filtered[index]} ref={cardRef} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
              <button
                onClick={() => setIndex(index - 1)}
                disabled={index === 0}
                className={`px-5 py-2 border rounded-md flex items-center gap-1 ${
                  index === 0
                    ? 'opacity-50 cursor-not-allowed border-white text-white'
                    : 'border-white text-white hover:bg-white/20'
                }`}
              >
                <NavigateBefore /> Prev
              </button>
              <button
                onClick={saveAsPDF}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md flex items-center gap-2"
              >
                <Download /> Download
              </button>
              <button
                onClick={() => setIndex(index + 1)}
                disabled={index === filtered.length - 1}
                className={`px-5 py-2 border rounded-md flex items-center gap-1 ${
                  index === filtered.length - 1
                    ? 'opacity-50 cursor-not-allowed border-white text-white'
                    : 'border-white text-white hover:bg-white/20'
                }`}
              >
                Next <NavigateNext />
              </button>
            </div>

            <p className="mt-4 text-white">
              Showing <strong>{index + 1}</strong> of <strong>{filtered.length}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantCertificateGeneratorSingle;
