
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
} from '@mui/material';
import useSwalTheme from '../utils/useSwalTheme';
import { PDFDocument } from 'pdf-lib';
import html2canvas from 'html2canvas';
import '../Styles/certificate.css'; // external CSS file
import { API_URL } from '../utils/config';


const CERT_WIDTH = 625;
const CERT_HEIGHT = 505;

const Certificate = React.forwardRef(({ participant }, ref) => {
  return (
    <Box ref={ref} className="box" sx={{ width: CERT_WIDTH, height: CERT_HEIGHT, position: 'relative', m: 'auto' }}>
      <div className="group">
        <div className="overlap-group">
          <img className="rectangle" src="image.png" alt="" />
          <img className="img" src="rectangle2.png" alt="" />
          <img className="vector" src="Vector.png" alt="" />
          <p className="republic-of-the">
            <span className="text-wrapper">Republic of the Philippines<br /></span>
            <span className="span">Department of Education<br /></span>
            <span className="text-wrapper-2">Region V-Bicol<br />SCHOOLS DIVISION OFFICE OF CAMARINES NORTE</span>
          </p>
          <p className="CRESTITO-m-MORCILLA">
            <span className="text-wrapper-3">CRESTITO M. MORCILLA, CESO V<br /></span>
            <span className="text-wrapper-5">Schools Division Superintendent</span>
          </p>
          <div className="div">Certificate of Appearance</div>
          <p className="this-is-to-certify">
            <span className="text-wrapper-6">&nbsp;&nbsp;&nbsp;&nbsp;This is to certify that Mr./Ms.&nbsp;</span>
            <span className="text-wrapper-7">{participant.full_name}</span>
            <span className="text-wrapper-6"> of </span>
            <span className="text-wrapper-7">{participant.school}</span>
            <span className="text-wrapper-6"> attended the </span>
            <span className="text-wrapper-8">Regional Assembly of Educational Leaders (RAEL)</span>
            <span className="text-wrapper-6"> held at {participant.venue} on {participant.start_date} to {participant.end_date}.</span>
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
      const res = await fetch(`${API_URL}/api/registration/get_data_certificate`);
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
}, []);


  useEffect(() => {
    const result = participants.filter(p =>
      p.name?.trim().toLowerCase().includes(search.toLowerCase()) &&
      (division ? p.division_name === division : true) &&
      (district ? p.district_name === district : true) &&
      (school ? p.school === school : true)
    );
    setFiltered(result);
    setIndex(0);
  }, [search, division, district, school, participants]);

  const saveAsPDF = async () => {
    if (!cardRef.current || !filtered[index]) return;
    await document.fonts.ready;
    const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true, backgroundColor: null });
    const imgData = canvas.toDataURL('image/png');
    const pdf = await PDFDocument.create();
    const widthPt = CERT_WIDTH * 0.75;
    const heightPt = CERT_HEIGHT * 0.80;
    const page = pdf.addPage([widthPt, heightPt]);
    const pngImage = await pdf.embedPng(imgData);
    page.drawImage(pngImage, { x: 0, y: 0, width: widthPt, height: heightPt });
    const pdfBytes = await pdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filtered[index].name.trim()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const unique = (arr, key) => [...new Set(arr.map(item => item[key]).filter(Boolean))];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant={isMobile ? 'h6' : 'h4'} textAlign="center" gutterBottom>
        Download your Certificate <br /> <strong>Regional Assembly of Educational Leaders</strong>
      </Typography>

      <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth label="Search Name" variant="outlined" size="small" value={search} onChange={e => setSearch(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth select label="Division" size="small" value={division} onChange={e => setDivision(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {unique(participants, 'division_name').map(val => <MenuItem key={val} value={val}>{val}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth select label="District" size="small" value={district} onChange={e => setDistrict(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {unique(participants, 'district_name').map(val => <MenuItem key={val} value={val}>{val}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth select label="School" size="small" value={school} onChange={e => setSchool(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {unique(participants, 'school').map(val => <MenuItem key={val} value={val}>{val}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>

      {filtered.length > 0 && (
        <Box textAlign="center">
          <Certificate participant={filtered[index]} ref={cardRef} />
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={() => setIndex(index - 1)} disabled={index === 0}>
              Prev
            </Button>
            <Button variant="contained" color="success" onClick={saveAsPDF}>
              Save as PDF
            </Button>
            <Button variant="outlined" onClick={() => setIndex(index + 1)} disabled={index === filtered.length - 1}>
              Next
            </Button>
          </Box>
          <Typography sx={{ mt: 1 }}>
            Showing {index + 1} of {filtered.length}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ParticipantCertificateGeneratorSingle;
