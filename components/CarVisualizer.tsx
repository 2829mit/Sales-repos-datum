
import React from 'react';
import { motion } from 'framer-motion';
import type { TankOption, AccessoryOption, DispensingUnitOption, SafetyUpgradeOption, IotOption } from '../types';
import { getVisualizerLayers } from '../utils/vehicleHelpers';

interface CarVisualizerProps {
  tank: TankOption['id'];
  mechanicalOptions?: AccessoryOption[];
  dispensingUnits?: DispensingUnitOption[];
  safetyUnits?: AccessoryOption[];
  safetyUpgrades: SafetyUpgradeOption[];
  decantation?: IotOption[];
  hasPlatform?: boolean;

  // Custom Product Props
  selectedProduct?: 'rfd-portable' | 'rfd-z';
  rfdZBase?: string;
  rfdZUpgrades?: string[];
}

const CarVisualizer: React.FC<CarVisualizerProps> = ({ 
  tank, 
  mechanicalOptions = [], 
  dispensingUnits = [], 
  safetyUnits = [], 
  safetyUpgrades,
  decantation = [],
  hasPlatform = false,

  selectedProduct = 'rfd-portable',
  rfdZBase = '',
  rfdZUpgrades = [] as string[],
}) => {
  const s3BaseUrl = 'https://drf-media-data.s3.ap-south-1.amazonaws.com/compressor_aws/ShortPixelOptimized/';

  const getRfdZLayers = () => {
    const images: { url: string; order: number }[] = [];
    
    // Bottom most image
    images.push({ url: 'https://i.postimg.cc/SKk5P9yG/fullll-datummm.png', order: 2 });

    if (rfdZBase === 'datum-2kl') {
      images.push({ url: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/RFD-Z/3-Fire-Screen-common%20(1).png', order: 3 });
      images.push({ url: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/RFD-Z/1-TANK-2kl%20(1).png', order: 4 });
    }

    if (rfdZUpgrades?.includes('fuel-monitoring')) {
      images.push({ url: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/RFD-Z/2-tank%20ratg-2kl%20(1).png', order: 6 });
      images.push({ url: 'https://i.postimg.cc/MpmcRSd7/app-ratg-(1).png', order: 21 });
    }

    if (rfdZUpgrades?.includes('safety-security')) {
      images.push({ url: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/RFD-Z/4-AFSS-common%20(1).png', order: 7 });
      images.push({ url: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/RFD-Z/8-Camera-common%20(1).png', order: 11 });
      images.push({ url: 'https://i.postimg.cc/rwMDHYjh/fire-bucket-sales-website.png', order: 1 });
      images.push({ url: 'https://i.postimg.cc/qMwWdN0S/manhole-assembly2.png', order: 4 });
      images.push({ url: 'https://i.postimg.cc/Njc95M79/app-afs-(1).png', order: 22 });
    }

    if (rfdZUpgrades?.includes('lm-stamping')) {
      images.push({ url: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/RFD-Z/6-Filteration-common%20(1).png', order: 9 });
      images.push({ url: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/RFD-Z/5-Dispenser-common%20(1).png', order: 8 });
      images.push({ url: 'https://i.postimg.cc/NFMsyKds/5-litre-jar-test.png', order: 23 });
    }

    if (rfdZUpgrades?.includes('secure-fueling')) {
      images.push({ url: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/RFD-Z/7-RFID-common%20(1).png', order: 10 });
      images.push({ url: 'https://i.postimg.cc/PJxXLCSf/RFID.png', order: 24 });
    }

    if (rfdZUpgrades?.includes('packing-forwarding')) {
      images.push({ url: 'https://i.postimg.cc/bY1Nj9ZJ/pakced-datum.png', order: 12 });
    }

    if (rfdZUpgrades?.includes('transportation')) {
      // No image for transportation
    }

    const sortedImages = images
      .sort((a, b) => a.order - b.order)
      .map(item => item.url);

    return sortedImages;
  };


  const layers = selectedProduct === 'rfd-z'
    ? getRfdZLayers()
    : getVisualizerLayers(
        tank, 
        mechanicalOptions, 
        dispensingUnits, 
        safetyUnits, 
        safetyUpgrades, 
        decantation,
        hasPlatform
      );

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-white overflow-hidden group">
      <div className="relative w-5/6 h-5/6 flex items-center justify-center">
        {layers.map((layerUrl, index) => {
          const isDatumDoor = layerUrl.includes('10-Datum%20open%20door');
          
          return (
            <motion.img
                key={`${layerUrl}-${index}`}
                src={layerUrl}
                alt={`Configuration Layer ${index}`}
                className="absolute inset-0 object-contain w-full h-full"
                style={{ zIndex: index * 10 }}
                initial={isDatumDoor ? { opacity: 0, scale: 0.8, x: 20 } : { opacity: 0 }}
                animate={isDatumDoor ? { opacity: 1, scale: 1, x: 0 } : { opacity: 1 }}
                transition={isDatumDoor ? { type: "spring", stiffness: 200, damping: 20, delay: 0.1 } : { duration: 0.3 }}
            />
          );
        })}
        {layers.length === 0 && (
             <p className="text-gray-400">Loading Configuration...</p>
        )}
      </div>
    </div>
  );
};

export default CarVisualizer;
