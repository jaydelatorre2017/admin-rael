
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Box,
  TextField,
  MenuItem,
  Grid,
  Container,
  Typography,
  useMediaQuery,
  Paper,
  Stack,
} from '@mui/material';
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';
import useSwalTheme from '../utils/useSwalTheme';
import '../Styles/certificate.css';
import { API_URL, headername, keypoint } from '../utils/config';

const CERT_WIDTH = 625;
const CERT_HEIGHT = 505;

const Certificate = React.forwardRef(({ participant }, ref) => {
  return (
    <Box
      ref={ref}
      className="box"
      sx={{
        width: CERT_WIDTH,
        maxWidth: '100%',
        height: CERT_HEIGHT,
        position: 'relative',
        m: 'auto',
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: 'white',
      }}
    >
      <div className="group">
        <div className="overlap-group">
          <img className="rectangle" src="/image.png" alt="Background" />
          <img className="img" src="/rectangle2.png" alt="Decoration" />
          <img className="vector" src="/Vector.png" alt="Logo" />

          <p className="republic-of-the">
            <span className="text-wrapper">Republic of the Philippines<br /></span>
            <span className="span">Department of Education<br /></span>
            <span className="text-wrapper-2">Region V - Bicol<br />SCHOOLS DIVISION OFFICE OF CAMARINES NORTE</span>
          </p>

          <p className="CRESTITO-m-MORCILLA">
            <span className="text-wrapper-3">CRESTITO M. MORCILLA, CESO V<br /></span>
            <span className="text-wrapper-5">Schools Division Superintendent</span>
          </p>

          <div className="div">Certificate of Appearance</div>

          <p className="this-is-to-certify">
            <span className="text-wrapper-6">&nbsp;&nbsp;&nbsp;&nbsp;This is to certify that Mr./Ms.&nbsp;</span>
            <span className="text-wrapper-7">{participant?.full_name || 'Name'}</span>
            <span className="text-wrapper-6"> of </span>
            <span className="text-wrapper-7">{participant?.school || 'School'}</span>
            <span className="text-wrapper-6"> attended the </span>
            <span className="text-wrapper-8">Regional Assembly of Educational Leaders (RAEL)</span>
            <span className="text-wrapper-6">
              {' '}held at {participant?.venue || 'Venue'} on {participant?.start_date || 'Start Date'} to {participant?.end_date || 'End Date'}.
            </span>
          </p>
        </div>
      </div>
    </Box>
  );
});

const ParticipantCertificateGeneratorSingle = () => {
  const [participants, setParticipants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [school, setSchool] = useState('');
  const cardRef = useRef();
  const SwalInstance = useSwalTheme();
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const fetchParticipants = async () => {
      SwalInstance.fire({
        title: 'Loading...',
        allowOutsideClick: false,
        didOpen: () => SwalInstance.showLoading(),
      });

      try {
        const res = await fetch(`${API_URL}/api/registration/get_data_certificate`,{
          headers: { [headername]: keypoint }
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
    const result = participants.filter(p =>
      p.full_name?.toLowerCase().includes(search.toLowerCase()) &&
      (!division || p.division_name === division) &&
      (!district || p.district_name === district) &&
      (!school || p.school === school)
    );
    setFiltered(result);
    setIndex(0);
  }, [search, division, district, school, participants]);

  const saveAsPDF = async () => {
    if (!cardRef.current || !filtered[index]) return;
    await document.fonts.ready;

    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = await PDFDocument.create();
    const widthPt = CERT_WIDTH * 0.75;
    const heightPt = CERT_HEIGHT * 0.8;
    const page = pdf.addPage([widthPt, heightPt]);

    const pngImage = await pdf.embedPng(imgData);
    page.drawImage(pngImage, { x: 0, y: 0, width: widthPt, height: heightPt });

    const pdfBytes = await pdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${filtered[index].full_name?.replace(/\s+/g, '_') || 'certificate'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const unique = (arr, key) => [...new Set(arr.map(item => item[key]).filter(Boolean))];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant={isMobile ? 'h6' : 'h4'} align="center" gutterBottom>
        Download Your Certificate
        <br />
        <strong>Regional Assembly of Educational Leaders</strong>
      </Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }} elevation={3}>
        <Grid container spacing={2} direction="row">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search Name"
              variant="outlined"
              size="small"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Division"
              size="small"
              value={division}
              onChange={e => setDivision(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {unique(participants, 'division_name').map(val => (
                <MenuItem key={val} value={val}>{val}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="District"
              size="small"
              value={district}
              onChange={e => setDistrict(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {unique(participants, 'district_name').map(val => (
                <MenuItem key={val} value={val}>{val}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="School"
              size="small"
              value={school}
              onChange={e => setSchool(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {unique(participants, 'school').map(val => (
                <MenuItem key={val} value={val}>{val}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {filtered.length > 0 && (
        <Box textAlign="center">
          <Box
            sx={{
              width: '100%',
              overflowX: 'auto',
              display: 'flex',
              justifyContent: 'center',
              mt: 2,
            }}
          >
            <Certificate participant={filtered[index]} ref={cardRef} />
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 3 }}
          >
            <Button variant="outlined" onClick={() => setIndex(index - 1)} disabled={index === 0}>
              Prev
            </Button>
            <Button variant="contained" color="success" onClick={saveAsPDF}>
              Download Now!
            </Button>
            <Button variant="outlined" onClick={() => setIndex(index + 1)} disabled={index === filtered.length - 1}>
              Next
            </Button>
          </Stack>

          <Typography sx={{ mt: 2 }} color="text.secondary">
            Showing {index + 1} of {filtered.length}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ParticipantCertificateGeneratorSingle;