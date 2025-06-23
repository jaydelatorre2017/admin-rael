import React, { useState, useEffect } from "react";
import axios from "axios";
import useSwalTheme from '../utils/useSwalTheme';
import {
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  Grid,
} from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";  // Import Dayjs for date formatting
import { API_URL,headername,keypoint } from '../utils/config';

const CreateEvent = () => {
  const [Event, setEvent] = useState({
    event_name: "",
    event_host: "",
    event_description: "",
    event_start_date: "",
    event_end_date: "",
    event_type: "",
  });

  // Add state for event types
  const [eventTypes, setEventTypes] = useState([]);
  const [loadingEventTypes, setLoadingEventTypes] = useState(true);

  // Fetch event types from API
  useEffect(() => {
    axios.get(`${API_URL}/api/events/get_events_types`)
      .then(res => {
        setEventTypes(res.data);
        setLoadingEventTypes(false);
      })
      .catch(() => setLoadingEventTypes(false));
  }, []);

  
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const SwalInstance = useSwalTheme();






 

  const handleChange = (e) => {
    setEvent({ ...Event, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!navigator.onLine) {
      SwalInstance.fire({
        icon: 'error',
        title: 'No Internet',
        text: 'You are currently offline. Please check your connection.',
        toast: true,
        timer: 3000,
        position: 'top-end',
        showConfirmButton: false,
      });
      return;
    }

    const result = await SwalInstance.fire({
      title: 'Are you sure?',
      text: "Do you want to create this Event?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'No, cancel!'
    });

    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);
    try {
      // Map frontend state to backend API fields
      const payload = {
        name: Event.event_name,
        host: Event.event_host,
        description: Event.event_description,
        start_date: Event.event_start_date,
        end_date: Event.event_end_date,
        events_types: Event.event_type, // Make sure this matches your backend expectations
      };

      const response = await axios.post('http://localhost:3000/api/events/create_event', payload);

      SwalInstance.fire("Success", response.data.message, "success");
    } catch (error) {
      console.error("Error adding Event:", error);
      SwalInstance.fire("Error", "Failed to add Event.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Create Events</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Event Name"
                name="event_name"
                value={Event.event_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Event Host"
                name="event_host"
                value={Event.event_host}
                onChange={handleChange}
                required
              />
            </Grid>
        
            <Grid item xs={20} >
              <TextField
                fullWidth
                label="Event Description"
                name="event_description"
                value={Event.event_description}
                onChange={handleChange}
                required
                multiline
                minRows={3}
                maxRows={6}
              />
            </Grid>
             <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Event Start Date"
                  name="event_start_date"
                  value={Event.event_start_date ? dayjs(Event.event_start_date) : null}
                  onChange={(newValue) => handleChange({ target: { name: 'event_start_date', value: newValue ? newValue.format("YYYY-MM-DD") : '' } })}
                  format="YYYY-MM-DD"
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>
             <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Event End Date"
                name="event_end_date"
                value={Event.event_end_date ? dayjs(Event.event_end_date) : null}
                onChange={(newValue) => handleChange({ target: { name: 'event_end_date', value: newValue ? newValue.format("YYYY-MM-DD") : '' } })}
                format="YYYY-MM-DD"
                minDate={Event.event_start_date ? dayjs(Event.event_start_date) : undefined}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />

              </LocalizationProvider>
            </Grid>

            
            <Grid item xs={12} >
              <FormControl fullWidth required>
                <InputLabel>Event Type</InputLabel>
                <Select
                  name="event_type"
                  value={Event.event_type}
                  onChange={handleChange}
                  label="Event Type"
                >
                  {loadingEventTypes ? (
                    <MenuItem value="">
                      <em>Loading...</em>
                    </MenuItem>
                  ) : (
                    eventTypes.map(type => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.category}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
         
           
           


            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Create Event"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

     

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateEvent;
