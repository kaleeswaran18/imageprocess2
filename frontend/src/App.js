import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for toast notifications
import './App.css'; // Import the CSS file

function CardUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedData, setExtractedData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const { data } = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Ensure the content type is set correctly
        },
      });
      console.log(data.data, "data");
      setExtractedData(data.data); // Populate text fields with extracted data

      // Show success toast notification
      toast.success('File uploaded and data extracted successfully!');

    } catch (error) {
      console.error(error);
      toast.error('Error processing the image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-upload-container">
      <h1>Upload Business Card</h1>

      {/* File input field */}
      <input type="file" id="file" onChange={handleFileChange} accept="image/*" />
      <label htmlFor="file">Choose Image</label>

      {/* Image Preview */}
      {preview && (
        <div className="preview-container">
          <img src={preview} alt="Preview" />
        </div>
      )}

      {/* Upload Button */}
      <button onClick={handleUpload}>Upload and Process</button>

      {loading && <p>Processing...</p>}

      {/* Form with extracted data */}
      <form>
        <input placeholder="Name" value={extractedData.name || ''} readOnly />
        <input placeholder="Job Title" value={extractedData.jobTitle || ''} readOnly />
        <input placeholder="Company Name" value={extractedData.website || ''} readOnly />
        <input placeholder="Email Address" value={extractedData.email || ''} readOnly />
        <input placeholder="Phone Number" value={extractedData.phone || ''} readOnly />
        <input placeholder="Address" value={extractedData.address || ''} readOnly />
      </form>

      {/* Toast Container for notifications */}
      <ToastContainer />
    </div>
  );
}

export default CardUpload;
