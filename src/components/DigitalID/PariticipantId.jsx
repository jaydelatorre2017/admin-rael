


import  { useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    Container,
    Typography,
    useMediaQuery,
} from '@mui/material';
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';
import { useLocation } from 'react-router-dom';
import IDCard from './IDCard';
import useSwalTheme from '../../utils/useSwalTheme';
import { API_URL, headername, keypoint } from '../../utils/config';
import NotFoundPage from '../NotFoundPage';

const useQuery = () => new URLSearchParams(useLocation().search);

const ParticipantIDGeneratorSingle = () => {
    const [participant, setParticipant] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const cardRef = useRef();
    const SwalInstance = useSwalTheme();
    const isMobile = useMediaQuery('(max-width:600px)');
    const query = useQuery();
    const participantId = query.get('participant_id');

 useEffect(() => {
  if (!participantId) {
    setNotFound(true);
    return;
  }

  const fetchParticipant = async () => {
    SwalInstance.fire({
      title: 'Loading...',
      allowOutsideClick: false,
      didOpen: () => SwalInstance.showLoading(),
    });

    try {
      const res = await fetch(
        `${API_URL}/api/registration/get_participant?participant_id=${participantId}`, {
          headers: { [headername]: keypoint }
        }
      );
      const data = await res.json();

      if (!res.ok || !data || !data.id) {
        setNotFound(true);
      } else {
        setParticipant(data);
      }
      SwalInstance.close();
    } catch (err) {
      setNotFound(true);
      SwalInstance.close();
    }
  };

  fetchParticipant();
}, [participantId, SwalInstance]); // ✅ include SwalInstance

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

    if (notFound) {
        return <NotFoundPage />;
    }

    return (
        <Container
            maxWidth="sm"
            sx={{
                py: { xs: 3, sm: 5 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',      // ⬅️ horizontal centering
            }}
        >
            <Box textAlign="center" mb={{ xs: 3, sm: 5 }}>
                <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    fontWeight="bold"
                    color="primary"
                >
                    Digital ID Download
                </Typography>
                <Typography
                    variant={isMobile ? 'body2' : 'body1'}
                    color="text.secondary"
                >
                    Regional Assembly of Leaders
                </Typography>
            </Box>

            {participant && (
                <Box                       /* keeps contents centred */
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={3}
                    sx={{
                        px: { xs: 1, sm: 3 },
                        // ⬇️ let this box size to its content instead of 100 %
                        width: 'auto',
                    }}
                >
                    <Box
                        ref={cardRef}
                        sx={{
                            maxWidth: 350,
                            width: '100%',        // card still scales up to 350 px max
                            height: 'auto',
                            boxShadow: 3,
                        }}
                    >
                        <IDCard participant={participant} />
                    </Box>

                    {/* alignSelf ensures the button is centred even if you change layouts */}
                    <Button
                        variant="contained"
                        color="primary"
                        size={isMobile ? 'medium' : 'large'}
                        onClick={saveAsPDF}
                        sx={{
                            alignSelf: 'center',
                            textTransform: 'none',
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 600,
                        }}
                    >
                        Download as PDF
                    </Button>
                </Box>
            )}
        </Container>

    );
};

export default ParticipantIDGeneratorSingle;
