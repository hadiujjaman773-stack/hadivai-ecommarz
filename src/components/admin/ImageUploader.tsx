"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Link as LinkIcon } from "lucide-react";
import { useNotification } from "./NotificationProvider";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  multiple?: false;
}

interface MultiImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  multiple: true;
}

type Props = ImageUploaderProps | MultiImageUploaderProps;

export function ImageUploader(props: Props) {
  const { label = "ইমেজ" } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const { success, error } = useNotification();

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "আপলোড ব্যর্থ");

      if (props.multiple) {
        props.onChange([...props.value, data.url]);
      } else {
        props.onChange(data.url);
      }
      success("ইমেজ আপলোড হয়েছে");
    } catch (err) {
      error(
        "আপলোড ব্যর্থ",
        err instanceof Error ? err.message : undefined
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        error("শুধু ইমেজ ফাইল গ্রহণযোগ্য");
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        error("ফাইল সর্বোচ্চ ১০MB");
        continue;
      }
      await uploadFile(file);
    }
  };

  const addUrl = () => {
    if (!urlInput.trim()) return;
    if (props.multiple) {
      props.onChange([...props.value, urlInput.trim()]);
    } else {
      props.onChange(urlInput.trim());
    }
    setUrlInput("");
    setShowUrlInput(false);
  };

  const removeAt = (index: number) => {
    if (props.multiple) {
      props.onChange(props.value.filter((_, i) => i !== index));
    } else {
      props.onChange("");
    }
  };

  const images = props.multiple
    ? props.value
    : props.value
      ? [props.value]
      : [];

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>

      {images.length > 0 && (
        <div className={`flex flex-wrap gap-3 mb-3 ${props.multiple ? "" : ""}`}>
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group"
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
                unoptimized
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? "আপলোড হচ্ছে..." : "ফাইল আপলোড"}
        </button>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          <LinkIcon className="w-4 h-4" />
          URL যোগ
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={props.multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {showUrlInput && (
        <div className="flex gap-2 mt-2">
          <input
            className="input-field flex-1"
            placeholder="https://..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <button
            type="button"
            onClick={addUrl}
            className="btn-primary px-4 py-2 text-sm"
          >
            যোগ
          </button>
        </div>
      )}
    </div>
  );
}
