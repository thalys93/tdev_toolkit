import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';

type HealthOk = { status: 'ok' };
type HealthFailed = { status: 'failed'; error: string };
type HealthSkipped = { status: 'skipped'; reason: string };

export type HealthStatus = HealthOk | HealthFailed | HealthSkipped;

@Injectable()
export class HealthUtils {
  constructor(private readonly dataSource: DataSource) {}

  async checkDatabase(): Promise<HealthOk | HealthFailed> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok' };
    } catch (err) {
      console.error('❌ Database check failed:', err);
      return { status: 'failed', error: err.message };
    }
  }

  async checkCloudinary(): Promise<HealthStatus> {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
      process.env;

    if (
      !CLOUDINARY_CLOUD_NAME ||
      !CLOUDINARY_API_KEY ||
      !CLOUDINARY_API_SECRET
    ) {
      return { status: 'skipped', reason: 'Missing Cloudinary env vars' };
    }

    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });

    try {
      const result = await cloudinary.api.ping();
      return result.status === 'ok'
        ? { status: 'ok' }
        : { status: 'failed', error: 'Unexpected Cloudinary ping result' };
    } catch (err) {
      console.error('❌ Cloudinary check failed:', err);
      return { status: 'failed', error: err.message };
    }
  }
}
