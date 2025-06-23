import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Stack,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid } from "@mui/x-data-grid";
import Swal from 'sweetalert2';
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuItem from "@mui/material/MenuItem";
import { API_URL,headername,keypoint } from '../utils/config';

const CustomNoRowsOverlay = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    <SearchIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
    <Typography color="text.secondary">No Data Available</Typography>
  </Box>
);

const RegistrationTable = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [school, setSchool] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/registration/get`)
      .then(res => res.json())
      .then(data => {
        setRegistrations(data);
        setFilteredRegistrations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Extract unique values for dropdowns
  const divisionOptions = [...new Set(registrations.map(r => r.division_name).filter(Boolean))];
  const districtOptions = [...new Set(registrations.filter(r => !division || r.division_name === division).map(r => r.district_name).filter(Boolean))];
  const schoolOptions = [...new Set(registrations.filter(r => (!division || r.division_name === division) && (!district || r.district_name === district)).map(r => r.school).filter(Boolean))];

  // Filtering logic
  useEffect(() => {
    let filtered = registrations;

    if (division) filtered = filtered.filter(r => r.division_name === division);
    if (district) filtered = filtered.filter(r => r.district_name === district);
    if (school) filtered = filtered.filter(r => r.school === school);

    if (searchQuery) {
      filtered = filtered.filter(reg =>
        reg.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.email_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.school?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.or_number?.toString().includes(searchQuery) ||
        reg.phone_number?.toString().includes(searchQuery) ||
        reg.position?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredRegistrations(filtered);
  }, [searchQuery, registrations, division, district, school]);

  // Reset dependent dropdowns
  useEffect(() => { setDistrict(''); setSchool(''); }, [division]);
  useEffect(() => { setSchool(''); }, [district]);

  // Download CSV utility
  const handleDownloadCSV = () => {
    if (!filteredRegistrations.length) return;
    const replacer = (key, value) => (value === null || value === undefined ? '' : value);
    const header = Object.keys(filteredRegistrations[0]);
    const csv = [
      header.join(','),
      ...filteredRegistrations.map(row =>
        header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'registered_participants.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Delete all handler
  const handleDeleteAll = async () => {
    if (!registrations.length) return;
    const result = await Swal.fire({
      title: 'Delete All Participants?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete all!',
    });
    if (result.isConfirmed) {
      setLoading(true);
      try {
        // Adjust API endpoint as needed
        const res = await fetch('http://localhost:3000/api/registration/delete-all', { method: 'DELETE' });
        if (res.ok) {
          setRegistrations([]);
          setFilteredRegistrations([]);
          Swal.fire('Deleted!', 'All participants have been deleted.', 'success');
        } else {
          Swal.fire('Error', 'Failed to delete all participants.', 'error');
        }
      } catch {
        Swal.fire('Error', 'Failed to delete all participants.', 'error');
      }
      setLoading(false);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 200 }, // Fixed width
    { field: 'email_address', headerName: 'Email', width: 200,
      renderCell: (params) => (
        <div
          style={{
            whiteSpace: 'normal',      // allow wrapping
            wordBreak: 'break-word',   // break long words
            lineHeight: 1.4,           // optional spacing
            padding: '4px 0',          // optional spacing
          }}
        >
          {params.value}
        </div>
      ),
    },
    { field: 'division_name', headerName: 'Division', width: 150 },
    { field: 'district_name', headerName: 'District', width: 200,
      renderCell: (params) => (
    <div
      style={{
        whiteSpace: 'normal',      // allow wrapping
        wordBreak: 'break-word',   // break long words
        lineHeight: 1.4,           // optional spacing
        padding: '4px 0',          // optional spacing
      }}
    >
      {params.value}
    </div>
  ),
     },
    { field: 'school', headerName: 'School', width: 200,
      renderCell: (params) => (
    <div
      style={{
        whiteSpace: 'normal',      // allow wrapping
        wordBreak: 'break-word',   // break long words
        lineHeight: 1.4,           // optional spacing
        padding: '4px 0',          // optional spacing
      }}
    >
      {params.value}
    </div>
  ),
     },
    { field: 'or_number', headerName: 'OR Number', width: 120 },
    { field: 'payment_date', headerName: 'Payment Date', width: 120},
    { field: 'phone_number', headerName: 'Phone Number', width: 150},
   {
  field: 'or_receipt_url',
  headerName: 'Receipt',
  width: 130,
  renderCell: (params) => (
    <span
      onClick={() => {
        if (params.value) {
          // Show a loading Swal while we load the image
          Swal.fire({
            title: 'Loading receipt...',
            html: '<div class="swal2-loader"></div>',
            showConfirmButton: false,
            allowOutsideClick: false,
          });

          // Preload the image
          const img = new Image();
          img.src = params.value;
          img.onload = () => {
            Swal.fire({
              title: 'Receipt',
              imageUrl: params.value,
              imageAlt: 'Receipt',
              imageWidth: 'auto',
              imageHeight: 'auto',
              confirmButtonText: 'Close',
              width: 600,
            });
          };
          img.onerror = () => {
            Swal.fire('Error', 'Unable to load receipt image.', 'error');
          };
        } else {
          Swal.fire('No Receipt Available', '', 'info');
        }
      }}
      style={{
        color: isDark ? '#90caf9' : '#1976d2',
        cursor: 'pointer',
        textDecoration: 'underline',
      }}
    >
      View Receipt
    </span>
  ),
},

    {
      field: 'participant_image_url',
      headerName: 'Profile',
      width:100,
      renderCell: (params) => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          {params.value ? (
            <img
              src={params.value}
              alt="participant"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: isDark ? "1px solid #444" : "1px solid #e0e0e0"
              }}
            />
          ) : (
            <span>N/A</span>
          )}
        </div>
      )
    },
    { field: 'position', headerName: 'Position', width: 200 },
    { field: 'food_restriction', headerName: 'Food Restriction', width: 200,
      renderCell: (params) => (
        <div
          style={{
            whiteSpace: 'normal',      // allow wrapping
            wordBreak: 'break-word',   // break long words
            lineHeight: 1.4,           // optional spacing
            padding: '4px 0',          // optional spacing
          }}
        >
          {params.value || 'None'}
        </div>
      ),
    },
    { field: 'registration_date', headerName: 'Date Registered', width: 200},
   
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }}}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2} mb={3}>
        <Typography variant="h4" fontWeight={700} color="primary.main">
          Registered Participants
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ ml: 2 }}>
          Showing: <b>{filteredRegistrations.length}</b> participant{filteredRegistrations.length !== 1 ? 's' : ''}
        </Typography>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1} mb={2} flexWrap="wrap">
        <TextField
          label="Search participants"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          sx={{ width: { xs: '100%', sm: 220 } }}
        />
        <TextField
          select
          label="Division"
          value={division}
          onChange={e => setDivision(e.target.value)}
          size="small"
          sx={{ width: { xs: '100%', sm: 150 } }}
        >
          <MenuItem value="">All Divisions</MenuItem>
          {divisionOptions.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="District"
          value={district}
          onChange={e => setDistrict(e.target.value)}
          size="small"
          sx={{ width: { xs: '100%', sm: 150 } }}
          disabled={!division}
        >
          <MenuItem value="">All Districts</MenuItem>
          {districtOptions.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="School"
          value={school}
          onChange={e => setSchool(e.target.value)}
          size="small"
          sx={{ width: { xs: '100%', sm: 180 } }}
          disabled={!district && !division}
        >
          <MenuItem value="">All Schools</MenuItem>
          {schoolOptions.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadCSV}
          disabled={!filteredRegistrations.length}
          sx={{ minWidth: 40 }}
        >
          Download CSV
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDeleteAll}
          disabled={!registrations.length}
          sx={{ minWidth: 40 }}
        >
          Delete All
        </Button>
      </Stack>
      <Box
        sx={{
          border: '2px solid',
          borderColor: isDark ? 'grey.800' : 'grey.300',
          borderRadius: 2,
          p: 1,
          height: 480,
          width: '100%',
          '& .MuiDataGrid-root': {
            bgcolor: isDark ? 'background.paper' : 'background.paper',
            borderRadius: 2,
            color: isDark ? '#fff' : undefined,
          },
          '& .MuiDataGrid-row:hover': {
            bgcolor: isDark ? 'action.selected' : 'action.hover',
          },
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress color={isDark ? "primary" : "inherit"} />
          </Box>
        ) : (
          <DataGrid
            rows={filteredRegistrations}
            columns={columns}
            getRowId={(row) => row.id}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            slots={{ noRowsOverlay: CustomNoRowsOverlay }}
            sx={{
              border: 0,
              fontSize: 15,
              color: isDark ? '#fff' : undefined,
              bgcolor: isDark ? 'background.paper' : undefined,
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default RegistrationTable;
