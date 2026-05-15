const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: 'admin',
    secretKey: '62146214'
});

// একটি সিম্পল টেক্সট ফাইল আপলোড টেস্ট
const metaData = { 'Content-Type': 'text/plain' };
minioClient.putObject('onyxdrift-media', 'test.txt', 'Hello Onyx Drift!', metaData, (err, etag) => {
    if (err) return console.log('Error:', err);
    console.log('Success! File uploaded with ETag:', etag);
});