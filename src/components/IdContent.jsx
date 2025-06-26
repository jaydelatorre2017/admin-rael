import React, { useEffect, useState } from "react";
import axios from "axios";
import useSwalTheme from '../utils/useSwalTheme';
import { DataGrid } from '@mui/x-data-grid';
import {
  Typography,
  Box,
  IconButton,
  TextField,
  Paper,
  Stack,
  Tooltip,
  useTheme,
  Avatar,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BadgeIcon from '@mui/icons-material/Badge';
import { API_URL } from '../utils/config';
import EditIdContent from './EditIdContent'; // 1. Import the modal


const IdContentList = () => {
  const [idContents, setIdContents] = useState([]);
  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false); // 2. Modal open state
  const [selectedIdContent, setSelectedIdContent] = useState(null); // 2. Selected item
  const SwalInstance = useSwalTheme();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const fetchIdContents = async () => {
    SwalInstance.fire({
      title: "Loading...",
      text: "Fetching ID contents, please wait.",
      allowOutsideClick: false,
      didOpen: () => {
        SwalInstance.showLoading();
      },
    });

    try {
      const response = await axios.get(`${API_URL}/api/id_content/get`);
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response from server");
      }
      setIdContents(response.data);
      SwalInstance.close();
    } catch (error) {
      SwalInstance.fire({
        icon: "error",
        title: "Oops...",
        text: error.message || "Something went wrong while fetching the ID contents!",
      });
    }
  };

  useEffect(() => {
    fetchIdContents();
  }, []);

  const deleteIdContent = async (id) => {
    SwalInstance.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/api/id_content/delete/${id}`);
          fetchIdContents();
          SwalInstance.fire("Deleted!", "The ID content has been removed.", "success");
        } catch (error) {
          SwalInstance.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong while deleting the ID content!",
          });
        }
      }
    });
  };

  const handleEdit = (row) => {
    setSelectedIdContent(row);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setSelectedIdContent(null);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'title', headerName: 'Title', width: 180 },
    { field: 'subtitle', headerName: 'Subtitle', width: 180 },
    {
      field: 'left_logo_url',
      headerName: 'Left Logo',
      width: 120,
      renderCell: (params) => (
        <Avatar src={params.value} variant="square" sx={{ width: 48, height: 48 }} />
      ),
    },
    {
      field: 'right_logo_url',
      headerName: 'Right Logo',
      width: 120,
      renderCell: (params) => (
        <Avatar src={params.value} variant="square" sx={{ width: 48, height: 48 }} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
      renderCell: (params) => (

        <Stack direction="row" spacing={1} sx={{ marginTop: '10px' }}>
          <Tooltip title="Delete">
            <IconButton color="error" onClick={() => deleteIdContent(params.row.id)} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton color="primary" onClick={() => handleEdit(params.row)} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const filteredIdContents = idContents.filter(item =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const CustomNoRowsOverlay = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <BadgeIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
      <Typography color="text.secondary">No Data Available</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, bgcolor: isDark ? 'background.default' : '#f4f6f8', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{
        maxWidth: 900,
        mx: 'auto',
        p: { xs: 2, sm: 4 },
        borderRadius: 3,
        bgcolor: isDark ? 'background.paper' : 'background.default'
      }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2} mb={3}>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            ID Content List
          </Typography>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', sm: 300 } }}
            InputProps={{
              style: {
                color: isDark ? '#fff' : undefined,
              }
            }}
            InputLabelProps={{
              style: {
                color: isDark ? '#aaa' : undefined,
              }
            }}
          />
        </Stack>
        <Box sx={{
          height: 400,
          width: '100%',
          '& .MuiDataGrid-root': {
            bgcolor: isDark ? 'background.paper' : 'background.paper',
            borderRadius: 2,
            color: isDark ? '#fff' : undefined,
          },
          '& .MuiDataGrid-row:hover': {
            bgcolor: isDark ? 'action.selected' : 'action.hover',
          },
        }}>
          <DataGrid
            rows={filteredIdContents}
            columns={columns}
            pageSize={7}
            rowsPerPageOptions={[7]}
            getRowId={(row) => row.id}
            slots={{
              noRowsOverlay: CustomNoRowsOverlay,
            }}
            sx={{
              border: 0,
              fontSize: 15,
              color: isDark ? '#fff' : undefined,
              bgcolor: isDark ? 'background.paper' : undefined,
            }}
          />
        </Box>
      </Paper>
      {/* 4. Edit Modal Integration */}
      <EditIdContent
        open={editOpen}
        handleClose={handleEditClose}
        idContent={selectedIdContent}
        fetchIdContents={fetchIdContents}
      />
    </Box>
  );
};

export default IdContentList;
