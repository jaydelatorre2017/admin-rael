import React from 'react';
import { Box, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';

const IDCard = React.forwardRef(({ participant }, ref) => {
   const defaultParticipant = {
    id: 'RAEL-2025-0000',
    name: 'MARIA CRISTINA ',
    position: 'SCHOOL HEAD',
    full_name: 'Maria Cristina Dela Cruz',
    division_name: 'CAMARINES NORTE',
    school: 'DAET ELEMENTARY SCHOOL',
    office: '',
    phone_number: '09171234567',
    participant_image_url: '/default.png',
};

    const data = participant || defaultParticipant;

    return (
        <Box
            ref={ref}
            sx={{
                width: 350,
                height: 520,
                overflow: 'hidden',
                backgroundColor: '#0b2545',
                backgroundImage: 'url("/1.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundBlendMode: 'overlay',
                borderRadius: 3,
                boxShadow: 6,
                fontFamily: 'Arial, sans-serif',
                color: '#fff',
                position: 'relative',
            }}
        >
            {/* Header Section */}
            <Box
                sx={{
                    position: 'relative',
                    pt: 0.5,
                    pb: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center',
                }}
            >
                {/* Left Logo */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        left: 12,
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        backgroundColor: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 8px rgba(0,0,0,0.2)',
                    }}
                >
                    <img
                        src="LeftLogo.png"
                        alt="Left Logo"
                        style={{ width: '90%', height: '90%', objectFit: 'contain' }}
                    />
                </Box>

                {/* Right Logo */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 12,
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        backgroundColor: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 8px rgba(0,0,0,0.2)',
                    }}
                >
                    <img
                        src="RightLogo.png"
                        alt="Right Logo"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                </Box>

                {/* Center Title */}
                <Box sx={{ mt: 5 }}>
                    <Typography fontSize={20} fontWeight={700}>
                        RAEL
                    </Typography>
                    <Typography fontSize={12} color="#d0d0d0">
                        Regional Assembly of Educational Leaders
                    </Typography>
                </Box>
            </Box>

            {/* Profile Image */}
            <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                <Box
                    sx={{
                        width: 160,
                        height: 160,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '4px solid #ffffff',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                        bgcolor: '#ffffff',
                        objectPosition: 'center top',
                    }}
                >
                    <img
                        crossOrigin="anonymous"
                        src={data.participant_image_url}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </Box>
            </Box>

            {/* Participant Name and Role */}
            <Box sx={{ textAlign: 'center', mt: 2, px: 2 }}>
                <Typography fontSize={13} color="#d0d0d0">
                    {data.position}
                </Typography>
                <Typography fontSize={24} fontWeight={600}>
                    {data.name.toUpperCase()}
                </Typography>
            </Box>

            {/* QR and Info Section */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    right: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {/* Participant Details on Left */}
                <Box sx={{ flex: 1, pr: 2 }}>
                    <Typography fontSize={10} fontWeight={500}>
                        Full Name: {data.full_name.toUpperCase()}
                    </Typography>
                    <Typography fontSize={10}>Division: {data.division_name}</Typography>
                    {data.school ? (
                        <Typography fontSize={10}>School: {data.school}</Typography>
                    ) : (
                        <Typography fontSize={10}>Office: {data.office}</Typography>
                    )}
                    <Typography fontSize={10}>Phone: {data.phone_number}</Typography>
                </Box>

                {/* QR Code on Right */}
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 8px rgba(0,0,0,0.1)',
                    }}
                >
                    <QRCodeSVG
                        value={String(data.id)}
                        size={70}
                        level="H"
                        bgColor="transparent"
                        fgColor="#0b2545"
                    />
                </Box>
            </Box>
        </Box>
    );
});

export default IDCard;
