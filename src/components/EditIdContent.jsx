import React, { useState, useEffect } from "react";
import axios from "axios";
import useSwalTheme from "../utils/useSwalTheme";
import {
  Button,
  TextField,
  Container,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { API_URL, headername, keypoint } from '../utils/config';

const EditIdContent = ({ open, handleClose, idContent, fetchIdContents }) => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    right_logo: null,
    left_logo: null,
  });

  const [previews, setPreviews] = useState({
    right_logo: null,
    left_logo: null,
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const SwalInstance = useSwalTheme();

  useEffect(() => {
    if (idContent) {
      setFormData({
        title: idContent.title || "",
        subtitle: idContent.subtitle || "",
        right_logo: null,
        left_logo: null,
      });
      setPreviews({
        right_logo: idContent.right_logo_url || null,
        left_logo: idContent.left_logo_url || null,
      });
    }
  }, [idContent, open]);

  useEffect(() => {
    if (!open) {
      setPreviews({ right_logo: null, left_logo: null });
      setFormData({ title: "", subtitle: "", right_logo: null, left_logo: null });
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, files, value } = e.target;
    if (files) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));
      setPreviews((prev) => ({ ...prev, [name]: file ? URL.createObjectURL(file) : null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title) {
      SwalInstance.fire({
        icon: "error",
        title: "Title required",
        text: "Please enter a title before submitting.",
      });
      return;
    }

    if (!navigator.onLine) {
      SwalInstance.fire({
        icon: "error",
        title: "No Internet",
        text: "Check your connection and try again.",
      });
      return;
    }

    handleClose();

    const result = await SwalInstance.fire({
      title: "Update ID Content?",
      text: "Do you want to update this content?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, update",
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("subtitle", formData.subtitle || "");
      if (formData.right_logo) payload.append("right_logo", formData.right_logo);
      if (formData.left_logo) payload.append("left_logo", formData.left_logo);

      await axios.put(
        `${API_URL}/api/id_content/update/${idContent.id}`,
        payload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      SwalInstance.fire(
        "Success",
        "ID Content updated successfully",
        "success"
      );

      fetchIdContents && fetchIdContents();
    } catch (error) {
      SwalInstance.fire(
        "Error",
        error.response?.data?.error || "Failed to update ID Content",
        "error"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit ID Content</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
              />
            </Grid>
            {/* Right logo input */}
            <Grid item xs={12}>
              <Typography variant="body1">Right Logo</Typography>
              <input
                type="file"
                accept="image/*"
                name="right_logo"
                onChange={handleChange}
              />
              {previews.right_logo && (
                <Box mt={2}>
                  <img
                    src={previews.right_logo}
                    alt="Right logo preview"
                    style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
                  />
                </Box>
              )}
            </Grid>
            {/* Left logo input */}
            <Grid item xs={12}>
              <Typography variant="body1">Left Logo</Typography>
              <input
                type="file"
                accept="image/*"
                name="left_logo"
                onChange={handleChange}
              />
              {previews.left_logo && (
                <Box mt={2}>
                  <img
                    src={previews.left_logo}
                    alt="Left logo preview"
                    style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" variant="contained">Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Update ID Content"}
        </Button>
      </DialogActions>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default EditIdContent;