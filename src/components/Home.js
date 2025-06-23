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

export default function FilterableParticipantsChart() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [school, setSchool] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    fetch('http://localhost:3000/api/registration/get_division_count')
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setFilteredData(resData);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  // Derive dropdown options
  const divisions = [...new Set(data.map((d) => d.division_name))];
  const districts = [...new Set(data.filter((d) => (!division || d.division_name === division)).map((d) => d.district_name))];
  const schools = [...new Set(data.filter((d) => (!division || d.division_name === division) && (!district || d.district_name === district)).map((d) => d.school_name))];

  // Filter data on select
  useEffect(() => {
    setFilteredData(
      data.filter((row) => {
        return (
          (!division || row.division_name === division) &&
          (!district || row.district_name === district) &&
          (!school || row.school_name === school)
        );
      })
    );
  }, [division, district, school, data]);

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} mb={2}>Participants by School</Typography>

          {/* Filter Controls */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <FormControl sx={{ minWidth: 180 }} size="small">
              <InputLabel>Division</InputLabel>
              <Select value={division} onChange={(e) => {setDivision(e.target.value); setDistrict(''); setSchool('');}}>
                <MenuItem value="">All Divisions</MenuItem>
                {divisions.map((div) => (
                  <MenuItem key={div} value={div}>{div}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180 }} size="small">
              <InputLabel>District</InputLabel>
              <Select value={district} onChange={(e) => {setDistrict(e.target.value); setSchool('');}}>
                <MenuItem value="">All Districts</MenuItem>
                {districts.map((dis) => (
                  <MenuItem key={dis} value={dis}>{dis}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180 }} size="small">
              <InputLabel>School</InputLabel>
              <Select value={school} onChange={(e) => setSchool(e.target.value)}>
                <MenuItem value="">All Schools</MenuItem>
                {schools.map((sch) => (
                  <MenuItem key={sch} value={sch}>{sch}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Loading / Error handling */}
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : filteredData.length === 0 ? (
            <Alert severity="info">No data found for this filter.</Alert>
          ) : (
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <BarChart
                xAxis={[
                  {
                    data: filteredData.map((d) => d.school_name),
                    scaleType: 'band',
                    tickLabelStyle: { fontSize: 12, fontWeight: 500, fill: '#333' },
                  },
                ]}
                yAxis={[
                  {
                    label: 'Participants',
                    tickLabelStyle: { fontSize: 12, fontWeight: 500 },
                  },
                ]}
                series={[
                  {
                    data: filteredData.map((d) => Number(d.participant_count)),
                    color: '#1976d2',
                    valueFormatter: (v) => v?.toLocaleString(),
                  },
                ]}
                height={400}
                grid={{ vertical: true, horizontal: true }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
