import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // আপনার নতুন এবং ইউনিক প্যাকেজ আইডি
  appId: 'com.nexusx.app',

  // আপনার অ্যাপের ফাইনাল নাম
  appName: 'NexusX',

  // আপনার React বিল্ড ফোল্ডারের নাম (সাধারণত 'dist' বা 'build')
  // যদি আপনার 'npm run build' কমান্ড দিলে 'dist' ফোল্ডার তৈরি হয়, তবে এখানে 'dist' লিখবেন
 webDir: 'client/dist',

  bundledWebRuntime: false,

  // এন্ড্রয়েড স্পেসিফিক সেটিংস (ঐচ্ছিক কিন্তু ভালো)
  android: {
    allowMixedContent: true
  }
};

export default config;