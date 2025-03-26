import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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
    <div className="flex justify-center p-2 h-full">
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
          />
        </div>
      )}
      {!mainImage && (
        <label htmlFor="image-upload">
          <div className="flex flex-col gap-2 justify-center items-center">
            <img
              src={uploadImageSrc}
              alt="Upload Image"
              width={48}
              height={48}
              className="upload-image"
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
