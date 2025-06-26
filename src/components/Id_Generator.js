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

const ID_CARD_WIDTH = 378;   // 10cm ≈ 378px at 96dpi
const ID_CARD_HEIGHT = 454;  // 12cm ≈ 454px at 96dpi


const IDCard = ({ participant }) => {
  const bgUrl = participant.left_logo_url|| "cam-norte.png";
  const shape1 = participant.participant_type === 'Participant' ? 'Shape 1 (4).svg' : 'Shape 1 (5).svg';
  const shape2 = participant.participant_type === 'Participant' ? 'Shape 2 (3).svg' : 'Shape 2 (4).svg';
  return (
   <div
  style={{
    width: ID_CARD_WIDTH,
    height: ID_CARD_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
    margin: 8,
  }}
>
  {/* Background overlay */}
  <div
    style={{
      position: 'absolute',
      top: 40,
      left: 0,
      width: '100%',
      height: '100%',
        backgroundImage: `url(${bgUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: 0.3, // background image opacity
      zIndex: 0,
    }}
  />

  {/* All your other content stays above */}
  <img
    style={{ position: 'absolute', top: -40, left: 0, width: ID_CARD_WIDTH, height: (196 * (ID_CARD_WIDTH / 322)), zIndex: 1 }}
    src= {shape1}
    alt=""
  />
  <img
    style={{ position: 'absolute', top: ID_CARD_HEIGHT - 140, left: 0, width: ID_CARD_WIDTH , height: 196, zIndex: 1 }}
    src={shape2}
    alt=""
  />

  <img
    style={{
      position: 'absolute',
      top: 200,
      left: (ID_CARD_WIDTH - 260) / 2,
      width: 120,
      height: 120,
      border: '1px solid #302ea6',
      background: '#fff',
      objectFit: 'cover',
      zIndex: 1,
    }}
    src={participant.participant_image_url || 'https://imgs.search.brave.com/RlLMklCzxIKu5cSUG_cy9tOqGWIRRRrrmSkrrS2cljM/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tYXJr/ZXRwbGFjZS5jYW52/YS5jb20vZ0pseTAv/TUFHRGtNZ0pseTAv/MS90bC9jYW52YS11/c2VyLXByb2ZpbGUt/aWNvbi12ZWN0b3Iu/LWF2YXRhci1vci1w/ZXJzb24taWNvbi4t/cHJvZmlsZS1waWN0/dXJlLC1wb3J0cmFp/dC1zeW1ib2wuLU1B/R0RrTWdKbHkwLnBu/Zw'}
    alt=""
  />

  {/* QR Code section */}
  <div
    style={{
      position: 'absolute',
      top: 200,
      right: (ID_CARD_WIDTH - 360) / 2,
      transform: 'translateX(-50%)',
      width: 120,
      height: 120,
      background: '#fff',
      border: '1px solid #302ea6',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <QRCodeSVG
      value={participant.id ? String(participant.id) : 'No ID'}
      size={100}
      level="H"
      includeMargin={false}
    />
    <div
      style={{
        position: 'absolute',
        width: 60,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img src="/qrlogo.png" alt="QR Logo" style={{ width: 28, height: 28 }} />
    </div>
  </div>

  {/* Logos */}
  <img
    style={{ position: 'absolute', top: 18, left: 18, width: 80, zIndex: 1 }}
    src={participant.left_logo_url || "LeftLogo.png"}
    alt="Left Logo"
  />
  <img
    style={{ position: 'absolute', top: 18, right: 18, width: 80, zIndex: 1 }}
    src={participant.right_logo_url || "RightLogo.png"}
    alt="Right Logo"
  />

  {/* Participant name */}
  <div
    style={{
      position: 'absolute',
      top: 350,
      width: '100%',
      textAlign: 'center',
      zIndex: 1,
    }}
  >
    <b
      style={{
        background: 'linear-gradient(0deg, #000000 12.29%, #000f30 77.92%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold',
        fontSize: 28,
      }}
    >
      {participant.name?.toUpperCase()}
    </b>
  </div>

  {/* Header text */}
  <div
    style={{
      position: 'absolute',
      top: 30,
      left: 60,
      width: ID_CARD_WIDTH - 120,
      fontSize: 13,
      fontFamily: "'Roboto', sans-serif",
      zIndex: 1,
    }}
  >
    
    <div style={{ position: 'absolute', top: 20, width: '100%', textAlign: 'center' }}>
      <div
        style={{
          position: 'absolute',
          top: 15,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Kameron', serif",
          fontWeight: 'bold',
          color: '#000',
          fontSize: 18,
        }}
      >
      {participant.title?.toUpperCase()}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 50,
          color: '#000',
          fontFamily: "'Kameron', serif",
          textAlign: 'center',
          width: '100%',

          fontSize: 14,
          fontStyle: 'italic',
        }}
      >
      {participant.subtitle}
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
  const columns = 2;
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
        const response = await fetch(`${API_URL}/api/registration/get_data_id`);
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
          minHeight: `${rows * (ID_CARD_HEIGHT + 20)}px`,
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
            columnWidth={ID_CARD_WIDTH + 20}
            height={rows * (ID_CARD_HEIGHT + 20)}
            rowCount={rows}
            rowHeight={ID_CARD_HEIGHT + 20}
            width={columns * (ID_CARD_WIDTH + 20) + 20}
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
          .your-id-card-class {
    background: #fff !important;
  }
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
