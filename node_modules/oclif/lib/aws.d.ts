import * as CloudFront from 'aws-sdk/clients/cloudfront';
import * as S3 from 'aws-sdk/clients/s3';
export declare namespace upload {
    interface Options {
        localFile: string;
        s3Params: {
            Bucket: string;
            Key: string;
        };
    }
}
declare const _default: {
    readonly cloudfront: {
        createCloudfrontInvalidation: (options: CloudFront.Types.CreateInvalidationRequest) => Promise<unknown>;
    };
    readonly s3: {
        uploadFile: (local: string, options: S3.Types.PutObjectRequest) => Promise<unknown>;
        headObject: (options: S3.Types.HeadObjectRequest) => Promise<S3.HeadObjectOutput>;
        copyObject: (options: S3.Types.CopyObjectRequest) => Promise<unknown>;
        getObject: (options: S3.Types.GetObjectRequest) => Promise<S3.GetObjectOutput>;
        listObjects: (options: S3.Types.ListObjectsV2Request) => Promise<S3.ListObjectsV2Output>;
        deleteObjects: (options: S3.Types.DeleteObjectsRequest) => Promise<S3.DeleteObjectsOutput>;
    };
};
export default _default;
