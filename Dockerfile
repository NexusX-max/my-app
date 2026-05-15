# ১. স্ট্যাবল নোড ইমেজ
FROM node:20-alpine

# ২. ডিরেক্টরি সেটআপ
WORKDIR /app

# ৩. নেটওয়ার্ক এরর এড়াতে এনপিএম কনফিগারেশন
RUN npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5

# ৪. শুধু প্যাকেজ ফাইলগুলো আগে কপি করা
COPY package*.json ./

# ৫. ডিপেন্ডেন্সি ইন্সটল করা (Conflict এড়াতে --legacy-peer-deps যোগ করা হয়েছে)
# এটি multer-storage-cloudinary এর ভার্সন সমস্যা সমাধান করবে
RUN npm install --production --legacy-peer-deps

# ৬. প্রজেক্টের বাকি সব কোড কপি করা
COPY . .

# ৭. ওনিক্সড্রিফট এর পোর্ট
EXPOSE 10000

# ৮. অ্যাপ রান করা
CMD ["npm", "start"]