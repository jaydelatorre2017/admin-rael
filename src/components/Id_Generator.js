import React, { useEffect, useState, useRef } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { QRCodeSVG } from 'qrcode.react';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import useSwalTheme from '../utils/useSwalTheme';
import { API_URL,headername,keypoint } from '../utils/config';
const IDCard = ({ participant }) => {
  return (
    <div
      style={{
        width: 204,
        height: 323,
        position: 'relative',
        background: 'linear-gradient(to bottom, #ffffff 0%, #910500 100%)',
        overflow: 'hidden',
        borderRadius: 8,
        margin: 8,
      }}
    >
      <img
        style={{ position: 'absolute', top: 0, left: 0, width: 204, height: 120.2 }}
        src="Shape 1.svg"
        alt=""
      />
      <img
        style={{ position: 'absolute', top: 268, left: 0, width: 204, height: 54 }}
        src="Shape 2.svg"
        alt=""
      />
      <img
        style={{
          position: 'absolute',
          top: 75,
          left: 62,
          width: 80,
          height: 80,
          borderRadius: '50%',
          border: '3px solid #302ea6',
          background: '#fff',

          objectFit: 'cover',
        }}
        src={participant.participant_image_url || 'https://imgs.search.brave.com/RlLMklCzxIKu5cSUG_cy9tOqGWIRRRrrmSkrrS2cljM/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tYXJr/ZXRwbGFjZS5jYW52/YS5jb20vZ0pseTAv/TUFHRGtNZ0pseTAv/MS90bC9jYW52YS11/c2VyLXByb2ZpbGUt/aWNvbi12ZWN0b3Iu/LWF2YXRhci1vci1w/ZXJzb24taWNvbi4t/cHJvZmlsZS1waWN0/dXJlLC1wb3J0cmFp/dC1zeW1ib2wuLU1B/R0RrTWdKbHkwLnBu/Zw'}
        alt=""
      />
      <div
        style={{
          position: 'absolute',
          top: 204,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 80,
          height: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          position: 'relative',
        }}
      >
        <QRCodeSVG
          value={participant.id ? String(participant.id) : 'No ID'}
          size={64}
          level="H" // High error correction for embedded logo
          includeMargin={false}
        />
        <div
          style={{
            position: 'absolute',
            width: 50, // Make the logo slightly bigger
            height: 50,


            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

          }}
        >
          <img
            src="/qrlogo.png" // Replace with your logo path
            alt="QR Logo"
            style={{
              width: 24,
              height: 24,

            }}
          />
        </div>
      </div>

      <img
        style={{ position: 'absolute', top: 10, left: 10, width: 40 }}
        src="LeftLogo.png"
        alt="Left Logo"
      />
      <img
        style={{ position: 'absolute', top: 10, right: 10, width: 40 }}
        src="RightLogo.png"
        alt="Right Logo"
      />

      <div
        style={{
          position: 'absolute',
          top: 170,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <b
          style={{
            background: 'linear-gradient(0deg, #000000 12.29%, #000f30 77.92%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            fontSize: 14,
            width: '100%',
          }}
        >
          {participant.name.toUpperCase()}
        </b>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 33,
          width: 153,
          fontSize: 8,
          fontFamily: "'Roboto', sans-serif",
        }}
      >
        <img
          style={{ position: 'absolute', top: 0, left: 54, width: 40 }}
          src="qrlogo.png"
          alt=""
        />
        <div
          style={{
            position: 'absolute',
            top: 10,
            width: '100%',
            textAlign: 'center',
          }}
        >

          <div
            style={{
              position: 'absolute',
              top: 10,
              left: '45%',
              transform: 'translateX(-50%)',
              fontFamily: "'Kameron', serif",
              fontWeight: 'bold',
              color: '#000',
              fontSize: 12,
            }}
          >
            RAEL
          </div>
          <div
            style={{
              position: 'absolute',
              top: 30,
              color: '#000',
              fontFamily: "'Kameron', serif",
              textAlign: 'center',
            }}
          >
            Regional Assembly of Education Leaders
          </div>

        </div>
      </div>
    </div>
  );
};

