import defaultLogger from '../../utils/logger.js';

export function createUploadService({ logger = defaultLogger } = {}) {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKey = process.env.R2_ACCESS_KEY_ID;
  const secretKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || 'kanata';
  const publicDomain = process.env.R2_PUBLIC_DOMAIN;

  return {
    async uploadFile(file) {
      if (!file) throw new Error('File upload tidak ditemukan.');
      logger.info(`Processing file upload: ${file.originalname}`, 'UPLOAD');

      if (accountId && accessKey && secretKey) {
        try {
          const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
          const s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
              accessKeyId: accessKey,
              secretAccessKey: secretKey,
            },
          });

          const uniqueFilename = `${Date.now()}-${file.originalname}`;
          await s3Client.send(
            new PutObjectCommand({
              Bucket: bucketName,
              Key: uniqueFilename,
              Body: file.buffer,
              ContentType: file.mimetype,
            })
          );

          let baseUrl = publicDomain
            ? `https://${publicDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')}`
            : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com`;

          return {
            filename: uniqueFilename,
            original_name: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            url: `${baseUrl}/${uniqueFilename}`,
            provider: 'cloudflare_r2',
          };
        } catch (r2Err) {
          logger.warn(`R2 upload failed, fallback to local storage: ${r2Err.message}`, 'UPLOAD');
        }
      }

      // Local storage fallback
      const fs = await import('fs/promises');
      const path = await import('path');
      const uploadDir = path.join(process.cwd(), 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      const safeFilename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadDir, safeFilename);
      await fs.writeFile(filePath, file.buffer);

      const serverDomain = process.env.PUBLIC_DOMAIN || 'https://apiku.irengcloud.com';
      return {
        filename: safeFilename,
        original_name: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `${serverDomain}/uploads/${safeFilename}`,
        provider: 'local_storage',
      };
    },
  };
}
