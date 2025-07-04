import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Stack,
  useTheme,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid } from "@mui/x-data-grid";
import Swal from 'sweetalert2';
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuItem from "@mui/material/MenuItem";
import { API_URL } from '../utils/config';

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
  const [event, setEvent] = useState('');

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

  const divisionOptions = [...new Set(registrations.map(r => r.division_name).filter(Boolean))];
  const districtOptions = [...new Set(registrations.filter(r => !division || r.division_name === division).map(r => r.district_name).filter(Boolean))];
  const schoolOptions = [...new Set(registrations.filter(r => (!division || r.division_name === division) && (!district || r.district_name === district)).map(r => r.school).filter(Boolean))];
  const eventOptions = [...new Set(registrations.map(r => r.event_name).filter(Boolean))];

  useEffect(() => {
    let filtered = registrations;
    if (division) filtered = filtered.filter(r => r.division_name === division);
    if (district) filtered = filtered.filter(r => r.district_name === district);
    if (school) filtered = filtered.filter(r => r.school === school);
    if (event) filtered = filtered.filter(r => r.event_name === event);
    if (searchQuery) {
      filtered = filtered.filter(reg =>
        reg.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.email_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.school?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.or_number?.toString().includes(searchQuery) ||
        reg.phone_number?.toString().includes(searchQuery) ||
        reg.position?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredRegistrations(filtered);
  }, [searchQuery, registrations, division, district, school, event]);

  useEffect(() => { setDistrict(''); setSchool(''); }, [division]);
  useEffect(() => { setSchool(''); }, [district]);

  const handleDownloadCSV = () => {
  if (!filteredRegistrations.length) return;
  const columnsToInclude = ['name', 'district_name', 'school']; // <-- your desired columns
  const replacer = (key, value) => (value === null || value === undefined ? '' : value);
  const csv = [
    columnsToInclude.join(','),
    ...filteredRegistrations.map(row =>
      columnsToInclude.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',')
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

  const handleDeleteAll = async () => {
    if (!registrations.length) return;
    const result = await Swal.fire({
      title: 'Delete All Participants?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete all!'
    });
    if (result.isConfirmed) {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/registration/delete_all`, { method: 'DELETE' });
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
    { field: 'full_name', headerName: 'Name', width: 200 },
    { field: 'email_address', headerName: 'Email', width: 220 },
    { field: 'event_name', headerName: 'Event', width: 160 },
    { field: 'division_name', headerName: 'Division', width: 150 },
    { field: 'district_name', headerName: 'District', width: 200 },
    { field: 'school', headerName: 'School', width: 200 },
    {
  field: 'or_number',
  headerName: 'OR Number',
  width: 120,
  renderCell: (params) => {
    const value = params.value;
    return  value !== null ? value : 'None';
  },
},
{
  field: 'payment_date',
  headerName: 'Payment Date',
  width: 120,
  renderCell: (params) => {
    const value = params.value;
    return  value !== '' ? value : 'None';
  },
},
    { field: 'phone_number', headerName: 'Phone Number', width: 150 },
    {
      field: 'or_receipt_url',
      headerName: 'Receipt',
      width: 130,
      renderCell: (params) => (
        <span
          onClick={() => {
            if (params.value) {
              Swal.fire({
                title: 'Loading receipt...',
                html: '<div class="swal2-loader"></div>',
                showConfirmButton: false,
                allowOutsideClick: false,
              });
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
          style={{ color: theme.palette.primary.main, cursor: 'pointer', textDecoration: 'underline' }}
        >
          View Receipt
        </span>
      )
    },
    {
      field: 'participant_image_url',
      headerName: 'Profile',
      width: 100,
      renderCell: (params) => (
        <Box display="flex" justifyContent="center" alignItems="center" width="100%">
          {params.value ? (
            <img src={params.value} alt="participant" style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${isDark ? '#555' : '#ccc'}` }} />
          ) : (
            <Typography variant="caption">N/A</Typography>
          )}
        </Box>
      )
    },
    { field: 'position', headerName: 'Position', width: 180 },
    { field: 'food_restriction', headerName: 'Food Restriction', width: 200 },
    { field: 'registration_date', headerName: 'Date Registered', width: 180 },
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2} mb={3}>
        <Typography variant="h4" fontWeight={600} color="text.primary">
          Registered Participants
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Showing: <b>{filteredRegistrations.length}</b> participant{filteredRegistrations.length !== 1 ? 's' : ''}
        </Typography>
      </Stack>
      <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
          <TextField label="Search" size="small" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} sx={{ minWidth: 180 }} />
          <TextField select label="Event" size="small" value={event} onChange={e => setEvent(e.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value="">All Events</MenuItem>
            {eventOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </TextField>
          <TextField select label="Division" size="small" value={division} onChange={e => setDivision(e.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value="">All Divisions</MenuItem>
            {divisionOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </TextField>
          <TextField select label="District" size="small" value={district} onChange={e => setDistrict(e.target.value)} sx={{ minWidth: 160 }} disabled={!division}>
            <MenuItem value="">All</MenuItem>
            {districtOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </TextField>
          <TextField select label="School" size="small" value={school} onChange={e => setSchool(e.target.value)} sx={{ minWidth: 160 }} disabled={!district && !division}>
            <MenuItem value="">All</MenuItem>
            {schoolOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </TextField>
          <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={handleDownloadCSV} disabled={!filteredRegistrations.length} sx={{ textTransform: 'none' }}>Export CSV</Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteAll} disabled={!registrations.length} sx={{ textTransform: 'none' }}>Delete All</Button>
        </Stack>
      </Paper>
      <Box sx={{ borderRadius: 2, height: 500, width: '100%' }}>
        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
            <CircularProgress color="primary" />
            <Typography variant="body2" mt={2} color="text.secondary">Loading participants...</Typography>
          </Box>
        ) : (
          <DataGrid
            rows={filteredRegistrations}
            columns={columns}
            getRowId={row => row.id}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            slots={{ noRowsOverlay: CustomNoRowsOverlay }}
            sx={{
              fontSize: 14,
              '& .MuiDataGrid-columnHeaders': { backgroundColor: isDark ? '#1e1e1e' : '#f3f4f6', fontWeight: 'bold' },
              '& .MuiDataGrid-cell': { py: 1.5 },
              '& .MuiDataGrid-row:hover': { backgroundColor: isDark ? '#2a2d30' : '#f9f9f9' },
              '& .MuiDataGrid-footerContainer': { backgroundColor: isDark ? '#1e1e1e' : '#f3f4f6' },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default RegistrationTable;