const ParticipantIDGenerator = () => {
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState('');
  const [division, setDivision] = useState('All');
  const [district, setDistrict] = useState('All'); // <-- Add district state
  const [school, setSchool] = useState('All');     // <-- Add school state
  const [page, setPage] = useState(0);
  const gridRef = useRef();
  const SwalInstance = useSwalTheme();
  const columns = 5;
  const rows = 2;
  const idsPerPage = columns * rows;

  useEffect(() => {
    const fetchParticipants = async () => {
      SwalInstance.fire({
        title: "Loading...",
        text: "Generating ID, please wait.",
        allowOutsideClick: false,
        didOpen: () => {
          SwalInstance.showLoading();
        },
      });
      try {
        const response = await fetch(`${API_URL}/api/registration/get`);
        const data = await response.json();
        setParticipants(data);
        SwalInstance.close();
      } catch (err) {
        SwalInstance.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong while fetching participants! Please try again later.',
        });
       
      }
    };
    fetchParticipants();
  }, []);

  // Get unique division names
  const divisionNames = [
    'All',
    ...Array.from(new Set(participants.map(p => p.division_name).filter(Boolean))),
  ];

  // Get unique district names based on selected division
  const districtNames = [
    'All',
    ...Array.from(
      new Set(
        participants
          .filter(p => division === 'All' || p.division_name === division)
          .map(p => p.district_name)
          .filter(Boolean)
      )
    ),
  ];

  // Get unique school names based on selected district and division
  const schoolNames = [
    'All',
    ...Array.from(
      new Set(
        participants
          .filter(
            p =>
              (division === 'All' || p.division_name === division) &&
              (district === 'All' || p.district_name === district)
          )
          .map(p => p.school)
          .filter(Boolean)
      )
    ),
  ];

  // Filter participants by search, division, district, and school
  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (division === 'All' || p.division_name === division) &&
    (district === 'All' || p.district_name === district) &&
    (school === 'All' || p.school === school)
  );

  // Pagination
  const totalPages = Math.ceil(filtered.length / idsPerPage);
  const paginated = filtered.slice(page * idsPerPage, (page + 1) * idsPerPage);

  // Print handler
  const handlePrint = () => {
    window.print();
  };



  return (
    <div>
      <Box sx={{ marginBottom: 2, display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
        <TextField
          label="Search by name"
          variant="outlined"
          size="small"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 220 }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="division-label">Division</InputLabel>
          <Select
            labelId="division-label"
            label="Division"
            value={division}
            onChange={e => {
              setDivision(e.target.value);
              setDistrict('All'); // Reset district when division changes
              setSchool('All');   // Reset school when division changes
              setPage(0);
            }}
          >
            {divisionNames.map(div => (
              <MenuItem key={div} value={div}>{div}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="district-label">District</InputLabel>
          <Select
            labelId="district-label"
            label="District"
            value={district}
            onChange={e => {
              setDistrict(e.target.value);
              setSchool('All'); // Reset school when district changes
              setPage(0);
            }}
          >
            {districtNames.map(dist => (
              <MenuItem key={dist} value={dist}>{dist}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="school-label">School</InputLabel>
          <Select
            labelId="school-label"
            label="School"
            value={school}
            onChange={e => {
              setSchool(e.target.value);
              setPage(0);
            }}
          >
            {schoolNames.map(sch => (
              <MenuItem key={sch} value={sch}>{sch}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="error"
          onClick={handlePrint}
          sx={{ borderRadius: 3, textTransform: 'none', fontSize: 15, px: 3 }}
        >
          Print
        </Button>
        <Box sx={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="error"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontSize: 15,
              px: 2.5,
              backgroundColor: page === 0 ? '#eee' : undefined,
              color: page === 0 ? '#aaa' : undefined,
              boxShadow: 1,
            }}
          >
            Prev
          </Button>
          <Box sx={{ alignSelf: 'center', fontSize: 15, px: 1 }}>
            Page {page + 1} of {totalPages}
          </Box>
          <Button
            variant="contained"
            color="error"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontSize: 15,
              px: 2.5,
              backgroundColor: page === totalPages - 1 ? '#eee' : undefined,
              color: page === totalPages - 1 ? '#aaa' : undefined,
              boxShadow: 1,
            }}
          >
            Next
          </Button>
        </Box>
      </Box>
      <div
        id="print-area"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: `${rows * 340}px`,
        }}
      >
        {paginated.length === 0 ? (
          <div style={{ fontSize: 22, color: '#888', textAlign: 'center', width: '100%' }}>
            No data available
          </div>
        ) : (
          <Grid
            ref={gridRef}
            columnCount={columns}
            columnWidth={220}
            height={rows * 340}
            rowCount={rows}
            rowHeight={340}
            width={columns * 220 + 20}
            itemData={paginated}
          >
            {({ columnIndex, rowIndex, style, data }) => {
              const index = rowIndex * columns + columnIndex;
              if (index >= data.length) return null;
              return (
                <div style={style}>
                  <IDCard participant={data[index]} />
                </div>
              );
            }}
          </Grid>
        )}
      </div>
      {/* Print styles */}
      <style>
        {`
    @media print {
      body * { visibility: hidden; }
      #print-area, #print-area * { visibility: visible; }
      #print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100vw;
        height: auto !important;
        overflow: visible !important; /* ensure all content is shown */
      }
      input, button { display: none !important; }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      /* hide scrollbars in print */
      ::-webkit-scrollbar {
        display: none;
      }
      html, body {
        overflow: visible !important;
      }
    }
  `}
      </style>

    </div>
  );
};

export default ParticipantIDGenerator;
