'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

export default function ExploreScreenshotUpload({ uid, url, size, onUpload }) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)

  // Function to handle the upload process
  const uploadScreenshot = async (event) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileName = file.name.toLowerCase()

      if (!fileName.includes("screenshot")) {
        alert("Warning: The selected file name doesn't seem to be a screenshot. Please ensure you upload the correct file.")
        setUploading(false)
        event.target.value = null
        return
      }

      const fileExt = file.name.split('.').pop()
      const filePath = `${uid}-explorescreenshot.${fileExt}`

      // Upload to the 'explore_screenshots' bucket
      const { error: uploadError } = await supabase.storage
        .from('explore_screenshots')
        .upload(filePath, file, { upsert: true }) 

      if (uploadError) {
        throw uploadError
      }

      // Get the Public URL
      const { data: publicUrlData } = supabase.storage
        .from('explore_screenshots')
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
          console.error("Could not get public URL for path:", filePath);
          throw new Error("Upload succeeded but could not get public URL."); // This might be where the StorageUnknownError happens
      }

      console.log("Got public URL:", publicUrlData.publicUrl);
      // Call the onUpload callback with the full public URL
      onUpload(publicUrlData.publicUrl)

    } catch (error) {
      // Check if the error object itself might contain more clues
      console.error("Upload/Get URL Error Object:", error); 
      alert(`Error uploading screenshot: ${error.message || 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {url ? (
        <Image
          width={size}
          height={size} 
          src={url}
          alt="Explore Screenshot"
          className="screenshot image" 
          style={{ height: 'auto', width: size }} 
          onError={(e) => console.error("Image load error:", e.target.src)}
        />
      ) : (
        <div className="screenshot no-image" style={{ height: size, width: size, border: '1px dashed gray' }} > 
          <span>No Screenshot</span>
        </div>
      )}
      <div style={{ width: size, marginTop: '10px' }}>
        <label className="button primary block" htmlFor="screenshotUpload">
          {uploading ? 'Uploading ...' : 'Upload Screenshot'}
        </label>
        <input
          style={{
            visibility: 'hidden',
            position: 'absolute',
          }}
          type="file"
          id="screenshotUpload"
          accept="image/*"
          onChange={uploadScreenshot}
          disabled={uploading}
        />
      </div>
    </div>
  )
} 