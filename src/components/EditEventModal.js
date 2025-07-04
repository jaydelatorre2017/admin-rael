import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress
} from "@mui/material";
import axios from "axios";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import useSwalTheme from '../utils/useSwalTheme';
import dayjs from "dayjs";
import { API_URL, headername, keypoint } from '../utils/config';

const EditEventModal = ({ open, handleClose, event, fetchEvents }) => {
  const defaultEvent = {
    id: null, // <-- add this line
    event_name: "",
    event_host: "",
    event_venue: "",
    event_description: "",
    event_start_date: "",
    event_end_date: "",
    activate_event: false,
    required_receipt: false,
  };

  const [formValues, setFormValues] = useState(defaultEvent);
  const [loading, setLoading] = useState(false);
  const SwalInstance = useSwalTheme();


  useEffect(() => {
    if (event) {
      setFormValues({
        id: event.id || null, // <-- add this line
        event_name: event.name || "",
        event_host: event.host || "",
        event_venue: event.venue || "",
        event_description: event.description || "",
        event_start_date: event.start_date || "",
        event_end_date: event.end_date || "",
        event_type: event.events_types_id || "",
        id_content: event.id_content || "",
        division: event.division || "",
        activate_event: event.active ?? false,
        required_receipt: event.required_reciept ?? false,
      });
    }
  }, [event]);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "activate_event" || e.target.name === "required_receipt") {
      value = value === "true" || value === true;
    }
    setFormValues({ ...formValues, [e.target.name]: value });
  };

  const handleDateChange = (name, value) => {
    setFormValues({ ...formValues, [name]: value ? dayjs(value).format("YYYY-MM-DD") : "" });
  };

  const checkInternet = () => {
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
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkInternet()) return;
    handleClose();

    const result = await SwalInstance.fire({
      title: "Are you sure?",
      text: "Do you want to update this event?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    });

    if (!result.isConfirmed) return;

    SwalInstance.fire({
      title: "Updating...",
      text: "Please wait while updating event details.",
      allowOutsideClick: false,
      didOpen: () => SwalInstance.showLoading(),
    });

    setLoading(true);
    try {
      const payload = {
        name: formValues.event_name,
        host: formValues.event_host,
        description: formValues.event_description,
        start_date: formValues.event_start_date,
        end_date: formValues.event_end_date,
        active: formValues.activate_event,
        required_reciept: formValues.required_receipt, // <-- fix key spelling
        venue: formValues.event_venue,
      };

      await axios.put(
        `${API_URL}/api/events/update_event/${formValues.id}`, // <-- use formValues.id
        payload,
        { headers: { [headername]: keypoint } }
      );
      
      SwalInstance.fire("Updated!", "Event details have been updated.", "success");
      fetchEvents();
    } catch (error) {
      console.error("Error updating event:", error);
      SwalInstance.fire("Error!", "Failed to update event.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Event</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Event Name"
                name="event_name"
                value={formValues.event_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Event Host"
                name="event_host"
                value={formValues.event_host}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Description"
                name="event_description"
                value={formValues.event_description}
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
                  value={formValues.event_start_date ? dayjs(formValues.event_start_date) : null}
                  onChange={(newValue) => handleDateChange('event_start_date', newValue)}
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
                  value={formValues.event_end_date ? dayjs(formValues.event_end_date) : null}
                  onChange={(newValue) => handleDateChange('event_end_date', newValue)}
                  format="YYYY-MM-DD"
                  minDate={formValues.event_start_date ? dayjs(formValues.event_start_date) : undefined}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Activate Event</InputLabel>
                <Select
                  name="activate_event"
                  value={formValues.activate_event}
                  onChange={handleChange}
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
                  value={formValues.required_receipt}
                  onChange={handleChange}
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
                value={formValues.event_venue}
                onChange={handleChange}
                multiline
                minRows={3}
                required
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" variant="contained">Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Update Event"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEventModal;