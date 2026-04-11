import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  S3,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import DigitalOceanConfig from '../config/object-storage.config';

type ParsedHost = {
  host: string;
  protocol?: string;
};

type ResolvedObjectStorageConfig = {
  bucketName: string;
  region: string;
  protocol: string;
  serviceEndpoint: string;
  originEndpoint: string;
  cdnEndpoint: string;
  publicEndpoint: string;
  configurationIssue?: string;
};

@Injectable()
export class ObjectStorageService {
  private readonly logger = new Logger(ObjectStorageService.name);
  private readonly s3Client: S3Client;
  private readonly resolvedConfig: ResolvedObjectStorageConfig;

  public getOriginEndpoint = (): string =>
    this.resolvedConfig.originEndpoint;

  public getCdnEndpoint = (): string =>
    this.resolvedConfig.cdnEndpoint;

  public getPublicEndpoint = (): string =>
    this.resolvedConfig.publicEndpoint;

  constructor(
    @Inject(DigitalOceanConfig.KEY)
    private readonly config: ConfigType<typeof DigitalOceanConfig>,
  ) {
    this.resolvedConfig = this.resolveConfig();
    this.logResolvedConfiguration();

    this.s3Client = new S3({
      forcePathStyle: false,
      endpoint: this.resolvedConfig.serviceEndpoint,
      region: this.resolvedConfig.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async fileExists(hash: string): Promise<boolean> {
    this.ensureStorageConfiguration();

    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.config.bucketName,
          Key: hash,
        }),
      );
      return true;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotFound') {
          return false;
        }
      }

      throw error;
    }
  }

  async getFileLastModified(hash: string): Promise<Date | null> {
    this.ensureStorageConfiguration();

    try {
      const response = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.config.bucketName,
          Key: hash,
        }),
      );

      return response.LastModified ?? null;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotFound') {
          return null;
        }
      }

      throw error;
    }
  }

  async getFileMeta(hash: string): Promise<Record<string, string> | null> {
    this.ensureStorageConfiguration();

    try {
      const response = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.config.bucketName,
          Key: hash,
        }),
      );

      return response.Metadata ?? null;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotFound') {
          return null;
        }
      }

      throw error;
    }
  }

  async uploadFile(
    fileContent: Buffer | Readable,
    hash: string,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<void> {
    this.ensureStorageConfiguration();

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.config.bucketName,
          Key: hash,
          Body: fileContent,
          ContentType: contentType,
          ACL: 'public-read',
          Metadata: metadata,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Object storage upload failed for bucket=${this.resolvedConfig.bucketName} key=${hash} endpoint=${this.resolvedConfig.serviceEndpoint}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private ensureStorageConfiguration(): void {
    if (!this.resolvedConfig.configurationIssue) {
      return;
    }

    throw new Error(
      `Object storage is misconfigured: ${this.resolvedConfig.configurationIssue}`,
    );
  }

  private logResolvedConfiguration(): void {
    const summary =
      `bucket=${this.resolvedConfig.bucketName || '<missing>'} ` +
      `region=${this.resolvedConfig.region || '<missing>'} ` +
      `serviceEndpoint=${this.resolvedConfig.serviceEndpoint} ` +
      `originEndpoint=${this.resolvedConfig.originEndpoint} ` +
      `cdnEndpoint=${this.resolvedConfig.cdnEndpoint} ` +
      `publicEndpoint=${this.resolvedConfig.publicEndpoint}`;

    if (this.resolvedConfig.configurationIssue) {
      this.logger.warn(
        `Object storage configuration issue detected. ${this.resolvedConfig.configurationIssue}. ${summary}`,
      );
      return;
    }

    this.logger.log(`Object storage configured. ${summary}`);
  }

  private resolveConfig(): ResolvedObjectStorageConfig {
    const bucketName = this.config.bucketName.trim();
    const endpoint = this.parseHost(this.config.endpoint);
    const publicBaseUrl = this.parseHost(this.config.publicBaseUrl);
    const cdnCustomDomain = this.parseHost(this.config.cdnCustomDomain);
    const protocol = this.resolveProtocol(
      this.config.protocol,
      endpoint.protocol,
      publicBaseUrl.protocol,
      cdnCustomDomain.protocol,
    );
    const region = this.resolveRegion(endpoint.host);
    const serviceHost = this.resolveServiceHost(endpoint.host, bucketName, region);
    const originHost = this.resolveOriginHost(endpoint.host, bucketName, region);
    const cdnHost = this.resolveCdnHost(
      cdnCustomDomain.host,
      endpoint.host,
      bucketName,
      region,
      originHost,
    );

    return {
      bucketName,
      region,
      protocol,
      serviceEndpoint: `${protocol}://${serviceHost}`,
      originEndpoint: `${protocol}://${originHost}/`,
      cdnEndpoint: `${protocol}://${this.config.cdnDisabled ? originHost : cdnHost}/`,
      publicEndpoint: `${protocol}://${this.resolvePublicHost(
        publicBaseUrl.host,
        cdnCustomDomain.host,
        originHost,
      )}/`,
      configurationIssue: this.validateResolvedConfig(endpoint.host, bucketName, region),
    };
  }

  private parseHost(value: string): ParsedHost {
    const trimmedValue = value.trim();
    if (trimmedValue === '') {
      return { host: '' };
    }

    if (/^https?:\/\//i.test(trimmedValue)) {
      try {
        const url = new URL(trimmedValue);
        return {
          host: url.host.toLowerCase(),
          protocol: url.protocol.replace(':', '').toLowerCase(),
        };
      } catch {
        return {
          host: trimmedValue
            .replace(/^https?:\/\//i, '')
            .replace(/^\/+|\/+$/g, '')
            .replace(/\/.*$/, '')
            .toLowerCase(),
        };
      }
    }

    return {
      host: trimmedValue
        .replace(/^\/+|\/+$/g, '')
        .replace(/\/.*$/, '')
        .toLowerCase(),
    };
  }

  private resolveProtocol(
    configuredProtocol: string,
    endpointProtocol?: string,
    cdnProtocol?: string,
  ): string {
    const protocol = configuredProtocol
      .trim()
      .replace(/^https?:\/\//i, '')
      .replace(/:$/, '')
      .toLowerCase();
    return protocol || endpointProtocol || cdnProtocol || 'https';
  }

  private resolveRegion(endpointHost: string): string {
    const configuredRegion = this.config.region.trim().toLowerCase();
    if (configuredRegion !== '') {
      return configuredRegion;
    }

    if (endpointHost.endsWith('.digitaloceanspaces.com')) {
      return endpointHost.replace('.digitaloceanspaces.com', '').split('.')[0] ?? '';
    }

    return '';
  }

  private resolveServiceHost(
    endpointHost: string,
    bucketName: string,
    region: string,
  ): string {
    const bucketPrefix = bucketName ? `${bucketName.toLowerCase()}.` : '';
    const hostWithoutBucket =
      bucketPrefix !== '' && endpointHost.startsWith(bucketPrefix)
        ? endpointHost.slice(bucketPrefix.length)
        : endpointHost;

    if (hostWithoutBucket === 'digitaloceanspaces.com') {
      return region ? `${region}.${hostWithoutBucket}` : hostWithoutBucket;
    }

    return hostWithoutBucket;
  }

  private resolveOriginHost(
    endpointHost: string,
    bucketName: string,
    region: string,
  ): string {
    if (!bucketName) {
      return endpointHost;
    }

    if (endpointHost.startsWith(`${bucketName.toLowerCase()}.`)) {
      return endpointHost;
    }

    const serviceHost = this.resolveServiceHost(endpointHost, bucketName, region);
    return `${bucketName}.${serviceHost}`;
  }

  private resolveCdnHost(
    customCdnHost: string,
    endpointHost: string,
    bucketName: string,
    region: string,
    originHost: string,
  ): string {
    if (customCdnHost !== '') {
      return customCdnHost;
    }

    if (
      bucketName &&
      region &&
      (endpointHost === 'digitaloceanspaces.com' ||
        endpointHost.endsWith('.digitaloceanspaces.com'))
    ) {
      return `${bucketName}.${region}.cdn.digitaloceanspaces.com`;
    }

    return originHost;
  }

  private resolvePublicHost(
    publicBaseUrlHost: string,
    customCdnHost: string,
    originHost: string,
  ): string {
    if (publicBaseUrlHost !== '') {
      return publicBaseUrlHost;
    }

    if (customCdnHost !== '' && !this.config.cdnDisabled) {
      return customCdnHost;
    }

    return originHost;
  }

  private validateResolvedConfig(
    endpointHost: string,
    bucketName: string,
    region: string,
  ): string | undefined {
    if (!bucketName) {
      return 'DO_SPACES_BUCKET_NAME is missing';
    }

    if (!endpointHost) {
      return 'DO_SPACES_ENDPOINT is missing';
    }

    if (endpointHost === 'http' || endpointHost === 'https') {
      return `DO_SPACES_ENDPOINT is "${endpointHost}". It must be a hostname such as "digitaloceanspaces.com" or "sfo3.digitaloceanspaces.com", not the protocol`;
    }

    if (
      (endpointHost === 'digitaloceanspaces.com' ||
        endpointHost.endsWith('.digitaloceanspaces.com')) &&
      !region
    ) {
      return 'DO_SPACES_REGION is missing for the configured DigitalOcean Spaces endpoint';
    }

    return undefined;
  }
}
