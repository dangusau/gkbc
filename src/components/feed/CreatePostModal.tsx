import React, { useState, useRef } from 'react';
import { X, ImageIcon, Video, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { feedService } from '../../services/supabase/feed';
import toast from 'react-hot-toast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const { userProfile } = useAuth();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles].slice(0, 10));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) {
      toast.error('Please add content or media');
      return;
    }
    if (!userProfile) {
      toast.error('Please login to post');
      return;
    }

    setIsPosting(true);
    try {
      // Upload files
      const mediaUrls: string[] = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `posts/${userProfile.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(filePath, file);
        if (uploadError) throw new Error(`Upload failed: ${file.name}`);

        const { data: urlData } = supabase.storage.from('post-media').getPublicUrl(filePath);
        mediaUrls.push(urlData.publicUrl);
      }

      const mediaType = files.length === 0
        ? 'text'
        : files.length === 1
        ? (files[0].type.startsWith('video/') ? 'video' : 'image')
        : 'gallery';

      const tags = content.match(/#\w+/g)?.map(tag => tag.substring(1)) || [];

      await feedService.createPost(
        userProfile.id,
        content.trim(),
        mediaUrls,
        mediaType as any,
        tags
      );

      toast.success('Post created');
      setContent('');
      setFiles([]);
      onPostCreated?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-xl max-h-[90vh] overflow-hidden border-t border-green-200 shadow">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Create Post</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {files.length > 0 && (
            <div className="mb-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {files.map((file, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-300">
                    {file.type.startsWith('video/') ? (
                      <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                    ) : (
                      <img src={URL.createObjectURL(file)} alt={`Preview ${idx + 1}`} className="w-full h-full object-contain bg-gray-100" />
                    )}
                    <button
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black/90"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-xs"
            maxLength={2000}
          />
          <div className="text-right text-xs text-gray-500 mt-1.5">{content.length}/2000</div>

          <div className="flex items-center gap-2 mt-4">
            <label className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all cursor-pointer border border-green-200">
                <ImageIcon size={20} className="text-green-600" />
                <span className="text-xs font-medium text-green-700">Photo/Video</span>
              </div>
            </label>
            <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all border border-green-200">
              <MapPin size={20} className="text-green-600" />
              <span className="text-xs font-medium text-green-700">Location</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleSubmit}
            disabled={isPosting || (!content.trim() && files.length === 0)}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-green-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-green-700 disabled:opacity-50"
          >
            {isPosting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Posting...</span>
              </div>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};