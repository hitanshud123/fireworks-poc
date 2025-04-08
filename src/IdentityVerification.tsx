import React, { useState } from 'react';
import axios from 'axios';
import { prompt } from './message.tsx';
import { Box, Button, Typography, Card, Stack, IconButton, Container, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ReplayIcon from '@mui/icons-material/Replay';

interface IdentityInfo {
  document_type: string;
  document_number: string;
  full_name: string;
  date_of_birth: string;
  expiry_date: string;
}

const IdentityInfoJSONSchema = () => ({
  type: "object",
  properties: {
    document_type: { type: "string" },
    document_number: { type: "string" },
    full_name: { type: "string" },
    date_of_birth: { type: "string" },
    expiry_date: { type: "string" },
  },
  required: ["document_type", "document_number", "full_name", "date_of_birth", "expiry_date"]
});

const IdentityVerification: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [identityData, setIdentityData] = useState<IdentityInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setIdentityData(null);
      setError('');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
      setIdentityData(null);
      setError('');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const encodeImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const imageBase64 = await encodeImageToBase64(file);
      const fileType = file.type;

      const payload = {
        model: "accounts/fireworks/models/phi-3-vision-128k-instruct",
        response_format: { type: "json_object", schema: IdentityInfoJSONSchema() },
        messages: [{
          "role": "user",
          "content": [{
            "type": "text",
            "text": prompt,
          }, {
            "type": "image_url",
            "image_url": {
              "url": `data:${fileType};base64,${imageBase64}`
            },
          }],
        }],
      };

      const response = await axios.post('/.netlify/functions/extract', { payload });
      console.log(response.data.choices[0].message.content);
      const responseData: IdentityInfo = JSON.parse(response.data.choices[0].message.content);
      setIdentityData(responseData);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to process the document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ paddingTop: 5, paddingBottom: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Typography variant="h4">Identity Verification</Typography>
      <Card sx={{ padding: 2, width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box onDragOver={handleDragOver} onDrop={handleDrop} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, border: '1px dashed #9BA3AF', padding: 2, borderRadius: 2 }}>
          <CloudUploadIcon fontSize="large" sx={{ color: '#9BA3AF' }} />
          <Typography variant="body1">Drag and drop your document here</Typography>
          <Typography variant="body2" sx={{ color: '#9BA3AF' }}>or</Typography>
          <Button variant="contained" sx={{ backgroundColor: 'black', mt: 1 }} onClick={() => document.querySelector('input[type="file"]').click()}>
            Select File
          </Button>
          <input type="file" accept=".png, .jpg, .jpeg, .gif, .bmp, .tiff, .ppm" onChange={handleFileChange} style={{ display: 'none' }} />
        </Box>
        {file &&
          <Stack direction="row" mt={2} display="flex" justifyContent="space-between" alignItems="center" sx={{ backgroundColor: '#F3F4F6', padding: 1, borderRadius: 1 }} spacing={1}>
            <Typography variant="body1">Selected File: {file.name}</Typography>
            <Button variant="contained" sx={{ backgroundColor: 'black', mt: 1 }} onClick={handleUpload} disabled={loading}>
              Verify
            </Button>
          </Stack>}
      </Card>

      {(identityData || error || loading) &&
        <Card sx={{ padding: 2, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
          <Stack direction="row" display="flex">
            <Typography variant="h6">Extracted Data</Typography>
            <IconButton onClick={handleUpload} disabled={loading}>
              <ReplayIcon fontSize="small" />
            </IconButton>
          </Stack>
          {loading && <CircularProgress sx={{ color: 'black' }} />}
          {!loading && error && <Typography variant="body1" sx={{ color: 'red' }}>{error}</Typography>}
          {!loading && identityData && !error && (
            <table style={{ width: 'auto', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td><strong>Document Type:</strong></td>
                  <td>{identityData.document_type}</td>
                </tr>
                <tr>
                  <td><strong>Document Number:</strong></td>
                  <td>{identityData.document_number}</td>
                </tr>
                <tr>
                  <td><strong>Full Name:</strong></td>
                  <td>{identityData.full_name}</td>
                </tr>
                <tr>
                  <td><strong>Date of Birth:</strong></td>
                  <td>{identityData.date_of_birth}</td>
                </tr>
                <tr>
                  <td><strong>Expiry Date:</strong></td>
                  <td>{identityData.expiry_date}</td>
                </tr>
              </tbody>
            </table>
          )}
        </Card>
      }
    </Container>
  );
};

export default IdentityVerification; 