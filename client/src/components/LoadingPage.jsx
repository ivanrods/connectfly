import { Box, LinearProgress, Typography } from "@mui/material";
import ForumIcon from "@mui/icons-material/Forum";

const LoadingPage = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      minHeight="100vh"
      padding={2}
    >
      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
        <ForumIcon fontSize="large" color="primary" />
        <Typography variant="h5" fontWeight="bold" color="primay">
          ConnectFly
        </Typography>
      </Box>

      <Box width="100%" maxWidth="sm" mt={2}>
        <LinearProgress />
      </Box>
    </Box>
  );
};

export default LoadingPage;
