import { cn } from '@/lib/utils';
import { ImagePlusIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useI18nContext } from '../locale-context';
import { useFieldArray } from 'react-hook-form';
import { ImageItem, ProductFormData } from '@/types/product';

interface SortableItemProps {
  image: ImageItem;
  index: number;
  onRemove: (id: number) => void;
}
const SortableItem = ({ index, image, onRemove }: SortableItemProps) => (
  <div className="relative">
    <img
      src={image.src}
      alt=""
      className="w-full h-20 object-cover rounded-md"
    />
    <button
      className="absolute inset-1 bg-gray-200 hover:bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-gray-700 text-xs"
      onClick={() => onRemove(index)}
    >
      &times;
    </button>
  </div>
);

interface SortableListProps {
  images: ImageItem[];
  onRemove: (id: number) => void;
}

const SortableList = ({ images, onRemove }: SortableListProps) => {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {images.map((image, index) => (
        <SortableItem
          key={index}
          index={index}
          image={image}
          onRemove={onRemove}
        />
      ))}
      {images.length < 5 && (
        <div className="border-2 border-gray-300 border-dashed rounded-md h-20 flex items-center justify-center text-gray-400">
          <ImagePlusIcon />
        </div>
      )}
    </div>
  )
};

interface ImageGalleryUploadProps {
  control: any;
}

const ImageGalleryUpload = ({ control }: ImageGalleryUploadProps) => {
  const { fields, append, remove } = useFieldArray<ProductFormData, "images", "id">({
    control,
    name: "images",
    keyName: "id",
  });

  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { t } = useI18nContext();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const newImages = files.map<{ src: string; file: File }>((file) => ({
      src: URL.createObjectURL(file),
      file,
    }));

    append(newImages);

    if (hiddenFileInput.current) {
      hiddenFileInput.current.value = "";
    }
  };

  const handleRemoveImage = (id: number) => {
    remove(id);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragEnter = () => {
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  // const onAddImages = () => {
  //   if (hiddenFileInput.current) {
  //     hiddenFileInput.current.click();
  //   }
  // };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed rounded-md p-6 text-center cursor-pointer",
          dragging ? "border-blue-500" : "border-gray-300"
        )}
      >
        <label htmlFor="imageUpload" className="block text-gray-600 text-sm">
          {dragging ?
            'Drop your images here!' :
            (
              <span>{t("galleryUpload.dragAndDrop")} <span className="text-blue-500 hover:underline">{t("galleryUpload.clickToUpload")}</span></span>
            )
          }
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          id="imageUpload"
          ref={hiddenFileInput}
        />
        {fields.length > 0 && (
          <SortableList
            images={fields}
            onRemove={handleRemoveImage}
          // onSortEnd={onSortEnd}
          // axis="xy"
          />
        )}
        <p className="text-gray-500 text-xs mt-2">{t("galleryUpload.recommededToUpload")}</p>
      </div>
    </div>
  );
};

export default ImageGalleryUpload;
