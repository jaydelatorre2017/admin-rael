


import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useNavigate, Navigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import CloudCircleIcon from '@mui/icons-material/CloudCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import { isTokenValid, decodeToken } from "../utils/tokenUtils"; // import utility
import EditCalendarIcon from '@mui/icons-material/EditCalendar';

import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import useSwalTheme from '../utils/useSwalTheme';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout, ThemeSwitcher } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
// Import Pages
import Home from './Home';
import RequestPage from './Registered_Participants';
import GeneratePage from './Id_Generator';
import ResidentList from './EventList';
import AddResident from './AddEvents';
import RequestLogs from './Requested_Certificate_logs';
import AdminControl from './admin';
import NotAuthorized from './NotAuthorized';







const NAVIGATION = [
  { kind: 'header', title: 'Main items' },
  { segment: '', title: 'Dashboard', icon: <DashboardIcon /> },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Participants',
  },
  { segment: 'request', title: 'Registered Participants', icon: <ManageAccountsIcon /> },
  {
    segment: 'generate', title: 'Generate Participants ID', icon: <DocumentScannerIcon />,
  },
  {
    kind: 'divider',
  },
  { segment: 'residents', title: 'Events Management', icon: <EventIcon   /> },
  { segment: 'add-resident', title: 'Events Type Editor', icon: <EditCalendarIcon /> },
  {
    kind: 'divider',
  },
  { segment: 'logs', title: 'Attendace Logs', icon: <ManageHistoryIcon /> },
  {
    kind: 'divider',
  },
  { segment: 'admin', title: 'Admin Control', icon: <AdminPanelSettingsIcon /> },
];

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});
 
function DemoPageContent({ pathname }) {
  const token = localStorage.getItem("authToken");
  const isValid = token && isTokenValid(token);
  const decodeTokens = token && decodeToken(token);
  const role = decodeTokens.role;
  const bulk_ops = decodeTokens.can_bulk_operations;


  if (!isValid) {
    return <Navigate to="/" />;
  }

  if (pathname === '/admin') {
    if (role === "Super Admin") {
      return <AdminControl />;
    } else {

      return <NotAuthorized />;
    }
  }
  if (pathname === '/add-resident') {
    if (bulk_ops === true) {
      return <AddResident />;
    } else {

      return <NotAuthorized />;
    }
  }

  switch (pathname) {
    case '/':
      return <Home />;
    case '/request':
      return <RequestPage />;
    case '/generate':
      return <GeneratePage />;
    case '/residents':
      return <ResidentList />;
    case '/logs':
      return <RequestLogs />;
    default:
      return <Home />;
  }
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};
// Component for toolbar actions, including status display and sign-out
function ToolbarActionsSearch() {
  // Initialize SweetAlert2 instance with custom theme
  const SwalInstance = useSwalTheme();
  // Initialize navigate function for routing
  const navigate = useNavigate();
 
 

  // Handle sign-out action
  const handleSignOut = () => {
    SwalInstance.fire({
      title: "Are you sure?",
      text: "You will be signed out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, sign out!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Remove authentication token
        localStorage.removeItem("authToken");
        // Navigate to login page
        navigate("/", { replace: true });

        // Prevent back navigation
        setTimeout(() => {
          window.history.pushState(null, null, window.location.href);
          window.onpopstate = () => {
            window.history.pushState(null, null, window.location.href);
          };
        }, 0);
      }
    });
  };

  


  
  // Render toolbar actions
  return (
    <Stack direction="row" alignItems="center" spacing={1}>


      {/* Sign-out button with tooltip */}
      <Tooltip title="Sign Out" enterDelay={1000}>
        <div>
          <IconButton aria-label="log out" onClick={handleSignOut}>
            <PowerSettingsNewIcon />
          </IconButton>
        </div>
      </Tooltip>

      

    
      <ThemeSwitcher />
    </Stack>
  );
}

// Component for custom app title in the dashboard
function CustomAppTitle() {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <CloudCircleIcon fontSize="large" color="primary" />
      <Typography variant="h6">RAEL ADMIN</Typography>
    </Stack>
  );
}

// Component for sidebar footer
function SidebarFooter({ mini }) {
  return (
    <Typography variant="caption" sx={{ m: 1 }}>
      {/* Conditional text based on sidebar state */}
      {mini ? '© Wise One' : `©  Made with love by Wise One`}
    </Typography>
  );
}

// PropTypes for SidebarFooter component
SidebarFooter.propTypes = {
  mini: PropTypes.bool.isRequired,
};

// Main DashboardLayoutSlots component
function DashboardLayoutSlots(props) {
  // Destructure window prop for demo purposes
  const { window } = props;
  // Initialize demo router with default path
  const router = useDemoRouter('/');
  // Define demo window for testing
  const demoWindow = window !== undefined ? window() : undefined;

  // Render the dashboard layout
  return (
    <AppProvider
      navigation={NAVIGATION} // Pass navigation structure
      router={router} // Pass router for navigation
      theme={demoTheme} // Pass custom theme
      window={demoWindow} // Pass demo window
    >
      <DashboardLayout
        defaultSidebarCollapsed // Start with collapsed sidebar
        slots={{
          appTitle: CustomAppTitle, // Custom app title component
          toolbarActions: ToolbarActionsSearch, // Toolbar actions component
          sidebarFooter: SidebarFooter, // Sidebar footer component
        }}
      >
        {/* Render page content based on pathname */}
        <DemoPageContent pathname={router.pathname} />
      </DashboardLayout>
    </AppProvider>
  );
}

// PropTypes for DashboardLayoutSlots component
DashboardLayoutSlots.propTypes = {
  window: PropTypes.func,
};

// Export the component as default
export default DashboardLayoutSlots;
