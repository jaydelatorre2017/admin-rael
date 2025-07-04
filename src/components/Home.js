import { useEffect, useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { API_URL } from '../utils/config';

export default function FilterableParticipantsChart() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [school, setSchool] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch attendance summary data
  useEffect(() => {
    fetch(`${API_URL}/api/registration/get_division_count`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setFilteredData(resData);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  // Dropdown options
  const divisions = [...new Set(data.map((d) => d.division_name))];
  const districts = [
    ...new Set(
      data
        .filter((d) => !division || d.division_name === division)
        .map((d) => d.district_or_fd)
    ),
  ];
  const schools = [
    ...new Set(
      data
        .filter(
          (d) =>
            (!division || d.division_name === division) &&
            (!district || d.district_or_fd === district)
        )
        .map((d) => d.school_or_section)
    ),
  ];

  // Apply filters
  useEffect(() => {
    setFilteredData(
      data.filter((d) => {
        return (
          (!division || d.division_name === division) &&
          (!district || d.district_or_fd === district) &&
          (!school || d.school_or_section === school)
        );
      })
    );
  }, [division, district, school, data]);

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} mb={2}>
            Attendance Summary by School/Section
          </Typography>

          {/* Filter Dropdowns */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <FormControl sx={{ minWidth: 180 }} size="small">
              <InputLabel>Division</InputLabel>
              <Select
                value={division}
                onChange={(e) => {
                  setDivision(e.target.value);
                  setDistrict('');
                  setSchool('');
                }}
              >
                <MenuItem value="">All Divisions</MenuItem>
                {divisions.map((div) => (
                  <MenuItem key={div} value={div}>
                    {div}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180 }} size="small">
              <InputLabel>District / Functional Division</InputLabel>
              <Select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setSchool('');
                }}
              >
                <MenuItem value="">All Districts</MenuItem>
                {districts.map((dis) => (
                  <MenuItem key={dis} value={dis}>
                    {dis}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180 }} size="small">
              <InputLabel>School / Section</InputLabel>
              <Select
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              >
                <MenuItem value="">All Schools/Sections</MenuItem>
                {schools.map((sch) => (
                  <MenuItem key={sch} value={sch}>
                    {sch}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Chart or Message */}
          {loading ? (
            <Box display="flex" justifyContent="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : filteredData.length === 0 ? (
            <Alert severity="info">No data found for this filter.</Alert>
          ) : (
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <BarChart
                height={400}
                xAxis={[
                  {
                    data: filteredData.map((d) => d.school_or_section),
                    scaleType: 'band',
                    tickLabelStyle: { fontSize: 12, fontWeight: 500 },
                  },
                ]}
                yAxis={[
                  {
                    label: 'People',
                    tickLabelStyle: { fontSize: 12 },
                  },
                ]}
                series={[
                  {
                    label: 'Registered',
                    data: filteredData.map((d) => Number(d.total_registered)),
                    color: '#1976d2',
                  },
                  {
                    label: 'Attended Today',
                    data: filteredData.map((d) =>
                      Number(d.total_attended_today || 0)
                    ),
                    color: '#4caf50',
                  },
                ]}
                grid={{ vertical: true, horizontal: true }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
