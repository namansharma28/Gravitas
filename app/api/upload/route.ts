import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cloudinary } from '@/lib/cloudinary';
import sharp from 'sharp';

// Image type configurations with optimized settings
const IMAGE_CONFIGS = {
  avatar: {
    width: 400,
    height: 400,
    quality: 80,
    format: 'webp',
    compression: 'high',
  },
  banner: {
    width: 1920,
    height: 1080,
    quality: 75,
    format: 'webp',
    compression: 'high',
  },
  event: {
    width: 1200,
    height: 675,
    quality: 75,
    format: 'webp',
    compression: 'high',
  },
  thumbnail: {
    width: 400,
    height: 225,
    quality: 70,
    format: 'webp',
    compression: 'high',
  },
  default: {
    width: 1920,
    quality: 75,
    format: 'webp',
    compression: 'medium',
  },
};

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = (formData.get('type') as string) || 'default';
    const generateThumbnail = formData.get('thumbnail') === 'true';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB` 
      }, { status: 400 });
    }

    // Get config for image type
    const config = IMAGE_CONFIGS[type as keyof typeof IMAGE_CONFIGS] || IMAGE_CONFIGS.default;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);
    
    // Client-side compression using Sharp for better optimization
    const compressionStart = Date.now();
    try {
      let sharpInstance = sharp(buffer);
      
      // Get image metadata
      const metadata = await sharpInstance.metadata();
      
      // Resize if needed
      if (config.width && 'height' in config && config.height) {
        sharpInstance = sharpInstance.resize(config.width, config.height, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      } else if (config.width) {
        sharpInstance = sharpInstance.resize(config.width, null, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }
      
      // Convert to WebP with optimized settings
      if (config.format === 'webp') {
        sharpInstance = sharpInstance.webp({
          quality: config.quality,
          effort: 6, // Higher effort = better compression (0-6)
          smartSubsample: true,
        });
      } else if (config.format === 'jpeg' || metadata.format === 'jpeg') {
        sharpInstance = sharpInstance.jpeg({
          quality: config.quality,
          progressive: true,
          mozjpeg: true,
        });
      } else if (config.format === 'png' || metadata.format === 'png') {
        sharpInstance = sharpInstance.png({
          quality: config.quality,
          compressionLevel: 9,
          progressive: true,
        });
      }
      
      // Apply compression
      buffer = await sharpInstance.toBuffer();
      
      const compressionTime = Date.now() - compressionStart;
      const compressionRatio = ((1 - buffer.length / bytes.byteLength) * 100).toFixed(1);
      console.log(`✅ Image compressed: ${compressionRatio}% reduction in ${compressionTime}ms`);
      
    } catch (compressionError) {
      console.warn('Sharp compression failed, using original:', compressionError);
      // Fall back to original buffer if compression fails
    }

    // Convert to base64 for Cloudinary upload
    const base64String = buffer.toString('base64');
    const dataURI = `data:image/${config.format};base64,${base64String}`;

    // Upload to Cloudinary with optimization
    const uploadOptions: any = {
      folder: 'gravitas',
      resource_type: 'image',
      quality: 'auto:good', // Cloudinary auto quality
      fetch_format: 'auto', // Auto format selection
      flags: ['progressive', 'lossy'], // Progressive loading and lossy compression
      transformation: [],
    };

    // Add responsive breakpoints for automatic responsive images
    if (type === 'event' || type === 'banner') {
      uploadOptions.responsive_breakpoints = [
        {
          create_derived: true,
          bytes_step: 20000,
          min_width: 320,
          max_width: config.width || 1920,
          max_images: 5,
        },
      ];
    }

    const uploadStart = Date.now();
    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);
    const uploadTime = Date.now() - uploadStart;
    
    console.log(`☁️ Cloudinary upload completed in ${uploadTime}ms`);

    // Generate thumbnail if requested
    let thumbnailUrl = null;
    if (generateThumbnail && (type === 'event' || type === 'banner')) {
      const thumbConfig = IMAGE_CONFIGS.thumbnail;
      thumbnailUrl = cloudinary.url(result.public_id, {
        width: thumbConfig.width,
        height: thumbConfig.height,
        crop: 'fill',
        quality: thumbConfig.quality,
        format: thumbConfig.format,
        fetch_format: 'auto',
      });
    }

    const totalTime = Date.now() - startTime;
    console.log(`⏱️ Total upload time: ${totalTime}ms`);

    // Return optimized URLs and metadata
    return NextResponse.json({
      url: result.secure_url,
      thumbnailUrl,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      originalBytes: bytes.byteLength,
      compressionRatio: ((1 - result.bytes / bytes.byteLength) * 100).toFixed(1) + '%',
      responsive_breakpoints: result.responsive_breakpoints,
    }, {
      headers: {
        'X-Upload-Time': totalTime.toString(),
        'X-Compression-Ratio': ((1 - result.bytes / bytes.byteLength) * 100).toFixed(1),
      },
    });
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Upload failed after ${totalTime}ms:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
} 