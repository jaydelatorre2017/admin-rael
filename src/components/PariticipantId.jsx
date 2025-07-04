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
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';
import IDCard from './IDCard';
import useSwalTheme from '../utils/useSwalTheme';
import { API_URL } from '../utils/config';

const ParticipantIDGeneratorSingle = () => {
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
      SwalInstance.fire({ title: 'Loading...', allowOutsideClick: false, didOpen: () => SwalInstance.showLoading() });
      try {
        const res = await fetch(`${API_URL}/api/registration/get_data_id`);
        const data = await res.json();
        setParticipants(data);
        setFiltered(data);
        SwalInstance.close();
      } catch (err) {
        SwalInstance.fire({ icon: 'error', title: 'Failed to fetch participants' });
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

  const CARD_WIDTH_PX = 350;
  const CARD_HEIGHT_PX = 520;
  const SCALE = 3; // increase for better quality

  const canvas = await html2canvas(cardRef.current, {
    width: CARD_WIDTH_PX,
    height: CARD_HEIGHT_PX,
    scale: SCALE,
    useCORS: true,
    backgroundColor: null,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = await PDFDocument.create();

  // Convert dimensions to points (PDF units)
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
  a.download = `${filtered[index].name.trim()}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};


  const unique = (arr, key) => [...new Set(arr.map(item => item[key]).filter(Boolean))];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant={isMobile ? 'h6' : 'h4'} textAlign="center" gutterBottom>
        Download your Digital ID <br /> <strong>Regional Assembly of Leaders</strong>
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            mt: 4,
          }}
        >
          <Box ref={cardRef}>
            <IDCard participant={filtered[index]} />
          </Box>
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

export default ParticipantIDGeneratorSingle;
