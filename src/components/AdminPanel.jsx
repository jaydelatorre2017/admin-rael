import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';

import useSwalTheme from '../utils/useSwalTheme';
import { API_URL, headername, keypoint } from '../utils/config';
import {
    GridRowModes,
    DataGrid,
    GridActionsCellItem,
    GridRowEditStopReasons,
} from '@mui/x-data-grid';

let newRowId = 0;

export default function AdminCrudGrid() {
    const [rows, setRows] = React.useState([]);
    const [rowModesModel, setRowModesModel] = React.useState({});
    const SwalInstance = useSwalTheme();
    const theme = useTheme();

 React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Show SweetAlert loading
        SwalInstance.fire({
          title: 'Fetching Admin Data...',
          allowOutsideClick: false,
          didOpen: () => {
            SwalInstance.showLoading();
          }
        });

        const response = await fetch(`${API_URL}/api/auth/get_admin`, {
          headers: {
            "Content-Type": "application/json",
            [headername]: keypoint
          }
        });

        const data = await response.json();
        const formattedData = data.map((admin) => ({
          id: admin.id,
          username: admin.username,
          password: '',
          role: admin.role,
          can_manage_users: admin.can_manage_users,
          can_manage_transactions: admin.can_manage_transactions,
          can_generate_certificates: admin.can_generate_certificates,
          can_manage_residents: admin.can_manage_residents,
          can_bulk_operations: admin.can_bulk_operations,
          can_access_logs: admin.can_access_logs,
          isNew: false,
        }));

        setRows(formattedData);
      } catch (error) {
        // Optional: show error in Swal
        SwalInstance.fire({
          icon: 'error',
          title: 'Failed to fetch admin data',
          text: error?.message || 'Something went wrong.',
        });
        console.error('Failed to fetch admin data:', error);
      } finally {
        // Always close the loading modal
        SwalInstance.close();
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    const handleAddClick = () => {
        // Prevent multiple empty new rows
        const hasEmptyNewRow = rows.some(
            (row) => row.isNew && (!row.username || !row.password || !row.role)
        );
        if (hasEmptyNewRow) {
            SwalInstance.fire('Error', 'Finish adding the current admin before adding another.', 'error');
            return;
        }
        const newId = `new-${++newRowId}`;
        setRows((oldRows) => [
            ...oldRows,
            {
                id: newId,
                username: '',
                password: '',
                role: '',
                isNew: true,
                can_manage_users: false,
                can_manage_transactions: false,
                can_generate_certificates: false,
                can_manage_residents: false,
                can_bulk_operations: false,
                can_access_logs: false,
            },
        ]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [newId]: { mode: GridRowModes.Edit }
        }));
    };

    const handleEditClick = (id) => () => {
        setRowModesModel((prev) => ({
            ...prev,
            [id]: { mode: GridRowModes.Edit }
        }));
    };

    const handleSaveClick = (id) => () => {
        setRowModesModel((prev) => ({
            ...prev,
            [id]: { mode: GridRowModes.View }
        }));
    };

    const handleCancelClick = (id) => () => {
        setRowModesModel((prev) => ({
            ...prev,
            [id]: { mode: GridRowModes.View, ignoreModifications: true }
        }));
        setRows((prevRows) => {
            const row = prevRows.find((r) => r.id === id);
            if (row?.isNew) {
                return prevRows.filter((r) => r.id !== id);
            }
            return prevRows;
        });
    };

    const handleDeleteClick = (id) => async () => {
        if (!checkInternet()) return;
        const confirmation = await SwalInstance.fire({
            title: 'Are you sure?',
            text: 'This admin will be permanently deleted.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (!confirmation.isConfirmed) return;

        SwalInstance.fire({
            title: 'Deleting...',
            allowOutsideClick: false,
            didOpen: () => {
                SwalInstance.showLoading();
            },
        });

        try {
            const response = await fetch(`${API_URL}/api/auth/delete_admin`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    [headername]: keypoint
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            SwalInstance.fire('Deleted!', 'Admin has been removed.', 'success');
            setRows((prevRows) => prevRows.filter((row) => row.id !== id));
        } catch (error) {
            SwalInstance.fire('Error', 'Failed to delete admin.', 'error');
        }
    };

    // FIX: Remove empty new row if validation fails!
    const processRowUpdate = async (newRow, oldRow) => {
        if (!checkInternet()) return oldRow;

        const isNew = newRow.isNew;
        const trimmedUsername = newRow.username?.trim();
        const trimmedPassword = newRow.password?.trim();
        const trimmedRole = newRow.role?.trim();

        // Validation for new row
        if (isNew && (!trimmedUsername || !trimmedPassword || !trimmedRole)) {
            SwalInstance.fire('Error', 'Username, password, and role are required.', 'error');
            // Remove the invalid new row
            setRows(prev => prev.filter(r => r.id !== newRow.id));
            return oldRow;
        }

        // Ask for confirmation
        const confirmation = await SwalInstance.fire({
            title: 'Are you sure?',
            text: isNew ? 'Do you want to add this admin?' : 'Do you want to save changes?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, confirm',
            cancelButtonText: 'Cancel',
        });

        if (!confirmation.isConfirmed) {
            // Remove the row if it's new and user cancels
            if (isNew) setRows(prev => prev.filter(r => r.id !== newRow.id));
            return oldRow;
        }

        // Show loading
        SwalInstance.fire({
            title: isNew ? 'Adding...' : 'Saving...',
            allowOutsideClick: false,
            didOpen: () => SwalInstance.showLoading(),
        });

        try {
            const endpoint = isNew ? 'create_admin' : 'update_admin';
            const method = isNew ? 'POST' : 'PUT';

            const payload = {
                ...(isNew ? {} : { id: newRow.id }),
                username: trimmedUsername,
                role: trimmedRole,
                ...(isNew ? { password: trimmedPassword } : {}),
                can_manage_users: newRow.can_manage_users,
                can_manage_transactions: newRow.can_manage_transactions,
                can_generate_certificates: newRow.can_generate_certificates,
                can_manage_residents: newRow.can_manage_residents,
                can_bulk_operations: newRow.can_bulk_operations,
                can_access_logs: newRow.can_access_logs,
            };

            const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    [headername]: keypoint,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            SwalInstance.close();

            if (!response.ok) {
                SwalInstance.fire('Error', result.error || 'Request failed.', 'error');
                if (isNew) setRows(prev => prev.filter(r => r.id !== newRow.id));
                return oldRow;
            }

            SwalInstance.fire('Success', `Admin ${isNew ? 'added' : 'updated'} successfully.`, 'success');

            // Return updated row and update rows list
            const updatedRow = {
                ...newRow,
                id: result.id || newRow.id,
                username: result.username || trimmedUsername,
                role: result.role || trimmedRole,
                isNew: false,
                password: '',
            };

            setRows(prev =>
                prev
                    .filter(r => r.id !== newRow.id) // remove old/temp row
                    .concat(updatedRow) // add updated row
            );

            return updatedRow;
        } catch (error) {
            SwalInstance.close();
            SwalInstance.fire('Error', 'Something went wrong.', 'error');
            if (isNew) setRows(prev => prev.filter(r => r.id !== newRow.id));
            return oldRow;
        }
    };


    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleRowModesModelChange = (newModel) => {
        setRowModesModel(newModel);
    };

    // Adapt colors for light/dark mode
    const isDark = theme.palette.mode === 'dark';
    const paperBg = isDark ? theme.palette.background.paper : '#fcfcfc';
    const gridBg = isDark ? theme.palette.background.default : '#fff';
    const headerBg = isDark ? theme.palette.grey[900] : '#f7f7f7';
    const rowHoverBg = isDark ? theme.palette.action.hover : '#f5fafd';

    const columns = [
        {
            field: 'username',
            headerName: 'Username',
            flex: 1,
            editable: true,
            renderEditCell: (params) => (
                <input
                    value={params.value ?? ''}
                    onChange={(e) =>
                        params.api.setEditCellValue({
                            id: params.id,
                            field: 'username',
                            value: e.target.value,
                        }, e)
                    }
                    placeholder="Enter username"
                    autoFocus={params.isNew}
                    style={{
                        width: '100%',
                        padding: 6,
                        fontSize: 14,
                        borderRadius: 4,
                        border: '1px solid #ccc',
                        background: isDark ? theme.palette.background.paper : '#fff',
                        color: isDark ? '#fff' : '#222'
                    }}
                />
            )
        },
        {
            field: 'password',
            headerName: 'Password',
            flex: 1,
            editable: (params) => params.row.isNew,
            type: 'password', // just for clarity, not visual
            renderEditCell: (params) =>
                params.row.isNew ?
                    <input
                        type="password"
                        value={params.value ?? ''}
                        onChange={e =>
                            params.api.setEditCellValue({
                                id: params.id,
                                field: 'password',
                                value: e.target.value
                            }, e)
                        }
                        placeholder="Enter password"
                        style={{
                            width: '100%',
                            padding: 6,
                            fontSize: 14,
                            borderRadius: 4,
                            border: '1px solid #ccc',
                            background: isDark ? theme.palette.background.paper : '#fff',
                            color: isDark ? '#fff' : '#222'
                        }}
                    />
                    : null
        },
        {
            field: 'role',
            headerName: 'Role',
            flex: 1,
            editable: true,
            renderEditCell: (params) => (
                <input
                    value={params.value ?? ''}
                    onChange={e =>
                        params.api.setEditCellValue({
                            id: params.id,
                            field: 'role',
                            value: e.target.value
                        }, e)
                    }
                    placeholder="Enter role"
                    style={{
                        width: '100%',
                        padding: 6,
                        fontSize: 14,
                        borderRadius: 4,
                        border: '1px solid #ccc',
                        background: isDark ? theme.palette.background.paper : '#fff',
                        color: isDark ? '#fff' : '#222'
                    }}
                />
            )
        },
        { field: 'can_manage_users', headerName: 'Users', flex: 1, type: 'boolean', editable: true },
        { field: 'can_manage_transactions', headerName: 'Transactions', flex: 1, type: 'boolean', editable: true },
        { field: 'can_generate_certificates', headerName: 'Certificates', type: 'boolean', flex: 1, editable: true },
        { field: 'can_manage_residents', headerName: 'Residents', flex: 1, type: 'boolean', editable: true },
        { field: 'can_bulk_operations', headerName: 'Bulk Ops', flex: 1, type: 'boolean', editable: true },
        { field: 'can_access_logs', headerName: 'History Logs', flex: 1, type: 'boolean', editable: true },

        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 110,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            onClick={handleSaveClick(id)}
                            sx={{ color: 'primary.main' }}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    return (
        <Paper
            elevation={3}
            sx={{
                borderRadius: 3,
                p: 3,
                background: paperBg,
                mt: 2,
                
            }}
        >
            <Box sx={{ mb: 2 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Admin Control Panel
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    Manage admin accounts and control their access. You can add new admins, edit their details, set roles and permissions, or remove them.
                </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={handleAddClick}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                        boxShadow: 'none'
                    }}
                >
                    Add Admin
                </Button>
            </Box>
            <DataGrid
                rows={rows}
                columns={columns}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                autoHeight={true}
                getRowId={(row) => row.id}
                sx={{
                    background: gridBg,
                    borderRadius: 2,
                    fontSize: 15,
                    color: isDark ? '#fff' : '#222',
                    '& .MuiDataGrid-columnHeaders': {
                        background: headerBg,
                        fontWeight: 'bold',
                        color: isDark ? '#fff' : '#222'
                    },
                    '& .MuiDataGrid-row:hover': {
                        background: rowHoverBg
                    },
                    '& .MuiDataGrid-cell:focus': {
                        outline: 'none'
                    }
                }}
                disableRowSelectionOnClick
            />
        </Paper>
    );
}