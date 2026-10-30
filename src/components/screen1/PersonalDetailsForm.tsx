import React, { useRef } from 'react';
import { PersonalDetails } from '../../types/resume';
import { User, Mail, Phone, MapPin, Globe, Upload, Trash2, Camera, ShieldCheck } from 'lucide-react';
import { LinkedInIcon } from '../common/Icons';

interface PersonalDetailsFormProps {
  personal: PersonalDetails;
  onChange: (updated: PersonalDetails) => void;
}

export const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  personal,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = (field: keyof PersonalDetails, value: any) => {
    onChange({
      ...personal,
      [field]: value,
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. Please choose a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        handleFieldChange('photoUrl', event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    handleFieldChange('photoUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Photo Uploader Card */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row items-center gap-5">
        <div className="relative group">
          {personal.photoUrl ? (
            <img
              src={personal.photoUrl}
              alt="Profile preview"
              className={`object-cover border-2 border-indigo-500 shadow-sm ${
                personal.photoShape === 'circle' ? 'rounded-full' :
                personal.photoShape === 'square' ? 'rounded-none' : 'rounded-2xl'
              }`}
              style={{ width: `${personal.photoSize || 85}px`, height: `${personal.photoSize || 85}px` }}
            />
          ) : (
            <div 
              className={`flex items-center justify-center bg-slate-200 text-slate-400 border border-dashed border-slate-300 ${
                personal.photoShape === 'circle' ? 'rounded-full' :
                personal.photoShape === 'square' ? 'rounded-none' : 'rounded-2xl'
              }`}
              style={{ width: `${personal.photoSize || 85}px`, height: `${personal.photoSize || 85}px` }}
            >
              <Camera className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
              id="photo-upload-input"
            />
            <label
              htmlFor="photo-upload-input"
              className="px-3.5 py-1.5 bg-white border border-slate-300 hover:border-indigo-500 hover:text-indigo-600 rounded-lg text-xs font-semibold text-slate-700 shadow-sm cursor-pointer transition inline-flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              {personal.photoUrl ? 'Change Photo' : 'Upload Profile Photo'}
            </label>

            {personal.photoUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            )}
            <span className="text-[11px] text-slate-400 italic block sm:inline">Photo is always optional</span>
          </div>

          {personal.photoUrl && (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Shape:</span>
                {(['circle', 'rounded', 'square'] as const).map(shape => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => handleFieldChange('photoShape', shape)}
                    className={`px-2 py-0.5 rounded capitalize text-[11px] font-medium border ${
                      personal.photoShape === shape
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Size:</span>
                <input
                  type="range"
                  min="65"
                  max="120"
                  value={personal.photoSize || 85}
                  onChange={(e) => handleFieldChange('photoSize', Number(e.target.value))}
                  className="w-20 accent-indigo-600"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Full Name <span className="text-indigo-600 font-normal">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={personal.fullName}
              onChange={(e) => handleFieldChange('fullName', e.target.value)}
              placeholder="e.g. Dr. Alex Morgan"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              required
            />
          </div>
        </div>

        {/* Professional Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Professional Title <span className="text-indigo-600 font-normal">*</span>
          </label>
          <input
            type="text"
            value={personal.professionalTitle}
            onChange={(e) => handleFieldChange('professionalTitle', e.target.value)}
            placeholder="e.g. Senior Software Architect / Attending Physician"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Email Address <span className="text-indigo-600 font-normal">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              value={personal.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              placeholder="e.g. alex.morgan@email.com"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="tel"
              value={personal.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              placeholder="e.g. +1 (555) 234-5678"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Location
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={personal.location}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              placeholder="e.g. San Francisco, CA or London, UK"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            LinkedIn Profile
          </label>
          <div className="relative">
            <LinkedInIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={personal.linkedin}
              onChange={(e) => handleFieldChange('linkedin', e.target.value)}
              placeholder="e.g. linkedin.com/in/alexmorgan"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Portfolio */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Portfolio / GitHub
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={personal.portfolio}
              onChange={(e) => handleFieldChange('portfolio', e.target.value)}
              placeholder="e.g. alexmorgan.dev or github.com/alexmorgan"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Personal Website */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Website / Blog
          </label>
          <input
            type="text"
            value={personal.website}
            onChange={(e) => handleFieldChange('website', e.target.value)}
            placeholder="e.g. blog.alexmorgan.com"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>
      </div>
    </div>
  );
};
