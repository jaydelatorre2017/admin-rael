import React, { useState, useEffect } from "react";
import axios from "axios";
import useSwalTheme from "../utils/useSwalTheme";
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
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { API_URL } from "../utils/config";

const CreateEvent = () => {
  const [Event, setEvent] = useState({
    event_name: "",
    event_host: "",
    event_venue: "",
    event_description: "",
    event_start_date: "",
    event_end_date: "",
    event_type: "",
    id_content: "",
    division: "",
    activate_event: false,
    required_receipt: false,
  });

  const [eventTypes, setEventTypes] = useState([]);
  const [idContent, setIdContent] = useState([]);
  const [loadingEventTypes, setLoadingEventTypes] = useState(true);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const SwalInstance = useSwalTheme();

  useEffect(() => {
    axios
      .get(`${API_URL}/api/events/get_events_types`)
      .then((res) => {
        setEventTypes(res.data);
        setLoadingEventTypes(false);
      })
      .catch(() => setLoadingEventTypes(false));
  }, []);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/id_content/get`)
      .then((res) => {
        setIdContent(res.data);
        setLoadingEventTypes(false);
      })
      .catch(() => setLoadingEventTypes(false));
  }, []);

  const handleChange = (e) => {
    setEvent({ ...Event, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!navigator.onLine) {
      SwalInstance.fire({
        icon: "error",
        title: "No Internet",
        text: "You are currently offline. Please check your connection.",
        toast: true,
        timer: 3000,
        position: "top-end",
        showConfirmButton: false,
      });
      return;
    }

    const result = await SwalInstance.fire({
      title: "Are you sure?",
      text: "Do you want to create this Event?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, create it!",
      cancelButtonText: "No, cancel!",
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      const payload = {
        name: Event.event_name,
        host: Event.event_host,
        description: Event.event_description,
        start_date: Event.event_start_date,
        end_date: Event.event_end_date,
        events_types: Event.event_type,
        id_content: Number(Event.id_content),
        active: Event.activate_event,
        required_reciept: Event.required_receipt,
        division: Event.division !== "All" ? Event.division : Event.division,
        venue: Event.event_venue,
      };

      const response = await axios.post(`${API_URL}/api/events/create_event`, payload);

      SwalInstance.fire("Success", response.data.message, "success");
    } catch (error) {
      SwalInstance.fire("Error", "Failed to add Event.", "error");
      console.error("Error creating event:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Create Event</Typography>
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Description"
                name="event_description"
                value={Event.event_description}
                onChange={handleChange}
                multiline
                minRows={3}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={Event.event_start_date ? dayjs(Event.event_start_date) : null}
                  onChange={(newValue) => setEvent({ ...Event, event_start_date: newValue ? newValue.format("YYYY-MM-DD") : "" })}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="End Date"
                  value={Event.event_end_date ? dayjs(Event.event_end_date) : null}
                  minDate={Event.event_start_date ? dayjs(Event.event_start_date) : undefined}
                  onChange={(newValue) => setEvent({ ...Event, event_end_date: newValue ? newValue.format("YYYY-MM-DD") : "" })}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Event Type</InputLabel>
                <Select
                  name="event_type"
                  value={Event.event_type}
                  onChange={handleChange}
                  label="Event Type"
                >
                  {loadingEventTypes ? (
                    <MenuItem disabled><em>Loading...</em></MenuItem>
                  ) : (
                    eventTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>{type.category}</MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Id Content</InputLabel>
                <Select
                  name="id_content"
                  value={Event.id_content}
                  onChange={handleChange}
                  label="Id Content"
                >
                  {loadingEventTypes ? (
                    <MenuItem disabled><em>Loading...</em></MenuItem>
                  ) : (
                    idContent.map((item) => (
                      <MenuItem key={item.id} value={item.id}>{item.title}</MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} >
              <FormControl fullWidth>
                <InputLabel>Division</InputLabel>
                <Select
                  name="division"
                  value={Event.division}
                  onChange={handleChange}
                  label="Division"
                  displayEmpty
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Albay">Albay</MenuItem>
                  <MenuItem value="Camarines Norte">Camarines Norte</MenuItem>
                  <MenuItem value="Camarines Sur">Camarines Sur</MenuItem>
                  <MenuItem value="Catanduanes">Catanduanes</MenuItem>
                  <MenuItem value="Masbate">Masbate</MenuItem>
                  <MenuItem value="Sorsogon">Sorsogon</MenuItem>
                  <MenuItem value="Iriga City">Iriga City</MenuItem>
                  <MenuItem value="Legaspi City">Legaspi City</MenuItem>
                  <MenuItem value="Naga City">Naga City</MenuItem>
                  <MenuItem value="Sorsogon City">Sorsogon City</MenuItem>
                  <MenuItem value="Tabaco City">Tabaco City</MenuItem>
                  <MenuItem value="Ligao City">Ligao City</MenuItem>
                  <MenuItem value="Masbate City">Masbate City</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Activate Event</InputLabel>
                <Select
                  name="activate_event"
                  value={Event.activate_event}
                  onChange={(e) => setEvent({ ...Event, activate_event: e.target.value })}
                  label="Activate Event"
                >
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Required Receipt</InputLabel>
                <Select
                  name="required_receipt"
                  value={Event.required_receipt}
                  onChange={(e) => setEvent({ ...Event, required_receipt: e.target.value })}
                  label="Required Receipt"
                >
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Venue"
                name="event_venue"
                value={Event.event_venue}
                onChange={handleChange}
                multiline
                minRows={3}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Create Event"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateEvent;
