import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { AppError } from '@utils/AppError.js';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const AVATARS_DIR = path.join(UPLOADS_DIR, 'avatars');
const PRODUCTS_DIR = path.join(UPLOADS_DIR, 'products');

// Ensure directories exist
for (const dir of [UPLOADS_DIR, AVATARS_DIR, PRODUCTS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function createStorage(destination: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });
}

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('INVALID_FILE_TYPE', 'Only JPG, PNG, and WebP files are allowed', 400));
  }
}

const avatarUpload = multer({
  storage: createStorage(AVATARS_DIR),
  limits: { fileSize: MAX_AVATAR_SIZE },
  fileFilter,
});

const productImagesUpload = multer({
  storage: createStorage(PRODUCTS_DIR),
  limits: { fileSize: MAX_PRODUCT_IMAGE_SIZE },
  fileFilter,
});

export function uploadAvatar(req: Request, res: Response, next: NextFunction): void {
  avatarUpload.single('avatar')(req, res, next);
}

export function uploadProductImages(req: Request, res: Response, next: NextFunction): void {
  productImagesUpload.array('images', 10)(req, res, next);
}
