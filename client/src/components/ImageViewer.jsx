import {
  Dialog,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";

export function ImageViewer({ image, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDownload = async () => {
    try {
      const response = await fetch(image, { mode: "cors" });
      if (!response.ok) throw new Error("Erro ao baixar imagem");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = image.split("/").pop()
        ? image.split("/").pop()
        : "image.jpg";

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog
      open={!!image}
      onClose={onClose}
      maxWidth="lg"
      fullWidth={isMobile ? true : false}
    >
      <Box display="flex" justifyContent="center">
        <IconButton
          onClick={handleDownload}
          color="primary"
          sx={{
            position: "absolute",
            top: 10,
            right: 60,
          }}
        >
          <DownloadIcon />
        </IconButton>
        <IconButton
          onClick={onClose}
          color="primary"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box
          component="img"
          src={image}
          width="100%"
          minHeight={isMobile ? null : 600}
        />
      </Box>
    </Dialog>
  );
}
