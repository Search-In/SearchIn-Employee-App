import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import axios from "axios";
import { api } from "../api/api";

const deleteIconSrc = "https://cdn-icons-png.flaticon.com/512/1214/1214428.png"; // Remote Trash icon
const uploadImageSrc =
  "https://cdn-icons-png.flaticon.com/512/1828/1828919.png"; // Remote Upload Image icon
const uploadCloudSrc =
  "https://cdn-icons-png.flaticon.com/512/1828/1828919.png"; // Replace with a cloud upload icon URL

const ImageUpload = ({
  newProduct = {},
  setNewProduct,
  setImageFile,
  imagesSave,
  isEdit,
  onDelete = async () => {},
}) => {
  const [mainImage, setMainImage] = useState(imagesSave);

  useEffect(() => {
    setMainImage(imagesSave);
  }, [imagesSave]);

  const handleDeleteImage = async (index) => {
    await onDelete();
    setMainImage(null);
    setImageFile("noimage");
  };

  const [image1, setImage1] = useState([]);

  const handleImageupload = async (event, index, main) => {
    if (main) {
      const file = event.target.files[0];
      const file_url = await handleImageUpload({
        images: [file],
        setImages: setImage1,
        onError: () => toast.error("Image upload failed"),
      });
      setImageFile(file_url);
      setMainImage(file_url);
    }
  };

  const handleInput = (key, value) => {
    setNewProduct({
      ...newProduct,
      [key]: value,
    });
  };

  return (
    <div className="flex justify-center p-2">
      <input
        type="file"
        id={`image-upload`}
        accept="image/*"
        style={{ display: "none" }}
        onChange={(event) => handleImageupload(event, 0, true)}
      />
      {mainImage && (
        <div className="img-container">
          <div className="deleteImage flex justify-end">
            <button className="delete-btn" onClick={() => handleDeleteImage(0)}>
              <img src={deleteIconSrc} alt="Delete" width={20} height={20} />
              {/* Remote Trash icon */}
            </button>
          </div>
          <img
            src={
              typeof mainImage !== "string"
                ? URL.createObjectURL(mainImage)
                : mainImage
            }
            alt={`Preview `}
            className="object-contain max-h-36"
          />
        </div>
      )}
      {!mainImage && (
        <label htmlFor="image-upload">
          <div className="flex flex-col gap-2 justify-center items-center">
            <img
              src={uploadImageSrc}
              alt="Upload Image"
              // width={48}
              // height={48}
              className="upload-image "
            />{" "}
            {/* Remote Upload Image icon */}
            <div className="upload-cloud-div">
              {/* <img
                src={uploadCloudSrc} // Cloud upload icon URL
                alt="Upload Cloud"
                width={48}
                height={48}
                className="upload-cloud max-w-sm"
              /> */}
              <p className="upload-text">Upload Image</p>
            </div>
            <p className="upload-desc">
              File Format <span>jpeg, png</span>
            </p>
            <p>
              <span>Aspect Ratio (1:1)</span>
            </p>
          </div>
        </label>
      )}
    </div>
  );
};

export default ImageUpload;

export async function handleImageUpload({ images, setImages, onError }) {
  const length = images?.filter((item) => item != null)?.length;
  let compiledUrl = "";

  //   console.log("handleImageUpload");

  for (let i = 0; i < length; i++) {
    const file = images[i];

    if (!file) continue;
    // console.log("handleImageUpload file present");

    if (typeof file === "string") {
      if (i === length - 1) {
        compiledUrl += file;
      } else {
        compiledUrl += file + ", ";
      }

      console.log(compiledUrl);
      continue;
    }

    const fileName = file.name;

    // console.log("handleImageUpload", fileName);

    try {
      // Get presigned URL for upload
      const response = await axios.get(`${api.server}/get-upload-url`, {
        params: { fileName, fileType: file.type },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      //   console.log("handleImageUpload", response);

      const uploadURL = response.data.uploadURL;
      const downloadURL = response.data.downloadURL.split("?")[0];

      console.log(uploadURL, downloadURL);

      // Upload the image to S3 using presigned URL
      await axios.put(uploadURL, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      //   const imageUrl = uploadURL.split("?")[0]; // Extract the URL without query parameters

      if (i === length - 1) {
        compiledUrl += downloadURL;
      } else {
        compiledUrl += downloadURL + ", ";
      }

      console.log(compiledUrl);

      const newImages = [...images];
      newImages[i] = downloadURL;
      setImages(newImages);
    } catch (error) {
      console.log("Error uploading image:", error);
      toast.error(`Error uploading image: ${JSON.stringify(error?.data)}`);
      if (onError) onError();
    }
  }

  return compiledUrl;
}
