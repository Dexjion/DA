import React, { useState } from 'react';
import { ArtworkPreset } from '../utils/storeLogic';

interface YarnArtworkProps {
  preset: ArtworkPreset | 'hero_studio';
  customImageUrl?: string;
  alt: string;
  className?: string;
}

export const YarnArtwork: React.FC<YarnArtworkProps> = ({
  preset,
  customImageUrl,
  alt,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  if (customImageUrl && customImageUrl.trim().length > 0 && !imgError) {
    return (
      <div className={`relative overflow-hidden bg-[#FFF2F5] ${className}`}>
        <img
          src={customImageUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (preset === 'hero_studio') {
    return (
      <div className={`relative overflow-hidden bg-[#FFF2F5] ${className}`}>
        <img
          src="/assets/aistudio/B_a_e2d96620.jpg"
          alt={alt}
          className="w-full h-auto block object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden select-none bg-[#FFF4F6] ${className}`}
      role="img"
      aria-label={alt}
    >
      {preset === 'tote_waffle' && (
        <svg viewBox="0 0 480 360" className="w-full h-full object-cover">
          <defs>
            <pattern id="ginghamP1" width="24" height="24" patternUnits="userSpaceOnUse">
              <rect width="24" height="24" fill="#FFF7F8" />
              <rect width="12" height="24" fill="#FCE4EA" opacity="0.6" />
              <rect width="24" height="12" fill="#FCE4EA" opacity="0.6" />
            </pattern>
            <pattern id="waffleP1" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect width="16" height="16" fill="#FFFDF9" />
              <rect
                x="1.5"
                y="1.5"
                width="13"
                height="13"
                rx="3"
                fill="#F7ECDC"
                stroke="#E2CEB5"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="480" height="360" fill="url(#ginghamP1)" />
          {/* Soft pastel arch backdrop */}
          <circle cx="240" cy="210" r="145" fill="#FFFDFB" stroke="#F8C8D4" strokeWidth="2" strokeDasharray="6 4" />
          <ellipse cx="240" cy="318" rx="135" ry="20" fill="#F3D2DA" opacity="0.65" />
          {/* Braided Handles */}
          <path
            d="M185 112 C185 38, 295 38, 295 112"
            fill="none"
            stroke="#E5CFB4"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M185 112 C185 38, 295 38, 295 112"
            fill="none"
            stroke="#FFFDF9"
            strokeWidth="10"
            strokeDasharray="8 5"
            strokeLinecap="round"
          />
          {/* Tote Bag Body */}
          <rect
            x="140"
            y="102"
            width="200"
            height="205"
            rx="22"
            fill="url(#waffleP1)"
            stroke="#D6BFA3"
            strokeWidth="2.5"
          />
          {/* Cute Pink & Daisy Crochet Flowers on Tote (matching cover bag!) */}
          <g transform="translate(185, 155)">
            <circle cx="0" cy="-12" r="7" fill="#F48B98" />
            <circle cx="11" cy="-4" r="7" fill="#F48B98" />
            <circle cx="7" cy="9" r="7" fill="#F48B98" />
            <circle cx="-7" cy="9" r="7" fill="#F48B98" />
            <circle cx="-11" cy="-4" r="7" fill="#F48B98" />
            <circle cx="0" cy="0" r="6" fill="#F7C948" />
          </g>
          <g transform="translate(295, 155)">
            <circle cx="0" cy="-12" r="7" fill="#F48B98" />
            <circle cx="11" cy="-4" r="7" fill="#F48B98" />
            <circle cx="7" cy="9" r="7" fill="#F48B98" />
            <circle cx="-7" cy="9" r="7" fill="#F48B98" />
            <circle cx="-11" cy="-4" r="7" fill="#F48B98" />
            <circle cx="0" cy="0" r="6" fill="#F7C948" />
          </g>
          <g transform="translate(240, 225)">
            <circle cx="0" cy="-13" r="7.5" fill="#FFFDF9" stroke="#E5D5C3" strokeWidth="1" />
            <circle cx="12" cy="-4" r="7.5" fill="#FFFDF9" stroke="#E5D5C3" strokeWidth="1" />
            <circle cx="8" cy="10" r="7.5" fill="#FFFDF9" stroke="#E5D5C3" strokeWidth="1" />
            <circle cx="-8" cy="10" r="7.5" fill="#FFFDF9" stroke="#E5D5C3" strokeWidth="1" />
            <circle cx="-12" cy="-4" r="7.5" fill="#FFFDF9" stroke="#E5D5C3" strokeWidth="1" />
            <circle cx="0" cy="0" r="6.5" fill="#F5B82E" />
          </g>
        </svg>
      )}

      {preset === 'beret_sage' && (
        <svg viewBox="0 0 480 360" className="w-full h-full object-cover">
          <defs>
            <pattern id="ginghamP2" width="24" height="24" patternUnits="userSpaceOnUse">
              <rect width="24" height="24" fill="#FFF7F8" />
              <rect width="12" height="24" fill="#FCE4EA" opacity="0.55" />
              <rect width="24" height="12" fill="#FCE4EA" opacity="0.55" />
            </pattern>
            <pattern id="sageStitch" width="14" height="14" patternUnits="userSpaceOnUse">
              <rect width="14" height="14" fill="#8AA37B" />
              <path
                d="M2 3 Q7 10 12 3 M2 10 Q7 16 12 10"
                stroke="#6E875F"
                strokeWidth="1.5"
                fill="none"
              />
            </pattern>
          </defs>
          <rect width="480" height="360" fill="url(#ginghamP2)" />
          <circle cx="240" cy="195" r="142" fill="#FFFDFB" stroke="#F8C8D4" strokeWidth="2" strokeDasharray="6 4" />
          <ellipse cx="240" cy="282" rx="150" ry="24" fill="#F3D2DA" opacity="0.55" />
          {/* Folded Blush Scarf underneath */}
          <rect
            x="115"
            y="225"
            width="250"
            height="48"
            rx="18"
            fill="#FFE8EE"
            stroke="#F4B8C6"
            strokeWidth="2"
          />
          {/* Beret Crown */}
          <ellipse
            cx="240"
            cy="178"
            rx="125"
            ry="68"
            fill="url(#sageStitch)"
            stroke="#637A55"
            strokeWidth="2.5"
          />
          {/* Ribbed Brim */}
          <rect
            x="150"
            y="218"
            width="180"
            height="24"
            rx="8"
            fill="#738C64"
          />
          {/* White Daisy Accent on Brim */}
          <g transform="translate(290, 224)">
            <circle cx="0" cy="-9" r="5.5" fill="#FFFDF9" />
            <circle cx="9" cy="-3" r="5.5" fill="#FFFDF9" />
            <circle cx="5" cy="7" r="5.5" fill="#FFFDF9" />
            <circle cx="-5" cy="7" r="5.5" fill="#FFFDF9" />
            <circle cx="-9" cy="-3" r="5.5" fill="#FFFDF9" />
            <circle cx="0" cy="0" r="4.5" fill="#F5B82E" />
          </g>
          <path
            d="M236 110 Q242 92 250 107"
            stroke="#637A55"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )}

      {preset === 'tulip_charm' && (
        <svg viewBox="0 0 480 360" className="w-full h-full object-cover">
          <defs>
            <pattern id="ginghamP3" width="24" height="24" patternUnits="userSpaceOnUse">
              <rect width="24" height="24" fill="#FFF7F8" />
              <rect width="12" height="24" fill="#FCE4EA" opacity="0.6" />
              <rect width="24" height="12" fill="#FCE4EA" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="480" height="360" fill="url(#ginghamP3)" />
          <circle cx="240" cy="185" r="142" fill="#FFFDFB" stroke="#F8C8D4" strokeWidth="2" strokeDasharray="6 4" />
          <ellipse cx="240" cy="312" rx="115" ry="18" fill="#F3D2DA" opacity="0.6" />
          {/* Brass Ring & Clasp */}
          <circle
            cx="240"
            cy="68"
            r="22"
            fill="none"
            stroke="#D69E46"
            strokeWidth="6"
          />
          <rect x="233" y="88" width="14" height="18" rx="4" fill="#C28B35" />
          {/* Crochet Stems & Leaves */}
          <path
            d="M240 105 L185 215 M240 105 L240 230 M240 105 L295 215"
            stroke="#6D9458"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M240 155 Q195 140 175 170 Q205 185 240 155"
            fill="#83AB6C"
          />
          <path
            d="M240 155 Q285 140 305 170 Q275 185 240 155"
            fill="#83AB6C"
          />
          {/* Pink Ribbon Bow */}
          <path
            d="M210 145 Q240 162 270 145 Q256 174 240 156 Q224 174 210 145"
            fill="#F48B98"
            stroke="#E14B68"
            strokeWidth="1.5"
          />
          {/* Three Puffy Crochet Tulip Buds */}
          <g transform="translate(152, 200)">
            <path
              d="M8 22 C8 65, 58 65, 58 22 C58 6, 44 14, 33 0 C22 14, 8 6, 8 22 Z"
              fill="#F2798F"
              stroke="#D9536F"
              strokeWidth="2"
            />
          </g>
          <g transform="translate(207, 218)">
            <path
              d="M8 22 C8 65, 58 65, 58 22 C58 6, 44 14, 33 0 C22 14, 8 6, 8 22 Z"
              fill="#F8CE67"
              stroke="#DDA938"
              strokeWidth="2"
            />
          </g>
          <g transform="translate(262, 200)">
            <path
              d="M8 22 C8 65, 58 65, 58 22 C58 6, 44 14, 33 0 C22 14, 8 6, 8 22 Z"
              fill="#F69DAE"
              stroke="#E14B68"
              strokeWidth="2"
            />
          </g>
        </svg>
      )}

      {preset === 'collar_lace' && (
        <svg viewBox="0 0 480 360" className="w-full h-full object-cover">
          <defs>
            <pattern id="ginghamP4" width="24" height="24" patternUnits="userSpaceOnUse">
              <rect width="24" height="24" fill="#FFF7F8" />
              <rect width="12" height="24" fill="#FCE4EA" opacity="0.6" />
              <rect width="24" height="12" fill="#FCE4EA" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="480" height="360" fill="url(#ginghamP4)" />
          <circle cx="240" cy="190" r="142" fill="#FFFDFB" stroke="#F8C8D4" strokeWidth="2" strokeDasharray="6 4" />
          {/* Peter Pan Crochet Lace Collar */}
          <path
            d="M155 95 C105 135, 115 245, 225 258 L232 190 C180 180, 175 130, 205 105 Z"
            fill="#FFFDF9"
            stroke="#E8C9B5"
            strokeWidth="2.5"
          />
          <path
            d="M325 95 C375 135, 365 245, 255 258 L248 190 C300 180, 305 130, 275 105 Z"
            fill="#FFFDF9"
            stroke="#E8C9B5"
            strokeWidth="2.5"
          />
          {/* Lace Scallops & Ties */}
          <path
            d="M205 105 Q240 118 275 105"
            fill="none"
            stroke="#E14B68"
            strokeWidth="3"
          />
          {/* Matching Knitted Rose Hair Bow */}
          <g transform="translate(190, 265)">
            <path
              d="M10 15 Q50 32 90 15 L85 45 Q50 28 15 45 Z"
              fill="#F2798F"
              stroke="#E14B68"
              strokeWidth="1.5"
            />
            <rect x="42" y="21" width="16" height="18" rx="4" fill="#E14B68" />
            <circle cx="50" cy="30" r="4.5" fill="#FFFDF9" />
          </g>
        </svg>
      )}

      {preset === 'bucket_hat' && (
        <svg viewBox="0 0 480 360" className="w-full h-full object-cover">
          <defs>
            <pattern id="ginghamP5" width="24" height="24" patternUnits="userSpaceOnUse">
              <rect width="24" height="24" fill="#FFF7F8" />
              <rect width="12" height="24" fill="#FCE4EA" opacity="0.6" />
              <rect width="24" height="12" fill="#FCE4EA" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="480" height="360" fill="url(#ginghamP5)" />
          <circle cx="240" cy="190" r="142" fill="#FFFDFB" stroke="#F8C8D4" strokeWidth="2" strokeDasharray="6 4" />
          <ellipse cx="240" cy="295" rx="155" ry="22" fill="#F3D2DA" opacity="0.55" />
          {/* Bucket Hat Crown (Warm Cream Crochet like the cover hat!) */}
          <path
            d="M155 195 L172 105 Q240 85 308 105 L325 195 Z"
            fill="#F6E4C8"
            stroke="#D6B98E"
            strokeWidth="2.5"
          />
          {/* Wavy Brim */}
          <path
            d="M105 245 L155 192 Q240 205 325 192 L375 245 Q330 265 285 250 Q240 268 195 250 Q150 265 105 245 Z"
            fill="#EDD6B4"
            stroke="#CCA978"
            strokeWidth="2.5"
          />
          {/* Embroidered Crochet Daisies */}
          <g transform="translate(200, 150)">
            <circle cx="0" cy="0" r="12" fill="#FFFDF9" />
            <circle cx="0" cy="0" r="5" fill="#F5B82E" />
            <circle cx="42" cy="5" r="12" fill="#FFFDF9" />
            <circle cx="42" cy="5" r="5" fill="#F5B82E" />
            <circle cx="82" cy="-2" r="12" fill="#FFFDF9" />
            <circle cx="82" cy="-2" r="5" fill="#F5B82E" />
          </g>
        </svg>
      )}

      {preset === 'cardholder_daisy' && (
        <svg viewBox="0 0 480 360" className="w-full h-full object-cover">
          <defs>
            <pattern id="ginghamP6" width="24" height="24" patternUnits="userSpaceOnUse">
              <rect width="24" height="24" fill="#FFF7F8" />
              <rect width="12" height="24" fill="#FCE4EA" opacity="0.6" />
              <rect width="24" height="12" fill="#FCE4EA" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="480" height="360" fill="url(#ginghamP6)" />
          <circle cx="240" cy="190" r="142" fill="#FFFDFB" stroke="#F8C8D4" strokeWidth="2" strokeDasharray="6 4" />
          <ellipse cx="240" cy="302" rx="130" ry="20" fill="#F3D2DA" opacity="0.6" />
          {/* Knitted Pouch Body (Sage Green like cover pouch!) */}
          <rect
            x="130"
            y="95"
            width="220"
            height="185"
            rx="22"
            fill="#88A07A"
            stroke="#657D58"
            strokeWidth="2.5"
          />
          {/* Envelope Flap */}
          <path
            d="M132 105 L240 190 L348 105 Q348 95 335 95 L145 95 Q132 95 132 105 Z"
            fill="#9BB38C"
            stroke="#657D58"
            strokeWidth="2.5"
          />
          {/* Crochet Daisy Clasp */}
          <g transform="translate(240, 185)">
            <circle cx="0" cy="-16" r="9" fill="#FFFDF9" />
            <circle cx="15" cy="-5" r="9" fill="#FFFDF9" />
            <circle cx="10" cy="13" r="9" fill="#FFFDF9" />
            <circle cx="-10" cy="13" r="9" fill="#FFFDF9" />
            <circle cx="-15" cy="-5" r="9" fill="#FFFDF9" />
            <circle cx="0" cy="0" r="9" fill="#F5B82E" />
          </g>
        </svg>
      )}
    </div>
  );
};
