'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'

export default function ExploreScreenshotUpload({ supabase, uid, url, size, onUpload, onUploading }) {
  const [uploading, setUploading] = useState(false)

  // Function to handle the upload process
  const uploadScreenshot = async (event) => {
    try {
      setUploading(true)
      if (onUploading) onUploading(true)

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Could not get user session. Please try again.');
      }
      const user = session.user;

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]

      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}-explorescreenshot.${fileExt}`

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

      // Call the onUpload callback with the full public URL
      onUpload(publicUrlData.publicUrl + `?t=${new Date().getTime()}`)

    } catch (error) {
      // Check if the error object itself might contain more clues
      alert(`Error uploading image: ${error.message || 'Unknown error'}`)
    } finally {
      setUploading(false)
      if (onUploading) onUploading(false)
    }
  }

  return (
    <div>
      {url ? (
        <div className="flex justify-center items-center w-full mb-3"> 
            <Image
              width={size}
              height={size}
              src={url}
              alt="Explore Screenshot"
              className="screenshot image border border-dashed border-black"
              style={{ height: 'auto', width: size }} 
              onError={(e) => console.error("Image load error:", e.target.src)}
            />
        </div>
      ) : (
        <div className="flex justify-center items-center screenshot no-image w-full border border-dashed border-black mb-3" style={{ height: size, width: size }} > 
          <span className="text-sm text-black italic">No Scrollshot uploaded</span>
        </div>
      )}
      <div className="w-full mt-3">
        <label 
          htmlFor="screenshotUpload"
          className="w-full flex justify-center py-3 px-4 border border-dashed border-black text-black text-sm font-medium bg-transparent hover:bg-[#ffff00] focus:outline-none cursor-pointer"
        >
          {uploading ? 'Uploading ...' : 'upload scrollshot'}
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